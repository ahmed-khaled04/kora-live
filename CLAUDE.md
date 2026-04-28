# Kora — Live Sports Social Platform

## Project Overview
Full-stack sports social app: real match data + social interactions + real-time WebSockets.
See `PLAN.md` for full architecture, database schema, API endpoints, and implementation phases.

## Stack
- **Backend**: Node.js + Express + JavaScript (ESM) + Prisma + PostgreSQL + Redis + Socket.io
- **Frontend**: React
- **External API**: API-Football via RapidAPI (football only, 100 req/day free tier)
- **Email**: Resend
- **Structure**: npm workspaces monorepo

## Current Phase
Phase 7 — Predictions

## Completed Phases
- **Phase 1 — Project Scaffold**: monorepo setup, Express skeleton, docker-compose (Postgres + Redis), Prisma init, full schema defined and migrated (`init` migration), `.env` configured
- **Phase 2 — Auth**: register/login/me endpoints, JWT, bcrypt, express-validator, error middleware, DB connection log on startup
- **Phase 3 — Follow System**: follow/unfollow, get profile (public + follower counts), paginated followers/following endpoints
- **Phase 4 — Sports Integration**: SportAPI axios wrapper, Redis cache layer, match upserts, GET /matches/live, /upcoming, /:id
- **Phase 5 — Reactions & Comments**: Comment + Reaction service/controller/routes, paginated comments, grouped reaction counts, upsert reactions, GET/POST /matches/:id/comments, GET/POST/DELETE /matches/:id/reactions
- **Phase 6 — WebSockets**: Socket.io setup with JWT auth on handshake, match room join/leave, real-time `comment:created` broadcast from comment service, real-time `reaction:updated` broadcast with grouped counts from reaction service, module singleton `getIO()` pattern

## Commands

### Backend
```bash
cd backend
npm run dev        # start dev server with nodemon
npm run db:migrate # prisma migrate dev
npm run db:studio  # prisma studio
```

### Infrastructure
```bash
docker-compose up -d   # start postgres + redis
docker-compose down    # stop
```

### Root
```bash
npm install   # install all workspaces
```

## Environment Variables (backend/.env)
```
DATABASE_URL=postgresql://kora:kora@localhost:5432/kora
REDIS_URL=redis://localhost:6379
JWT_SECRET=
APIFOOTBALL_KEY=       # RapidAPI key for API-Football
RESEND_API_KEY=
PORT=3001
NODE_ENV=development
```

## Key Architectural Rules
- **Controllers are thin**: delegate all logic to services
- **Cache-aside pattern**: check Redis → fall through to DB/API → write back to cache
- **Predictions**: blocked after match kickoff (check `match.status !== 'SCHEDULED'`)
- **One reaction per user per match**: upsert, not insert
- **Socket.io auth**: validate JWT on handshake, reject before any event fires
- **API-Football rate limit**: always check Redis cache before calling the external API

## File Layout
```
backend/src/
  config/           # prisma.js, redis.js, env.js
  controllers/
  middleware/       # auth.js, error.js, rateLimiter.js
  routes/
  services/         # sports, cache, email, notification, prediction
  sockets/          # Socket.io setup + handlers
  jobs/             # match-poller, prediction-scorer
  utils/            # jwt.js, scoring.js
  app.js
  server.js
```

## Collaboration Mode
The user codes independently. Act as a **reviewer and teacher** — do not write or edit code unless explicitly asked. When the user shares code, review it, point out mistakes, and explain why. Also highlight good practices and well-written parts so the user knows what to keep doing. Only implement something when the user says "do it" or "implement this yourself".

## Scoring System
- Exact score: **5 pts**
- Correct outcome (W/D/L): **2 pts**
- Wrong: **0 pts**
