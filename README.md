# SBR Real Estate — Phase 2

A strict-TypeScript real estate platform with **two independent apps**, indexed MongoDB schemas and complete account authentication. Phase 2 adds registration, email verification, rotating cookie sessions, password recovery, profile editing and admin-only user APIs. Property CRUD and the remaining public content screens belong to later phases.

## Folder structure

```text
realestate/
├── frontend/
│   ├── node_modules/          # Created by npm install; not committed
│   ├── package.json
│   ├── package-lock.json
│   ├── eslint.config.ts
│   ├── .prettierrc.json
│   ├── .prettierignore
│   └── ...                   # Next.js source and configuration
├── backend/
│   ├── node_modules/          # Created by npm install; not committed
│   ├── package.json
│   ├── package-lock.json
│   ├── eslint.config.ts
│   ├── .prettierrc.json
│   ├── .prettierignore
│   └── ...                   # NestJS source and configuration
├── .gitignore
└── README.md
```

There is **no npm workspace, root package.json, root lockfile, or root node_modules requirement**. Each app owns its dependencies, lockfile, lint/format configuration, and commands. Run npm commands inside the relevant folder, not at the repository root.

## Prerequisites

- **Node.js 22.12+**, npm 10+ (Node 22 LTS recommended).
- MongoDB 7+ (8 recommended) and Redis 7+ for the backend.
- An SMTP account (or local SMTP test server) for verification/recovery email.
- Network access to Google Fonts during an initial frontend dev/build. `next/font/google` downloads Inter and Playfair Display and self-hosts them for visitors.

## Migrating from the previous shared setup

Stop any running development servers and update your checkout. The tracked root package/config files are removed by this change, but Git does not remove ignored dependency directories.

If a root-level `node_modules` folder remains from the old setup, delete **only that generated dependency folder**, then install each app separately. From the repository root in PowerShell:

```powershell
if (Test-Path node_modules) { Remove-Item -Recurse -Force node_modules }
```

Do not delete your local `.env` files or application source folders.

## 1. Frontend setup

Open a terminal in the repository root:

```powershell
cd frontend
npm install
Copy-Item .env.example .env.local
npm run dev
```

**Skip the environment-file copy if `.env.local` already exists**, to preserve your settings. On macOS/Linux, use `cp .env.example .env.local` instead of `Copy-Item`.

Frontend: **http://localhost:3000**.

Edit `frontend/.env.local` as needed:

- `NEXT_PUBLIC_API_URL`: API base URL, including its prefix.
- `NEXT_PUBLIC_APP_URL`: public frontend origin.
- `NEXT_PUBLIC_APP_NAME`: public brand name.
- Cloudinary cloud name and verified business/social details are optional foundation settings. Until contact/social details are supplied, the footer clearly marks them unavailable rather than inventing information.

Public settings are validated with Zod. `NEXT_PUBLIC_*` values are public and embedded at build time; never put secrets in them. Rebuild after changing them for production.

## 2. Backend setup

Open a **second terminal**, starting again from the repository root:

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

**Skip the copy if `.env` already exists.** On macOS/Linux, use `cp .env.example .env`.

Configure `backend/.env`, start MongoDB and Redis, then run:

```powershell
npm run dev
```

Backend: **http://localhost:5000/api**. Swagger: **http://localhost:5000/api/docs**, development only. Both servers bind to `0.0.0.0` for remote development. The backend also retains `npm run start:dev` as an alias.

Backend environment settings:

- Configure `MONGODB_URI`, `REDIS_HOST`, `REDIS_PORT`, and optional `REDIS_PASSWORD`.
- Set `FRONTEND_URL` to the exact frontend origin, without a trailing slash; comma-separated exact origins are supported, wildcards are rejected.
- Replace both JWT example secrets with distinct random strings of at least 32 characters. For example, run `openssl rand -base64 48` twice. Never reuse access and refresh secrets.
- `NODE_ENV` supports `development`, `test`, `staging`, and `production`. Staging/production reject placeholder/shared JWT secrets and non-HTTPS frontend origins. Inject production secrets through your deployment environment.
- Set `APP_URL` to the frontend origin used in recovery links; it must match an entry in `FRONTEND_URL`.
- Configure `JWT_ISSUER`, `JWT_AUDIENCE`, `JWT_EXPIRES_IN=15m` and `JWT_REFRESH_EXPIRES_IN=7d`. Durations accept positive integer `s`, `m`, `h` or `d` values up to 31 days.
- Set all `SMTP_*` values to a working SMTP account. Port 465 uses implicit TLS; port 587 uses STARTTLS when offered. Invalid SMTP credentials surface as retried email-job failures, not fake delivery success. Cloudinary settings are reserved for media management.
- `AUTH_COOKIE_SAME_SITE=lax` suits same-site deployments. Use `none` only with HTTPS staging/production for cross-site cookies (subject to browser third-party-cookie restrictions). Prefer the same-origin API proxy.
- Set `TRUST_PROXY_HOPS` to the exact trusted reverse-proxy hop count (0 by default, maximum 5). Incorrect proxy trust undermines IP-based rate limiting.
- `THROTTLE_TTL` and `THROTTLE_LIMIT` remain general validated settings. Authentication has separate stricter per-route Redis limits, with 429/`Retry-After` responses; limiter outages fail closed with 503.

### Optional local database services

If Docker is already installed, these commands create disposable local services (PowerShell or a shell):

```text
docker run -d --name sbr-mongo -p 127.0.0.1:27017:27017 -v sbr-mongo-data:/data/db mongo:8
docker run -d --name sbr-redis -p 127.0.0.1:6379:6379 -v sbr-redis-data:/data redis:7-alpine redis-server --appendonly yes
```

Skip creation if the named containers already exist; start those existing containers instead. These unauthenticated examples bind only to loopback. Never expose unprotected database/cache ports publicly; use authenticated private infrastructure and TLS in staging/production.

MongoDB must be available during API boot. Redis readiness returns 503 when disconnected. Missing infrastructure is never reported as healthy.

## Same-origin proxy / Arena previews

A remote browser cannot reach the server's localhost address. In `frontend/.env.local`, use:

```dotenv
NEXT_PUBLIC_API_URL=/api
API_PROXY_TARGET=http://127.0.0.1:5000/api
```

`API_PROXY_TARGET` is server-only and may point to any reachable backend service. Include its configured API prefix. Next proxies the browser's `/api/...` requests server-side. Set backend `FRONTEND_URL` and `APP_URL` to the actual public frontend origin. Cookie-authenticated mutations require a matching browser `Origin` header; command-line clients can instead supply explicit bearer/body credentials without cookies. Restart/rebuild Next after changing proxy settings. The default localhost URLs in the examples are for same-machine development.

## Verification

Run these commands **inside each app folder**:

```text
npm run typecheck
npm run lint
npm test
npm run format:check
npm run build
npm audit --omit=dev
```

Use `npm ci` instead of `npm install` for a clean reproducible installation from each app's own lockfile. Backend tests/build do not need live infrastructure. Frontend builds require valid public environment settings and Google Fonts network access.

Backend-only HTTP integration suite:

```text
npm run test:e2e
```

With the actual API and dependencies running, verify:

```text
curl -i http://localhost:5000/api/health
curl -i http://localhost:5000/api/health/db
curl -i http://localhost:5000/api/health/redis
curl -i http://localhost:5000/api/missing
```

Successful responses use `{ success, message, data, meta }`, with an ISO timestamp in `meta`. `/health` is process liveness; `/health/db` and `/health/redis` actively ping their dependencies and return **503** on failure. Errors use `{ success: false, message, statusCode, timestamp, path }`. Validation errors contain an array of messages; invalid input maps to 400, duplicate keys to 409, unknown errors to 500, and missing routes to 404. Logs omit query strings and connection credentials.

Frontend routes: `/`, `/properties`, `/about`, `/contact`, `/services`, `/blog`, `/login`, `/register`, `/forgot-password`, `/reset-password?token=…`, `/verify-otp?email=…`, `/dashboard`, `/dashboard/profile`, and `/admin`. Check page metadata, responsive navigation/mobile drawer, keyboard Escape, dark-mode persistence, scroll-to-top, loading skeletons, and the branded 404. Auth routes use minimal branding; dashboard/admin routes use their own shells. Route and root error boundaries are present.

### Verification notes

- Frontend: **54 tests**, including form interactions, six-cell OTP behavior, validation, persistence, Axios retry and refresh races. Backend: **87 unit/HTTP tests**, including real JWTs/guards, cookie policy, rotation/replay, credential writes and schema hooks. MongoDB/Redis/mail are explicitly mocked in these suites; they are not live end-to-end infrastructure tests.
- Both apps are checked with their own local dependencies, with no root `node_modules` present.
- Google Fonts is blocked by this sandbox's outbound allowlist. Frontend build verification uses Next's font-response fixture mechanism with real Inter/Playfair font files fetched from the official Google Fonts GitHub repository. The local fixture is ignored; a normal network-enabled build does not need it. An unconfigured build in this restricted sandbox will fail at font download.
- No live MongoDB/Redis/SMTP service was exercised in the sandbox. Verify actual persistence/index creation, Redis Lua/cooldowns and SMTP delivery with configured services. Browser checks cover responsive auth rendering, validation and unauthenticated redirects; they do not prove delivery or a live login handshake.
- Responsive production-browser smoke checks passed on the final repeated runs (15 auth route/viewport combinations plus validation and protected redirects). Earlier production runs intermittently reported React hydration error #418; it was not reproduced in development or the subsequent diagnostic runs and remains a regression risk to investigate rather than a confirmed fix.
- Production dependency audits reported zero vulnerabilities at verification time. Development tooling has upstream low/moderate transitive advisories; no forced breaking fixes were applied.

## Production build and start

Inside `backend/`:

```text
npm ci
npm run build
npm run start:prod
```

Inside `frontend/`:

```text
npm ci
npm run build
npm start
```

Next is configured with `output: 'standalone'` for later deployment work. For its standalone artifact, use these commands from `frontend/` on macOS/Linux:

```bash
cp -R public .next/standalone/public
mkdir -p .next/standalone/.next
cp -R .next/static .next/standalone/.next/static
HOSTNAME=0.0.0.0 PORT=3000 node .next/standalone/server.js
```

Unlike the previous workspace build, the standalone entry point is directly at `.next/standalone/server.js`; there is no nested `frontend/` path. Supply frontend public settings at build time and backend secrets at runtime. Swagger is disabled outside development. The expressly requested MongoDB `autoIndex: true` remains; review index rollout when actual collections are introduced.

## Stack and Phase 2 boundaries

- **Frontend:** Next.js 15 App Router, React 18, Tailwind CSS 3, Radix-based shadcn/UI, TanStack Query 5, Zustand, React Hook Form/Zod, Framer Motion, Lucide, Axios, `next/image`, and `next/font/google`.
- **Backend:** NestJS 11, Mongoose 8, MongoDB, Redis, BullMQ, Swagger, class-validator/class-transformer, Helmet, compression, and morgan.
- **Tests:** Vitest for frontend utilities/state; Jest/Nest TestingModule/Supertest for the backend pipeline.
- Global JWT and role guards protect APIs unless explicitly public. `/dashboard` requires a session; `/admin` additionally requires `admin`. Client gates are UX only, never the security boundary.
- User/profile APIs expose a strict public-field allowlist, paginate results, and restrict account creation/role changes to administrators. No public admin signup exists. Bootstrap the first administrator through a trusted database operator after registering/verifying an account; change `role` to `admin`, increment `tokenVersion` and unset `refreshToken`, then sign in again. Never ship a seeded admin password.
- Property, Inquiry and Analytics schemas are registered with nested validation, search/compound/GeoJSON indexes and a 90-day analytics TTL. CRUD/analytics ingestion and their public screens remain later-phase work; no fake property data is exposed.
- Inputs reject unexpected fields/operator syntax. Backend text fields use `sanitize-html` with no permitted tags. Passwords are never HTML-sanitized or trimmed; bcrypt inputs are capped at 72 UTF-8 bytes. React escapes all displayed text.
- Access tokens exist only in memory. Zustand persists a profile hint and explicit-logout marker, never tokens or an authoritative login flag. An HTTP-only refresh cookie restores sessions; automatic retries use single-flight refresh and Web Locks where available.
- Query caches are isolated per provider instance. ThemeProvider supports light/dark/system and synchronizes with the UI store; a theme-switcher UI is not part of Phase 1.
- Assets are lightweight original architectural/brand placeholders, not real properties. Social links without verified URLs and legal-policy labels remain visibly unavailable.
- To honor the no-plain-JavaScript rule, configuration uses `next.config.ts`, `postcss.config.json`, and per-app `eslint.config.ts`. Generated JavaScript builds are ignored.
- `shadcn-ui` is deprecated. The compatible shadcn CLI generated configuration but could not download its registry in the sandbox; complete Radix-based TypeScript primitives are included locally. No CLI download is needed to use this checkout.

## Authentication API

All paths below are relative to `/api`. Responses use the common envelope documented above. Swagger includes request DTOs and response statuses.

| Method | Path | Access / behavior |
| --- | --- | --- |
| POST | `/auth/register` | Public; first/last name, email, password, optional phone; role `user` (buyer) or `agent` only |
| POST | `/auth/login` | Public; email, password, optional `rememberMe`; returns public user and tokens |
| POST | `/auth/refresh` | Public handshake; HTTP-only cookie or explicit `refreshToken` body; single-use rotation |
| POST | `/auth/logout` | Access token; revokes current generation and clears cookie |
| POST | `/auth/forgot-password` | Public; email; always generic acknowledgement |
| POST | `/auth/reset-password` | Public; token and `newPassword`; 15-minute single-use reset |
| POST | `/auth/verify-otp` | Public; email and six-digit `otp`; 10 minutes / five attempts |
| POST | `/auth/resend-otp` | Public; email; generic acknowledgement, 60-second cooldown |
| GET | `/auth/me` | Current active user |
| PATCH | `/auth/change-password` | Current password and `newPassword`; signs out all sessions |
| PATCH | `/users/me` | Current user; first/last name, phone (empty clears), approved Cloudinary avatar URL |
| GET | `/users` | Admin; `page`, `limit` (maximum 100), allowlisted `sort` |
| POST | `/users` | Admin; creates account (including explicit admin role) |
| PATCH | `/users/:id/role` | Admin; updates role and revokes credentials; self-demotion rejected |

### Session and delivery behavior

- Default access lifetime: 15 minutes; refresh: 7 days. JWTs have explicit HS256, issuer/audience, purpose, ID and session generation. Every authenticated request rechecks current account status/role. One current session per account is intentional: a new login revokes previous sessions.
- Refresh credentials are SHA-256 digests in MongoDB; rotation uses atomic compare-and-swap. Replayed tokens fail without revoking a concurrent winning refresh. Password/role changes and logout revoke the session generation. Password hashing is bcrypt cost 12 through pre-save middleware.
- `rememberMe=false` creates a session cookie instead of a persistent one (browser session-restore settings may retain session cookies). Cookie path is `/api/auth`, host-only and HTTP-only; Secure is enabled in staging/production. The API returns refresh tokens for non-browser clients, but the frontend discards that body field.
- Recovery tokens are random 32-byte secrets, stored hashed for 15 minutes. OTPs use keyed HMAC digests in Redis with atomic attempt counting and consumption. Resend/recovery use per-email cooldowns in addition to per-IP route limits.
- BullMQ retries transactional email three times with exponential backoff. Handlebars templates escape dynamic values; expired code/link jobs are skipped. Pending queue payloads necessarily contain delivery secrets: protect Redis with private networking, authentication and TLS, and restrict operator access. Completed/failed payloads are removed and secrets are never logged.
- Registration succeeds even if verification email could not be queued and returns `verificationEmailQueued=false`; the UI directs the user to resend. A generic recovery acknowledgement is not a delivery guarantee. Monitor worker failures and test real SMTP before launch.
- Failed logout still clears local state and persists an explicit logout marker to prevent silent restoration on this browser. The UI warns if server revocation could not be confirmed; a server cookie can remain valid until expiration/revocation during an outage.
- Avatar upload is the explicitly deferred media placeholder. Profile editing and password changing otherwise use the real API. Existing public content/property/admin-management pages outside authentication remain later-phase screens.
