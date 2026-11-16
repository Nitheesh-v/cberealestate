# SBR Real Estate

Phase 1 of the full-stack platform is in [`sbr-real-estate/`](./sbr-real-estate/).

See the [project README](./sbr-real-estate/README.md) for installation, environment configuration, MongoDB/Redis setup, run commands, verification, and Phase 1 boundaries.

Quick start (Node.js 22.12+):

```bash
cd sbr-real-estate
npm ci
cp apps/frontend/.env.example apps/frontend/.env.local
cp apps/backend/.env.example apps/backend/.env
# Configure env values and start MongoDB + Redis; then, in separate terminals:
npm run dev:backend
npm run dev:frontend
```

All business feature pages remain intentional “Coming soon” placeholders. Auth/property/admin functionality belongs to later phases.
