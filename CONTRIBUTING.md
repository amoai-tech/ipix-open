# Contributing to OpenBot

Thanks for helping. Open a pull request against `main` from your fork, and say in its description
what it changes and why.

## Don't break the API or the database

**Before you change anything under `api/`, an app's requests, a database change or
`release-policy.json`, read [docs/api-and-migrations.md](docs/api-and-migrations.md). Not
optional.** OpenBot is live. Anything a released app uses keeps working for 12 months, and a
migration never breaks a running server. CI enforces most of it; the page says what and how.

## How CI runs on your pull request

- **A maintainer approves it first.** CI on a pull request from an outside contributor waits for a
  maintainer to approve it before it runs.
- **It runs on GitHub's standard hosted runners.** Each PR has its own CI queue; a newer push
  replaces that PR's stale run, not another contributor's run.
- **Desktop validation is selective.** Native Linux and Docker regressions run for affected
  desktop inputs. Full installer packaging, historical upgrade tests and signing validation are explicit
  Actions runs or part of the release process. See [iPix CI policy](docs/ipix-ci.md).
- **A new push starts a new run.** If you push again while a run is waiting, the newer commit is
  the one that gets checked.

Locally, `bun install` and then `bun test` runs the suite, `bun run lint` and `bun run format:check`
run the linters, and `bun run typecheck` checks the types.
