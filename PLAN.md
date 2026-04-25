# Kora — Live Sports Social Platform

## Context
Full-stack portfolio project combining real sports data, social interactions, and real-time features. Demonstrates production-grade backend skills: external API integration with smart caching, WebSockets, background jobs, and complex relational data.

**Stack:** Node.js + Express + JavaScript (ESM) + Prisma + PostgreSQL + Redis + Socket.io + React

**API-Football** (football only, 100 req/day free tier via RapidAPI)
**Notifications:** in-app (WebSocket) + email (Resend)
**Structure:** monorepo (npm workspaces)

---

## Monorepo Structure

```
kora/
  backend/
    src/
      config/           # env, redis, prisma clients
      controllers/      # request handlers (thin, delegate to services)
      middleware/       # auth, rate-limit, error, validation
      routes/           # express routers
      services/
        sports.service.js        # API-Football wrapper
        cache.service.js         # Redis read/write helpers
        email.service.js         # Resend templates
        notification.service.js  # create + fan-out notifications
        prediction.service.js    # scoring logic
      sockets/
        index.js                 # Socket.io setup + auth middleware
        handlers/
          comment.handler.js
          reaction.handler.js
          match.handler.js
      jobs/
        match-poller.job.js      # cron: fetch live scores every 60s
        prediction-scorer.job.js # triggered when match → FINISHED
      utils/
        jwt.js
        scoring.js               # prediction points logic
      app.js                     # Express app (no listen)
      server.js                  # HTTP + Socket.io + job bootstrap
    .env.example
    package.json
  frontend/
    src/
      components/
      pages/
      hooks/
      services/         # API + socket clients
    package.json
  package.json          # npm workspaces root
  docker-compose.yml    # postgres + redis
```

---

## Database Schema (Prisma + PostgreSQL)

### Models

**User** — id, email, username, passwordHash, avatar?, createdAt
**Follow** — composite PK (followerId, followingId), createdAt
**Match** — id, externalId (API-Football fixture ID, unique), homeTeam, awayTeam, team logos, league, status (enum), homeScore?, awayScore?, kickoff, venue?
**Comment** — id, userId, matchId, content, createdAt
**Reaction** — id, userId, matchId, type (enum), createdAt. Unique on (userId, matchId) — one reaction per user per match, upserted.
**Prediction** — id, userId, matchId, predictedHome, predictedAway, pointsEarned?, scored (bool), createdAt. Unique on (userId, matchId).
**Notification** — id, recipientId, senderId?, type (enum), payload (Json), read (bool), createdAt

### Enums
- **MatchStatus**: SCHEDULED, LIVE, FINISHED, POSTPONED, CANCELLED
- **ReactionType**: FIRE, GOAL, SHOCKED, LAUGH, SAD
- **NotificationType**: FOLLOWER_PREDICTION, PREDICTION_SCORED, MATCH_STARTING

---

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | email, username, password → JWT |
| POST | /api/auth/login | email + password → JWT |
| GET | /api/auth/me | returns authed user (protected) |

### Users
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/users/:id | public profile + follower counts |
| POST | /api/users/:id/follow | follow a user |
| DELETE | /api/users/:id/follow | unfollow |
| GET | /api/users/:id/followers | paginated |
| GET | /api/users/:id/following | paginated |

### Matches
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/matches/live | live fixtures (Redis cache, 60s TTL) |
| GET | /api/matches/upcoming | today's scheduled (5min TTL) |
| GET | /api/matches/:id | single match detail |

### Comments
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/matches/:id/comments | paginated, newest first |
| POST | /api/matches/:id/comments | create (also emits via WebSocket) |

### Reactions
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/matches/:id/reactions | counts grouped by type |
| POST | /api/matches/:id/reactions | upsert user's reaction |
| DELETE | /api/matches/:id/reactions | remove user's reaction |

### Predictions
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/matches/:id/predictions | submit (blocked if match started) |
| GET | /api/matches/:id/predictions | all predictions for a match |
| GET | /api/users/:id/predictions | user's prediction history |

### Leaderboard
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/leaderboard | ranked by points. Query: ?period=weekly\|monthly\|alltime |

### Notifications
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/notifications | authed user's notifications |
| PATCH | /api/notifications/:id/read | mark one read |
| PATCH | /api/notifications/read-all | mark all read |

---

## WebSocket Design (Socket.io)

### Auth
Socket.io middleware validates JWT on handshake before any event is processed.

### Rooms
Each match gets a room: `match:{matchId}`. Clients join/leave via events.
Each user gets a personal room: `user:{userId}` for notifications.

### Events

**Client → Server**
- `match:join` `{ matchId }` — subscribe to a match room
- `match:leave` `{ matchId }` — unsubscribe
- `comment:new` `{ matchId, content }` — post a comment (server saves + broadcasts)

**Server → Client**
- `comment:created` `{ comment }` — broadcast to match room on new comment
- `reaction:updated` `{ matchId, counts }` — broadcast when reaction changes
- `match:updated` `{ match }` — score/status change from poller job
- `notification:new` `{ notification }` — sent to individual user's room

---

## Caching Strategy (Redis)

| Key | Data | TTL |
|-----|------|-----|
| `matches:live` | Array of live fixtures | 60s |
| `matches:upcoming` | Today's scheduled fixtures | 5min |
| `match:{externalId}` | Single fixture detail | 60s if LIVE, 5min if SCHEDULED |
| `leaderboard:{period}` | Top 50 users + scores | 5min |

Cache-aside pattern: check Redis first, fall through to DB/API on miss, write result back.

---

## Background Jobs

### match-poller.job.js
- Runs every **60 seconds** via `node-cron`
- Calls API-Football `GET /fixtures?live=all`
- Upserts Match records in PostgreSQL
- Invalidates `matches:live` Redis keys
- Emits `match:updated` to Socket.io rooms for changed matches
- When a match transitions to FINISHED → triggers prediction scorer

### prediction-scorer.job.js
- Triggered (not cron) when a match finishes
- Fetches all `scored: false` Predictions for the match
- Applies scoring via `utils/scoring.js`
- Bulk-updates Prediction records
- Creates `PREDICTION_SCORED` notifications for each user
- Sends email via Resend
- Invalidates `leaderboard:*` Redis keys

---

## Scoring Logic (utils/scoring.js)

- **Exact score**: 5 pts
- **Correct outcome** (win/draw/loss, not exact): 2 pts
- **Wrong**: 0 pts

Outcome = sign of (home - away): positive = home win, 0 = draw, negative = away win.

---

## Notification Fan-out

When user A makes a prediction:
1. Fetch all followers of user A
2. Bulk-insert `FOLLOWER_PREDICTION` notifications (one per follower)
3. Emit `notification:new` to online followers via `user:{id}` Socket.io room
4. Send email to offline followers (track online state via Redis set `online:{userId}`)

---

## Key Libraries

| Purpose | Package |
|---------|---------|
| Validation | `express-validator` |
| Password hashing | `bcryptjs` |
| JWT | `jsonwebtoken` |
| Redis client | `ioredis` |
| Cron jobs | `node-cron` |
| Email | `resend` |
| Rate limiting | `express-rate-limit` |
| HTTP client (API-Football) | `axios` |
| Logging | `pino` + `pino-pretty` |

---

## Implementation Phases

### Phase 1 — Project Scaffold ← START HERE
- Init monorepo with npm workspaces
- `backend/`: Express app skeleton, Prisma init, docker-compose for Postgres + Redis
- `.env.example` with all required keys documented
- Health check endpoint `GET /api/health`

### Phase 2 — Auth
- Prisma User model + migration
- Register / Login controllers (bcrypt + JWT)
- `auth.middleware.js` — JWT guard
- `/api/auth/me` endpoint

### Phase 3 — Follow System
- Prisma Follow model + migration
- Follow / Unfollow / Followers / Following endpoints

### Phase 4 — Sports Integration
- `sports.service.js` — API-Football client
- `cache.service.js` — Redis helpers
- Match upsert logic
- GET /matches/live, /upcoming, /:id with cache layer

### Phase 5 — Reactions & Comments (REST)
- Prisma Comment + Reaction models + migrations
- CRUD endpoints

### Phase 6 — WebSockets
- Socket.io setup with JWT auth
- Room join/leave
- Real-time comment + reaction broadcasting

### Phase 7 — Predictions
- Prisma Prediction model + migration
- Submit prediction (guard: match must be SCHEDULED)
- `utils/scoring.js` + `prediction-scorer.job.js`

### Phase 8 — Match Poller
- `match-poller.job.js` with node-cron
- DB upserts + cache invalidation
- Socket.io `match:updated` emissions
- Trigger scorer when match finishes

### Phase 9 — Leaderboard
- Aggregation query (SUM pointsEarned grouped by userId, period filter)
- Redis cache layer

### Phase 10 — Notifications
- Prisma Notification model + migration
- `notification.service.js` — create + fan-out
- WebSocket delivery + email via Resend
- Notification REST endpoints

### Phase 11 — Frontend (React)
- Auth pages, match feed, match detail, leaderboard, user profile
- Notification bell, Socket.io client integration

---

## Verification Plan

1. **Scoring unit test**: Test `utils/scoring.js` — exact score, correct outcome, wrong prediction
2. **Poller integration**: Manually trigger poller → confirm DB upserts + Socket.io events fire
3. **Cache test**: Hit `/matches/live` twice within 60s → second request hits Redis (log cache hit)
4. **WebSocket test**: Two tabs on same match → post comment → appears in both in real-time
5. **Prediction flow**: Submit prediction before kickoff (allowed), after kickoff (blocked), score it → assert points
6. **Notification flow**: User A follows B → B predicts → A receives WebSocket + email notification
7. **Leaderboard**: Multiple users with scored predictions → ranked correctly by period
