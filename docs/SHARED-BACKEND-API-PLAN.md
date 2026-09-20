# Shared backend API and agent connector

Branch: `codex/shared-backend-api`

## Decisions

- Keep one SvelteKit application and deployment. Convex remains the database.
- Preserve remote functions for the website; expose a versioned REST API for mobile and other clients.
- Remote functions, REST, and MCP tools call shared application behavior. External callers never supply an authoritative user ID.
- Expose places/search, saved spots, ratings, notes, visited status, social links, tags, user preferences, and the existing AI capability.
- Each account owns its private data. Connecting an agent never grants access to another account.
- Agent clients connect through OAuth and a small MCP endpoint in the same app.
- Users choose read-only (`bite:read`) or full (`bite:read bite:write`) connector access. Full access includes deletion.
- A saved location belongs to the user. An explicit search location overrides it. Assumption: one default is shared by all clients.
- Preserve permanent deletion of a user's saved spot; never delete the shared place catalog as a consequence. Trash/undo is out of scope.
- SSE and cross-client push updates are deferred. Do not add polling.

## Structure

Keep domain contracts and application logic independent of SvelteKit request globals. HTTP and remote handlers translate requests into validated operations. Convex adapters perform authenticated calls; Convex verifies identity/permissions and owns atomic writes. Group new backend code by concern without relocating unrelated frontend files.

The website may retain its existing response shapes. REST exposes explicit schemas, cursor pagination, predictable status codes, and structured errors. MCP calls the same application operations and declares read/write annotations; annotations never replace authorization.

## Implemented surface

REST is rooted at `/api/v1`; its OpenAPI document is `/api/v1/openapi.json`.

| Resource | Operations |
| --- | --- |
| `/spots`, `/spots/{id}` | list, read, save, update, delete |
| `/tags`, `/tags/{id}` | list, read, create, rename, delete |
| `/places`, `/places/{id}` | list and read the shared catalog |
| `/places/search` | server-side Google Places text search |
| `/me` | current account identifier and granted scopes |
| `/me/preferences` | read or replace the saved default location |
| `/ai/responses` | existing non-streaming AI text capability |

The MCP Streamable HTTP endpoint is `/mcp`. It is stateless and uses JSON responses; GET/SSE and persistent sessions are intentionally absent. Each REST application operation is also registered as an MCP tool.

## Implementation sequence

1. Establish baseline tests and create the branch. Preserve pre-existing edits.
2. Add shared validated contracts, errors, request identity, and backend composition. Bring tags into shared application behavior.
3. Add paginated REST resources under `/api/v1`: spots, tags, places, place search, current account, preferences, and AI responses. Publish an OpenAPI description.
4. Persist per-user default location. Add website settings through remote functions. Use explicit location, then saved default, for server-side searches.
5. Add OAuth provider support using Better Auth's maintained provider plugin and a local Convex auth component. Preserve existing auth tables/records; use separately named OAuth tables to avoid colliding with legacy plugin tables.
6. Add consent for read-only/full access, discovery metadata, resource-bound token verification, connection revocation, and stateless MCP tools at `/mcp`. Verify permissions in Convex as well as the application layer.
7. Test anonymous/cross-user access, read-only mutation rejection, invalid input, pagination, preferences, REST, and MCP behavior. Run typecheck, tests, and production build. Validate deployment prerequisites without publishing production changes.

## Authentication and rollout

Website sessions continue to use Better Auth. Native clients can use the same accounts with an appropriate native sign-in flow; building a mobile app is out of scope. OAuth connector tokens must be validated for issuer, expiry, audience, subject, and scope. A cookie session must not silently override a supplied invalid bearer token.

OAuth deployment requires canonical public site URLs, matching discovery metadata and callback configuration, and testing in each agent host. Server-side Google Places search requires a server-appropriate `GOOGLE_PLACES_API_KEY`; AI requires `OPENAI_API_KEY`. Do not repurpose or expose browser keys. Production deployment and individual agent account linking are rollout steps after branch verification.

ChatGPT or another MCP host should be given the public `/mcp` URL. It discovers `/.well-known/oauth-protected-resource/mcp`, dynamically registers an OAuth client, and sends the resource parameter so the resulting JWT is audience-bound to `/mcp`. A native REST client must request the equivalent `/api/v1` resource. Tokens without a resource are opaque Better Auth tokens and are deliberately not accepted by these resource servers.

Before production rollout:

1. Set the Convex production `SITE_URL` to the exact public SvelteKit origin and deploy Convex first.
2. Confirm the SvelteKit `PUBLIC_SITE_URL`, `PUBLIC_CONVEX_URL`, and `PUBLIC_CONVEX_SITE_URL` point to that same production pair.
3. Set `GOOGLE_PLACES_API_KEY` and `OPENAI_API_KEY` as Worker secrets; do not place them in public variables.
4. Deploy SvelteKit, then verify protected-resource metadata, OAuth discovery, `/api/auth/convex/jwks`, dynamic client registration, consent, refresh, revocation, and one read/write operation from each agent host.
5. Start connections as read-only and opt into full access only when write/delete behavior is wanted.

## Baseline

- Existing tests: 117 passing across 12 files.
- Existing `npm run check`: 16 errors and 13 warnings, including migration inference, UI prop types, the legacy in-memory adapter, and experimental AI routes. Record final results separately so new defects are distinguishable.

## Verification and completion

- Branch created: `codex/shared-backend-api`.
- Convex development functions and the local Better Auth component were deployed for verification. Production was not deployed.
- The local auth component preserves the installed component's existing tables and indexes byte-for-byte, then adds separately named connector tables.
- `npm run check`: 0 errors, 12 pre-existing warnings.
- `npm test`: 17 files and 139 tests passing (117 baseline tests plus shared-operation, REST, MCP, auth, preferences, and Google adapter coverage).
- `npm run build`: successful Cloudflare production build. Existing Svelte accessibility/CSS, sourcemap, bundle-size, and missing Sentry-token warnings remain.
- Workerd smoke test: OpenAPI 200, unauthenticated REST 401 with structured JSON, protected-resource metadata 200, and unauthenticated MCP 401 with `WWW-Authenticate` metadata.
- Development end-to-end auth check through SvelteKit: OAuth discovery 200, shared JWKS 200 with RSA/RS256, OpenAPI 200. Dynamic client registration was verified and its temporary test record was removed.
- No SSE, WebSocket, or polling behavior was added.
