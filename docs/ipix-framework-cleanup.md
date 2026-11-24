# iPix OpenBot framework cleanup

The iPix fork builds Mastra, LangGraph AG-UI and LangGraph TypeScript. Other
local harness source directories are retired. Bring-your-own AG-UI remains
available for external endpoints. Historical release manifests, model-provider
metadata and parsing/compatibility fixtures are retained where they are needed
to read existing state; they do not install retired harnesses.

## Verification and merge gates

- Local server development: retain the three source directories, default agent
  selection, Compose service wiring and published image/CI matrix agreement.
- Existing database, credentials, configuration and running containers are not
  migrated or changed by this source cleanup.
- Desktop Claude subscription sign-in is NOT certified by this change. The
  upstream installer expects the removed Claude SDK image; do not release a
  desktop installer or merge until that option is explicitly disabled or
  supported through an approved alternative, with matching tests.
- Audit remaining desktop historical harness tests, UI selection tests,
  full CI and a clean-checkout runtime smoke before marking ready.
