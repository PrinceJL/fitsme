# FitsMe — AI Shopping Assistant

FitsMe estimates a user's body measurements from photos and recommends clothing that fits
their body, style, budget, and occasion.

## Status: Phase 1 — Project Architecture & Authentication ✅

This phase delivers:

- Monorepo structure (`client/`, `server/`, `ai/`, `catalog/`, `database/`, `shared/`, `docs/`)
- Express + PostgreSQL backend with a clean layered architecture
  (routes → controllers → services → models)
- JWT-based authentication (register, login, `GET /api/auth/me`)
- React + TypeScript + Tailwind frontend with login/register/dashboard flows
- Docker Compose setup for one-command local development
- Centralized config, validation (Zod), and error handling

## Project Structure

```
fitsme/
├── client/                 # React + TypeScript + Tailwind frontend
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Route-level pages
│       ├── hooks/          # Custom hooks (e.g. useAuth)
│       ├── services/       # API clients
│       └── types/          # Shared TS types
├── server/                 # Node.js + Express backend
│   └── src/
│       ├── config/         # Env + DB configuration
│       ├── controllers/    # HTTP layer
│       ├── services/       # Business logic
│       ├── models/         # Data access layer
│       ├── middleware/     # Auth, validation, error handling
│       ├── routes/         # Route definitions
│       └── database/       # Migration runner
├── ai/
│   ├── computer-vision/    # Phase 2: body measurement estimation
│   └── recommendation/     # Phase 3: outfit ranking engine
├── catalog/                 # Phase 3: product catalog data/seeders
├── database/                # SQL schema (source of truth)
├── uploads/                 # User-uploaded photos (gitignored)
├── shared/                  # Types/constants shared across client & server
└── docs/                    # Architecture & design docs
```

## Prerequisites

- Docker + Docker Compose (recommended), **or**
- Node.js 20+ and a local PostgreSQL 16 instance

## Quick Start (Docker)

```bash
# 1. Copy env file and set a real JWT secret
cp server/.env.example server/.env

# 2. Start everything (postgres, server, client)
docker compose up --build
```

- Client: http://localhost:5173
- Server: http://localhost:4000
- Health check: http://localhost:4000/api/health
- DB health check: http://localhost:4000/api/health/db

The Postgres container automatically applies `database/schema.sql` on first boot.

## Quick Start (without Docker)

```bash
# Server
cd server
cp .env.example .env      # point DATABASE_URL at your local Postgres
npm install
npm run migrate           # applies database/schema.sql
npm run dev                # http://localhost:4000

# Client (in a second terminal)
cd client
npm install
npm run dev                 # http://localhost:5173
```

## API Reference (Phase 1)

| Method | Endpoint            | Auth | Description               |
|--------|----------------------|------|----------------------------|
| GET    | `/api/health`         | No   | Service health check       |
| GET    | `/api/health/db`      | No   | DB connectivity check      |
| POST   | `/api/auth/register`  | No   | Create account, returns JWT|
| POST   | `/api/auth/login`     | No   | Log in, returns JWT        |
| GET    | `/api/auth/me`        | Yes  | Get current user from token|

## Environment Variables (`server/.env`)

See `server/.env.example` for the full list. Key ones:

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — long random string, **must** be changed for production
- `CLIENT_ORIGIN` — allowed CORS origin for the frontend

## Coding Standards

- SOLID principles, clean architecture, RESTful APIs
- Business logic lives in `services/`, never in `controllers/`
- All inputs validated with Zod before reaching a controller
- No hardcoded config — everything flows through `config/env.js`

## Roadmap

- [x] **Phase 1** — Project setup, repo structure, auth, Docker
- [ ] **Phase 2** — Image upload, computer vision pipeline, measurement estimation
- [ ] **Phase 3** — Product catalog, recommendation engine, outfit ranking
- [ ] **Phase 4** — AI stylist, natural language outfit requests
- [ ] **Phase 5** — User profiles, saved outfits, wishlist
- [ ] **Phase 6** — UI polish, performance, deployment

## Suggested Tests for Phase 1

- `authService.register` rejects duplicate emails (409)
- `authService.login` rejects wrong password (401)
- `authenticate` middleware rejects missing/invalid/expired tokens (401)
- `POST /api/auth/register` with a short password fails validation (400)
- `GET /api/health/db` returns `ok` when Postgres is reachable
