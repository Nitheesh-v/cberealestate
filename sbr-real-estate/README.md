# SBR Real Estate — Phase 1

A strict-TypeScript foundation for a real estate platform. **This phase deliberately contains no authentication flows, property CRUD, admin operations, or fabricated listing data.** All ten page routes are styled “Coming soon” placeholders.

## Stack

- **Frontend:** Next.js 15 App Router, React 18, Tailwind CSS 3, Radix-based shadcn/UI components, TanStack Query 5, Zustand, React Hook Form + Zod, Framer Motion, Lucide, Axios, `next/image`, and `next/font/google` (Inter + Playfair Display).
- **Backend:** NestJS 11, Mongoose 8, MongoDB, `@nestjs/config`, Swagger, class-validator/class-transformer, Helmet, compression, morgan, `@nestjs-modules/ioredis`, Redis, and BullMQ.
- **Tests:** Vitest for frontend utilities/state; Jest, Nest TestingModule, and Supertest for backend validation and the HTTP pipeline.
- **Runtime:** Node.js **22.12+** (Node 22 LTS recommended), npm 10+.

Next.js 15 and NestJS 11 satisfy the requested 14+/10+ stack. Compatible package versions are resolved in the root `package-lock.json`; use `npm ci` for reproducible installs.

## 1. Install

From the repository checkout:

```bash
cd sbr-real-estate
npm ci
cp apps/frontend/.env.example apps/frontend/.env.local
cp apps/backend/.env.example apps/backend/.env
```

The root is an npm workspace. Install once here, not separately in each app. Local environment files, dependency directories, generated builds, and coverage are ignored by Git.

## 2. Configure environments

Edit `apps/backend/.env`:

- Set `MONGODB_URI` to your MongoDB database.
- Set `REDIS_HOST`, `REDIS_PORT`, and, if required, `REDIS_PASSWORD`.
- Replace **both** JWT example strings with distinct random values (32+ characters). Run `openssl rand -base64 48` twice to generate them. Authentication is not enabled in Phase 1, but the environment contract is ready.
- Set `FRONTEND_URL` to your frontend's **exact origin**, without a trailing slash. Multiple origins may be comma-separated; wildcard origins are rejected.
- Use `NODE_ENV=development`, `staging`, `production`, or `test`. Staging/production reject placeholder/shared JWT secrets and non-HTTPS frontend origins. Production secrets should be injected by your deployment environment, not committed.
- Cloudinary and SMTP settings are reserved for later phases. Real credentials are **not needed** to run the empty upload/email modules.
- `THROTTLE_TTL`/`THROTTLE_LIMIT` are validated reserved configuration, **not enforced rate limiting** in this phase.

Edit `apps/frontend/.env.local`:

- Set the API base, app origin/name, and optional Cloudinary cloud name.
- Optional verified contact details/social destinations are environment-backed. Until provided, the footer clearly says “coming soon”; it never invents business details or links to unrelated social accounts.
- `NEXT_PUBLIC_*` values are intentionally public and embedded at **build time**. Never place secrets in them; rebuild after changing them for production.
- Public settings are validated with Zod. Missing or malformed required URLs fail with a validation error rather than silently calling an unintended endpoint.

### Same-origin proxy / Arena preview

A remote browser must not call the server's localhost address. Configure:

```dotenv
# apps/frontend/.env.local
NEXT_PUBLIC_API_URL=/api
API_PROXY_TARGET=http://127.0.0.1:5000/api
```

`API_PROXY_TARGET` is **server-only** and can instead point to your reachable backend service. It must include the configured API prefix. The browser calls `/api/...`; Next rewrites those requests on the server. Set backend `FRONTEND_URL` to the actual public frontend origin. The examples' localhost URLs are only for normal same-machine development. Restart/rebuild Next after changing proxy configuration.

## 3. Start MongoDB and Redis

Install MongoDB 7+ (8 recommended) and Redis 7+, or use existing managed/local instances. For disposable local development, if Docker is already installed:

```bash
docker run -d --name sbr-mongo \
  -p 127.0.0.1:27017:27017 \
  -v sbr-mongo-data:/data/db mongo:8

docker run -d --name sbr-redis \
  -p 127.0.0.1:6379:6379 \
  -v sbr-redis-data:/data redis:7-alpine redis-server --appendonly yes
```

These loopback-only examples intentionally have no local password. **Do not expose unauthenticated database/cache ports publicly.** Use authenticated private infrastructure/TLS for staging and production. No Docker/CI deployment files are introduced in Phase 1.

MongoDB is required at API boot. Failed database initialization is logged and retried a bounded number of times. Redis reconnects with bounded backoff; its readiness endpoint returns 503 while disconnected. Health checks do not pretend missing services are healthy.

## 4. Run both apps

Use two terminals, both at `sbr-real-estate/`:

```bash
# Terminal 1 — API, port from backend PORT (example: 5000)
npm run dev:backend
```

```bash
# Terminal 2 — web, default port 3000
npm run dev:frontend
```

Both servers bind to `0.0.0.0` for remote development previews. Locally open:

- Frontend: `http://localhost:3000`
- API liveness: `http://localhost:5000/api/health`
- Swagger: `http://localhost:5000/api/docs` (**development only**)

An initial frontend dev/build requires access to `fonts.googleapis.com` and `fonts.gstatic.com`. Next downloads and self-hosts the fonts; visitors do not fetch them from Google at runtime. See the verification caveat below for this sandbox's restrictions.

## 5. Verify

### Automated checks (no external services needed)

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm audit --omit=dev
```

`npm run build` needs valid frontend environment settings and Google Fonts network access, but does not connect to MongoDB or Redis. Backend unit/HTTP tests use explicitly injected dependency mocks, not a production bypass flag. `npm run test:e2e -w @sbr/backend` runs the Supertest HTTP suite alone.

Coverage examples include:

- Indian currency thresholds and invalid prices, Unicode truncation, slug normalization, UTC date formatting, and class merging.
- UI toggles, theme preference, and invalid/negative filter counts.
- Environment defaults/coercion, unsafe origins, and production secret checks.
- Pagination defaults, transformations, unexpected fields, bounds, and operator/markup rejection.
- Real Nest HTTP validation/filter/interceptor pipeline, response envelopes, security headers, allowed/rejected CORS origins, 404/409/500 responses, null payloads, and dependency 503 failures.

### Live API checks (MongoDB and Redis must be running)

```bash
curl -i http://localhost:5000/api
curl -i http://localhost:5000/api/health
curl -i http://localhost:5000/api/health/db
curl -i http://localhost:5000/api/health/redis
curl -i http://localhost:5000/api/missing
```

Successful payloads are wrapped consistently:

```json
{
  "success": true,
  "message": "Request successful",
  "data": {
    "status": "ok",
    "timestamp": "<ISO timestamp>",
    "uptime": 12.5,
    "environment": "development"
  },
  "meta": { "timestamp": "<ISO timestamp>" }
}
```

`GET /api/health` is process liveness. `/api/health/db` actively pings MongoDB; `/api/health/redis` actively pings Redis with a bounded command timeout. Dependency outages return **503**, not 200. A missing route returns a formatted **404**:

```json
{
  "success": false,
  "message": "Cannot GET /api/missing",
  "statusCode": 404,
  "timestamp": "<ISO timestamp>",
  "path": "/api/missing"
}
```

Validation errors use an array for `message`. Mongoose validation/cast errors map to 400; duplicate keys map to 409; unexpected errors map to 500 without stack traces or submitted values. Logs exclude query strings and connection credentials. CORS is not authentication; non-browser clients can still call public endpoints.

### Browser checklist

Visit `/`, `/properties`, `/about`, `/contact`, `/services`, `/blog`, `/login`, `/register`, `/dashboard`, and `/admin`:

1. Confirm each has a heading, coming-soon copy, title, description, canonical URL, and social metadata.
2. Check widths 375, 768, 1024, and 1440 pixels for horizontal overflow.
3. Confirm active navigation, sticky header, mobile drawer focus/close/Escape, and navigation after choosing a mobile link.
4. Scroll down and use the animated scroll-to-top button. Reduced-motion preferences are honored.
5. Auth routes show minimal branding, not the public Navbar/Footer. Dashboard/admin routes show their own workspace shells.
6. A missing URL renders the branded 404 with a home link. Route and root error boundaries are present; `loading.tsx` supplies the spinner and skeletons during Suspense.
7. ThemeProvider supports light/dark/system and defaults to light. Set a preference through the UI store's `setTheme` action; it synchronizes with next-themes and persists. A theme switcher UI is not part of Phase 1.

### Verification performed in the build sandbox

- Strict TypeScript checks and ESLint passed for both apps.
- Frontend: **21 tests** passed. Backend: **31 tests** passed (including HTTP tests with mocked infrastructure).
- Both production builds passed and all requested frontend routes were generated.
- Real headless Chromium smoke checks passed for all ten routes, metadata, all four viewport widths, mobile drawer navigation/Escape, scroll-to-top, persisted dark mode, and the 404, with no browser runtime errors.
- Production dependency audit (`npm audit --omit=dev`) reported **zero vulnerabilities** at verification time. Development tooling still has upstream low/moderate transitive advisories; no forced major/downgrade fixes were applied.
- **Google Fonts is blocked by this sandbox's outbound allowlist.** To verify the build without changing the requested `next/font/google` source, the sandbox used Next's font-response fixture mechanism pointing at real Inter/Playfair font files fetched from the official Google Fonts GitHub repository. That local test fixture is ignored and is not required for a normal network-enabled build. A plain build in the restricted sandbox will otherwise fail at font download; it is not a TypeScript/compilation failure.
- **No live MongoDB or Redis service is available in the sandbox.** Infrastructure connectivity must still be verified using the live checks above after providing those services. The frontend preview makes no business API calls in this phase.

## 6. Production build / local start

```bash
npm run build
npm run start:prod -w @sbr/backend
# In another terminal, ordinary local Next production serving:
npm start -w @sbr/frontend
```

Next is configured with `output: 'standalone'` for the later Docker phase. `next start` can serve a local build, but Next recommends its emitted server for standalone deployment. From `apps/frontend`, prepare and run that artifact instead:

```bash
cp -R public .next/standalone/apps/frontend/public
mkdir -p .next/standalone/apps/frontend/.next
cp -R .next/static .next/standalone/apps/frontend/.next/static
HOSTNAME=0.0.0.0 PORT=3000 node .next/standalone/apps/frontend/server.js
```

The server path includes `apps/frontend` because tracing detects the npm workspace root. Build with the intended public environment values and inject the backend's runtime secrets separately. Swagger is absent in staging/production. Database indexes currently use the expressly requested `autoIndex: true`; review index rollout before future property collections go live.

## Structure and boundaries

```text
apps/frontend/src/
  app/                 App Router groups, metadata, errors, Suspense loading
  components/ui/       Typed, locally owned shadcn/Radix primitives and Toaster
  components/layout/   Public navigation/footer, mobile drawer, workspace shells
  components/shared/   Container, headings, brand, spinner/skeleton, SEO helper
  hooks/               Debounce, media-query, and toast hooks
  lib/                 Validated public env, Axios, constants, formatting helpers
  providers/           Per-app QueryClient and theme support
  store/               UI-only Zustand store
  types/               Base domain interfaces and enums for later expansion
apps/backend/src/
  config/              Validated env and app/database/cache/provider factories
  common/              DTOs, validation, decorators, guards, filters, interceptors
  health/              Public liveness/readiness probes
  modules/             Empty feature boundaries for later phases
```

- `/admin` and `/dashboard` are **public visual placeholders**, not access-controlled areas. They expose no sensitive data or actions. JWT/role guards are foundations, not globally registered authentication. The JWT guard fails closed without a strategy; real authentication is deferred.
- No list endpoints are implemented yet. `PaginationDto` enforces page ≥ 1 and limit 1–100; all future list controllers must use pagination, compute `PaginationMeta`, and allowlist sortable database fields.
- There are no forms accepting HTML or dynamic database queries in Phase 1. DTOs reject undeclared fields, operator syntax, and markup in sorting; strings rendered by React are escaped. Future rich-text ingestion must add a dedicated allowlist sanitizer rather than trusting `dangerouslySetInnerHTML`. The slug helper is **not** a general HTML sanitizer.
- Axios attaches an optional `accessToken` from browser storage, handles 401 with a login redirect, emits bounded text-only toasts, and rethrows errors to callers. No token is created in this phase. Review secure HTTP-only-cookie auth when implementing Phase 2.
- Auth, users, properties, inquiries, uploads, analytics, email, image processing, notification, and admin Nest modules are intentionally empty shells. BullMQ is configured without queues/workers/jobs.
- The three provided image assets are lightweight original brand/architectural placeholders, not stock photos or real properties. Raster assets are optimized JPEGs; the brand uses SVG; rendered images use `next/image`.
- Social links without verified environment URLs and legal-policy labels remain visibly unavailable instead of navigating to nonexistent policy pages. Admin subsection links are in-page placeholders.

## Configuration / shadcn notes

To honor the stricter **no plain JavaScript source/config** rule, the requested `next.config.js` is **`next.config.ts`**, and `postcss.config.js` is **`postcss.config.json`**. Both are supported and build-tested. Backend compiler output and Next build artifacts are naturally JavaScript and are ignored by Git.

The requested `npx shadcn-ui@latest init` now prints a deprecation notice pointing to `shadcn`. The Tailwind-3-compatible `shadcn@2.3.0 init` passed framework/Tailwind/alias checks and generated `components.json`, but its registry download was blocked by the sandbox. The complete requested Radix-based TypeScript primitives were supplied locally with standard shadcn forward-ref/class-variance patterns. No CLI download is needed to use this checkout. For future components, use the compatible CLI in a network-enabled environment, reviewing any changes to the customized brand theme.
