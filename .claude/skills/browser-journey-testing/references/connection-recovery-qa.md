# QA scenario — conversation recovers after an interrupted connection

**Scope:** Existing OpenBot channel conversation, **not** the un-migrated fashion Planner. A scenario and reproduction checklist; **not a completed browser run**.

## Reuse real existing OpenBot code

- `app/tests/connection-lost-conversation.test.tsx` exercises the actual `ChannelChat` UI, line/connection banner and recovery behavior; it mocks the HTTP server at the API boundary. The fixture returns an actual 502 `OpenBot could not be reached.`.
- `app/tests/connection-lost-conversation-route.test.tsx` exercises the existing `app/src/routes/_authed/_app/channel/$channelId.tsx` route, including the empty/error state while the server is unreachable. It also mocks HTTP.
- `app/tests/channel-history-refresh.test.tsx` exercises the CopilotKit SSE connection, thread history and refresh/recovery of stored messages. It mocks the server boundary, not a live database.

**Local regression:** After checking installed scripts and dependencies, run these focused files from a properly installed checkout, then report actual results. Passing these files is useful **simulated** regression proof, not evidence of an authenticated multi-server rollout.

## Real browser acceptance in an isolated nonproduction QA tenant

1. **Preflight** — Record exact PR SHA, QA origin and designated test-only Bot/tenant, auth issuer, database and memory target. Confirm the server and persistent conversation endpoint are real and point to the same *nonproduction* environment. Never use a personal browser session, production tokens, or customer conversation. If unavailable, mark **NOT VERIFIED** and do not improvise.
2. **Baseline** — In a fresh isolated browser profile, sign in as the QA actor. Open an existing channel, send `qa-reconnect-<unique synthetic marker>`; record the message/thread ID using the authorized API or UI and the network request that accepted the message. Avoid recording auth headers.
3. **Interrupt** — Induce a reversible connection outage *only in the isolated QA harness* (for example test transport failure of `/api/copilotkit/*` returning HTTP 502; never take down shared staging or production). Capture the actual failed request, response/status, visible connection banner and console errors.
4. **Recover and reload** — Restore the endpoint, reconnect, **refresh**, return to the same channel and verify the saved marker and assistant reply appear once without clicking another conversation. Check request/response statuses, rejoined thread identity and zero duplicate messages.
5. **Read back** — Independently fetch stored messages through the **authorized QA API**, confirm canonical thread ID, marker and persisted message IDs, and compare with the refreshed UI. If a proposed action had been approved, separately prove saved domain record exactly once; a chat transcript alone is not shoot persistence.
6. **Fail safely** — Verify no credential leaks, wrong-tenant data or automatic repeat of an already approved write. Keep redacted console/network summary and safe screenshot links, exact SHA, test account class and outcome.

## Evidence record

| Check | Expected evidence | Report when unavailable |
| --- | --- | --- |
| UI before interruption | Synthetic message visible in correct channel | NOT VERIFIED |
| Network failure | Actual failed `/api/copilotkit` or runtime request + status | NOT VERIFIED |
| Reconnect | Stream recovers / errors clearly shown | NOT VERIFIED |
| Refresh/reload | Same stored message appears once | NOT VERIFIED |
| Independent readback | Authorized API returns exact persisted thread/message IDs | NOT VERIFIED |
| Tenant/approval if affected | Direct denial and exactly-once approved write | NOT VERIFIED or N/A with reason |

**Checkpoint:** PASS only with actual observed browser + network + authorized readback on the same nonproduction environment. Synthetic unit tests or an agent saying “verified” cannot replace it.
