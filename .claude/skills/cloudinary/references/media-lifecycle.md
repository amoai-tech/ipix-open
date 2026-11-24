# Authorized media lifecycle (only for actual uploads/changes)

**Target:** standalone `ipix-open`, Supabase owns brand/asset metadata, Cloudinary owns bytes/transformations. No deployed legacy iPix API calls. Verify existing destination files and current SDK first.

## Read an existing image

1. Establish current user, brand membership and resource visibility in the **server**.
2. Read the asset's metadata and approved delivery policy from iPix Supabase.
3. Return an appropriate authorized delivery URL/transform; a public ID is a locator, not an access grant.
4. On expired access, denial or missing asset, give an honest error. Never expose another brand's record.

## Upload or transform

1. **ADAPT** only needed legacy helpers after inspecting installed Cloudinary SDK; destination must be a reviewed iPix Open server module (path to be determined).
2. Server authorizes the brand/resource and creates a scoped, time-bounded signature/parameter set; keep Cloudinary API secret server-side.
3. Client uploads using only authorized parameters; verify the returned public ID and relevant asset metadata before creating a business link.
4. Server idempotently stores brand/shoot/shot association and required approval status in Supabase. If Cloudinary succeeds but DB persistence fails, record a recoverable reconciliation state, not a false success.
5. For asynchronous notifications, verify the Cloudinary webhook signature before processing; deduplicate events, tolerate out-of-order notifications and retry safely. Do not trust notification content as authorization.
6. Human approval precedes publishing, deleting or other consequential changes; server rechecks current actor, exact action and revision.

## Reference → destination → proof

- **REFERENCE ONLY:** https://cloudinary.com/documentation/authentication_signatures → signed upload and verification constraints; do not create browser-visible signing secrets. **Destination:** reviewed iPix Open upload authorization module, exact file chosen during task. **Verify:** expired/modified signature denial.
- **ADAPT:** https://github.com/amoai-tech/ipixai/tree/13bf2af385ebbe68a78c652daf5cffa3db95df24/src → approved legacy Cloudinary utilities after inspection, not a direct runtime dependency. **Destination:** verified iPix Open media service. **Verify:** trusted upload response, metadata readback.
- **REFERENCE ONLY:** https://cloudinary.com/documentation/notifications → delivery and webhook behavior, signature verification, retries. **Destination:** only the existing or justified webhook handler. **Verify:** invalid/replayed event denies or no-ops.

## Concrete example

A brand uploads 200 campaign images; 198 link successfully, two need retry. Reporting must show **198 confirmed assets and 2 pending/recoverable**, never 200 completed solely because Cloudinary accepted the uploads. Brand B receives no links to Brand A's private assets.
