# Kora

A live sports social platform where users follow matches, react in real time, and predict scores to earn points on a leaderboard.

## Features

- **Live match data** — polls API-Football for live, upcoming, and finished football matches
- **Social interactions** — comments and emoji reactions on matches, broadcast live via WebSockets
- **Follow system** — follow other users, see their predictions in your notifications
- **Score predictions** — predict scorelines before kickoff; auto-scored when a match finishes (exact score: 5 pts, correct outcome: 2 pts)
- **Leaderboard** — global ranking by total points earned from predictions
- **Notifications** — in-app alerts when a follower makes a prediction or your prediction is scored
- **Avatar uploads** — profile pictures stored via Cloudinary
- **Email notifications** — Resend-powered emails when predictions are scored

## Stack

| Layer          | Tech                              |
| -------------- | --------------------------------- |
| Backend        | Node.js + Express 5 (ESM)         |
| Database       | PostgreSQL via Prisma             |
| Cache / Queues | Redis + BullMQ                    |
| Real-time      | Socket.io                         |
| Frontend       | React 19 + Vite + Tailwind CSS v4 |
| Data fetching  | TanStack Query                    |
| External API   | API-Football (RapidAPI)           |
| Email          | Resend                            |
| File storage   | Cloudinary                        |

## Project Structure

```
kora/
├── backend/
│   └── src/
│       ├── config/        # prisma, redis, env
│       ├── controllers/   # thin handlers, delegate to services
│       ├── middleware/    # auth, error, rate limiter
│       ├── routes/        # auth, users, matches, notifications, leaderboard
│       ├── services/      # sports, cache, email, notification, prediction
│       ├── sockets/       # Socket.io setup + event handlers
│       ├── jobs/          # match-poller, prediction-scorer
│       └── utils/         # jwt, scoring
├── frontend/
│   └── src/
│       ├── api/           # axios clients
│       ├── components/    # UI components (shadcn/ui + custom)
│       ├── context/       # auth context
│       ├── hooks/         # data hooks
│       ├── pages/         # route-level page components
│       └── socket/        # Socket.io client setup
└── docker-compose.yml     # Postgres + Redis
```

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (for Postgres + Redis)
- A [RapidAPI](https://rapidapi.com) key for API-Football
- A [Resend](https://resend.com) API key
- A [Cloudinary](https://cloudinary.com) account

### 1. Clone and install

```bash
git clone https://github.com/ahmed-khaled04/Kora.git
cd kora
npm install
```

### 2. Configure environment

Copy the example env file and fill in the values:

```bash
cp backend/.env.example backend/.env
```

```env
DATABASE_URL=postgresql://kora:kora@localhost:5432/kora
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
APIFOOTBALL_KEY=your_rapidapi_key
RESEND_API_KEY=your_resend_key
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
PORT=3001
NODE_ENV=development
```

### 3. Start infrastructure

```bash
docker-compose up -d
```

### 4. Run database migrations

```bash
cd backend
npm run db:migrate
```

### 5. Start the backend

```bash
npm run dev
```

### 6. Start the frontend

```bash
cd frontend
npm run dev
```

The frontend runs at `http://localhost:5173` and proxies API calls to the backend at `http://localhost:3001`.

## API Overview

| Method | Endpoint                   | Description                      |
| ------ | -------------------------- | -------------------------------- |
| POST   | `/auth/register`           | Register a new user              |
| POST   | `/auth/login`              | Login, returns JWT               |
| GET    | `/auth/me`                 | Current user profile             |
| GET    | `/users/:id`               | Public profile + follower counts |
| POST   | `/users/:id/follow`        | Follow a user                    |
| DELETE | `/users/:id/follow`        | Unfollow a user                  |
| GET    | `/matches/live`            | Live matches                     |
| GET    | `/matches/upcoming`        | Upcoming matches                 |
| GET    | `/matches/:id`             | Single match detail              |
| GET    | `/matches/:id/comments`    | Paginated comments               |
| POST   | `/matches/:id/comments`    | Post a comment                   |
| GET    | `/matches/:id/reactions`   | Grouped reaction counts          |
| POST   | `/matches/:id/reactions`   | React to a match                 |
| DELETE | `/matches/:id/reactions`   | Remove reaction                  |
| POST   | `/matches/:id/predictions` | Submit a prediction              |
| GET    | `/leaderboard`             | Global points leaderboard        |
| GET    | `/notifications`           | In-app notifications             |

## WebSocket Events

Authentication is required on handshake (JWT passed as `auth.token`).

| Event (client → server) | Description                                |
| ----------------------- | ------------------------------------------ |
| `match:join`            | Subscribe to live updates for a match room |
| `match:leave`           | Unsubscribe from a match room              |

| Event (server → client) | Description                             |
| ----------------------- | --------------------------------------- |
| `comment:created`       | New comment posted in a match room      |
| `reaction:updated`      | Reaction counts changed in a match room |

## Scoring System

| Result                  | Points |
| ----------------------- | ------ |
| Exact scoreline         | 5      |
| Correct outcome (W/D/L) | 2      |
| Wrong                   | 0      |

Predictions are scored automatically by a background job that runs when a match status transitions to `FINISHED`.
