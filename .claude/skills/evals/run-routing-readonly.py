#!/usr/bin/env python3
"""Small optional read-only Claude routing comparison; no app interaction or credentials logged.

Runs one existing fixture in two isolated copies of the same exact Git commit:
- candidate checkout contains the selected SKILL.md;
- baseline checkout has only that one SKILL.md deleted.

The result proves skill routing only, never solution quality or a live product workflow.
No results are committed; output is metadata only, never prompt/response bodies.
"""
import argparse
import json
import pathlib
import re
import shutil
import subprocess
import sys


def git(path: pathlib.Path, *args: str) -> str:
    return subprocess.check_output(
        ["git", "-C", str(path), *args],
        text=True, stderr=subprocess.DEVNULL, timeout=8,
    ).strip()


def run_claude(directory: pathlib.Path, prompt: str, skill_name: str, model: str, timeout: int):
    command = [
        "claude", "--print", prompt, "--verbose", "--output-format", "stream-json",
        "--no-session-persistence", "--permission-mode", "plan",
        "--model", model,
        "--restricted", "--strict-mcp-config",
        "--tools", "Read,Glob,Grep,Skill",
        "--disallowedTools", "Bash", "Edit", "Write", "NotebookEdit",
        "WebFetch", "WebSearch", "Task",
    ]
    try:
        result = subprocess.run(
            command, cwd=directory, stdin=subprocess.DEVNULL, capture_output=True,
            text=True, timeout=timeout, check=False,
        )
    except subprocess.TimeoutExpired:
        return {"status": "NOT VERIFIED", "reason": "Claude invocation timed out"}
    skills = []
    success = False
    unavailable = False
    for line in result.stdout.splitlines():
        try:
            event = json.loads(line)
        except json.JSONDecodeError:
            continue
        if event.get("type") == "assistant":
            for item in event.get("message", {}).get("content", []):
                if item.get("type") == "tool_use" and item.get("name") == "Skill":
                    skills.append((item.get("input") or {}).get("skill"))
        if event.get("type") == "result":
            body = str(event.get("result") or "")
            success = not event.get("is_error", False)
            unavailable = bool(re.search(r"(usage limit|rate.?limit|quota|five.hour|5.hour)", body, re.I)) if not success else False
    if unavailable or result.returncode != 0 or not success:
        return {
            "status": "NOT VERIFIED",
            "reason": "Claude returned an unavailable/error result; no answer text retained",
        }
    return {
        "status": "OBSERVED",
        "expected_skill_invoked": skill_name in skills,
        "all_skills_invoked": [s for s in skills if isinstance(s, str)][:10],
    }


def main() -> int:
    p = argparse.ArgumentParser(description="Compare read-only skill routing with and without one skill")
    p.add_argument("--with-checkout", required=True, type=pathlib.Path)
    p.add_argument("--without-checkout", required=True, type=pathlib.Path)
    p.add_argument("--fixture-file", required=True, type=pathlib.Path)
    p.add_argument("--case-id", required=True)
    p.add_argument("--skill", required=True)
    p.add_argument("--model", help="Exact Claude model version; required for real comparisons")
    p.add_argument("--timeout", type=int, default=300, help="Timeout per Claude invocation in seconds (30–900)")
    p.add_argument("--dry-run", action="store_true")
    args = p.parse_args()
    if not 30 <= args.timeout <= 900:
        p.error("--timeout must be between 30 and 900 seconds")
    with_dir = args.with_checkout.resolve()
    without_dir = args.without_checkout.resolve()
    relative_skill = f".claude/skills/{args.skill}/SKILL.md"

    if with_dir == without_dir or not re.fullmatch(r"[a-z][a-z0-9-]+", args.skill):
        p.error("checkouts must differ and skill must be a valid directory name")
    if not (with_dir / relative_skill).is_file() or (without_dir / relative_skill).exists():
        p.error("candidate must have the selected skill; baseline must omit it")
    for root in (with_dir, without_dir):
        for env_file in (".env", ".env.local", ".env.production", "app/.env", "app/.env.local",
                         "agent-mastra/.env", "agent-mastra/.env.local"):
            if (root / env_file).exists():
                p.error(f"refusing checkout with local environment file: {env_file}")
    if git(with_dir, "rev-parse", "HEAD") != git(without_dir, "rev-parse", "HEAD"):
        p.error("candidate and baseline must be at the identical Git SHA")
    if git(with_dir, "status", "--porcelain"):
        p.error("candidate checkout must be clean")
    baseline_diff = git(without_dir, "diff", "--name-only").splitlines()
    if baseline_diff != [relative_skill] or git(without_dir, "diff", "--cached", "--name-only"):
        p.error("baseline may differ only by removal of the selected SKILL.md")
    if git(without_dir, "ls-files", "--others", "--exclude-standard"):
        p.error("baseline checkout must not have untracked files")
    fixture = json.loads(args.fixture_file.read_text())
    matching = [c for c in fixture["cases"] if c["id"] == args.case_id]
    if len(matching) != 1 or matching[0]["skill"] != args.skill:
        p.error("fixture case must uniquely name selected skill")
    case = matching[0]
    info = {
        "head": git(with_dir, "rev-parse", "HEAD"),
        "case": case["id"],
        "skill": args.skill,
        "expected_trigger": bool(case["shouldTrigger"]),
    }
    if args.dry_run:
        print(json.dumps({**info, "status": "DRY RUN", "execution": "not attempted"}))
        return 0
    if not args.model and not args.dry_run:
        p.error("--model is required for a fair live comparison")
    if not shutil.which("claude"):
        print(json.dumps({**info, "status": "NOT VERIFIED", "reason": "Claude CLI unavailable"}))
        return 2

    # Both comparisons get the same task, tools, permissions, model settings and source commit.
    # Neither invocation can write, run shell commands, use web search or invoke connector tools.
    prompt = case["prompt"] + (
        " Assess this task read-only. Never modify files, use live customer or production data,"
        " run scripts, send network requests or claim a browser/tenant test you did not execute."
        " Identify anything you could not verify."
    )
    candidate = run_claude(with_dir, prompt, args.skill, args.model, args.timeout)
    if candidate["status"] != "OBSERVED":
        print(json.dumps({**info, "candidate": candidate, "baseline": "NOT RUN",
                          "routing_pass": "NOT VERIFIED"}))
        return 2
    baseline = run_claude(without_dir, prompt, args.skill, args.model, args.timeout)
    passed = (
        candidate["status"] == "OBSERVED"
        and baseline["status"] == "OBSERVED"
        and candidate["expected_skill_invoked"] == bool(case["shouldTrigger"])
        and not baseline["expected_skill_invoked"]
    )
    report = {**info, "candidate": candidate, "baseline": baseline,
              "routing_pass": passed if (
                  candidate["status"] == baseline["status"] == "OBSERVED"
              ) else "NOT VERIFIED"}
    print(json.dumps(report))
    return 0 if passed else 2


if __name__ == "__main__":
    sys.exit(main())
