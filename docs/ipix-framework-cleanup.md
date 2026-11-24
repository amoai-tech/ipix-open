# iPix OpenBot framework cleanup

The fork retires ten unused local framework source directories, leaving Mastra,
LangGraph AG-UI, LangGraph TypeScript and Claude Agent SDK. Claude SDK is a
temporary compatibility dependency for the existing desktop Claude subscription
sign-in, image manifest, Compose profile and native tests. Removing it requires
a separate coordinated subscription-path retirement; do not remove it alone.

The shared catalogue retains external-agent names and marks, old Bot subtitle
normalization and API enum compatibility. Retired entries use localInstall:
false: desktop does not offer them for local installation, and a saved retired
choice fails with guidance instead of silently switching an agent. External
AG-UI connections continue to use the existing identity and endpoint flow.

Published images, CI matrices and source model probes cover retained engines
only. Historical releases and model test fixtures remain readable.
No database, credentials or running deployment changes. Verify native desktop
tests, full CI, and clean-checkout smoke before release.
