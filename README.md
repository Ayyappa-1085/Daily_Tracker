# Ascend — Discipline over Motivation

A full-stack MERN habit/discipline tracker dashboard, built from the "Ascend" UI mockup:
daily missions with progress rings, XP/level/streak gamification, a rule-based AI Insight
coach, a daily timeline, a journal, and quick actions — all backed by a real MongoDB API,
not mock data.

## Stack

- **Frontend:** React 18 + Vite, Tailwind CSS, Zustand, React Router, lucide-react, Axios
- **Backend:** Node.js + Express, MongoDB + Mongoose, JWT auth, bcrypt

## Project structure

```
ascend-app/
├── backend/
│   ├── config/db.js              # Mongo connection
│   ├── models/                   # User, Mission, TimelineEvent, Journal
│   ├── controllers/               # Route handlers
│   ├── routes/                   # Express routers
│   ├── middleware/               # JWT auth guard, error handler
│   ├── utils/                    # gamification (XP/streak), insight engine, date helpers
│   ├── seed.js                   # Seeds a demo account matching the mockup
│   └── server.js
└── frontend/
    └── src/
        ├── api/axios.js          # Axios instance w/ token injection
        ├── store/                # Zustand stores (auth, dashboard)
        ├── components/           # Sidebar, Header, mission rings, cards, etc.
        └── pages/                # Dashboard (Home), Today, Journal, Login, Register
```

## Getting started

### 1. Backend

```bash
cd backend
cp .env.example .env      # edit MONGO_URI / JWT_SECRET if needed
npm install
npm run seed               # creates the demo account below + sample data
npm run dev                 # http://localhost:5000
```

Requires a MongoDB instance — either local (`mongodb://127.0.0.1:27017/ascend`, the
`.env.example` default) or a free MongoDB Atlas cluster (paste its connection string
into `MONGO_URI`).

**Demo login (after seeding):** `dude@ascend.app` / `password123`

### 2. Frontend

```bash
cd frontend
cp .env.example .env      # points at http://localhost:5000/api by default
npm install
npm run dev                 # http://localhost:5173
```

Sign in with the demo account, or register a new one — new accounts start at Day 0
with all five missions provisioned automatically.

## How the core mechanics work

- **Daily missions** (DSA, Development, Workout, Reading, Water) are auto-provisioned
  per user per calendar day (`utils/missionDefaults.js`). Completing one awards XP and
  credits the day streak; un-completing one reverses both.
- **Level** is derived from lifetime XP (`800 XP per level`), not stored directly —
  see the `level` virtual on the `User` model.
- **Streak** increments once per day the first time any mission is completed, and is
  lazily reset to 0 if a full day is skipped (`utils/gamification.js`).
- **AI Insight** is a rule-based engine (`utils/insightEngine.js`) — no external API
  key required. It checks yesterday's missed missions first, falls back to the
  weakest category over the last 7 days, and finally a positive-reinforcement message.
  Swapping in a real LLM later just means replacing the body of `generateInsight()`.
- **Today's Timeline** entries can be linked to a mission type (`linkedType`); marking
  that mission complete automatically flips the matching timeline stop to "done."
- **Overall Progress** and the stat-card sparklines are computed from real mission
  history (`GET /api/dashboard` aggregates the last 7 days), not hardcoded numbers.

## Main API endpoints

| Method | Route                        | Description                        |
| ------ | ---------------------------- | ---------------------------------- |
| POST   | `/api/auth/register`         | Create account                     |
| POST   | `/api/auth/login`            | Login, returns JWT                 |
| GET    | `/api/dashboard`             | Everything Home needs, in one call |
| GET    | `/api/missions/today`        | Today's missions                   |
| PATCH  | `/api/missions/:id/toggle`   | Complete / un-complete a mission   |
| PATCH  | `/api/missions/:id/progress` | Set partial progress (0–100)       |
| POST   | `/api/missions`              | Add a custom mission               |
| GET    | `/api/timeline/today`        | Today's timeline                   |
| PATCH  | `/api/timeline/:id/status`   | Mark a timeline stop done/pending  |
| GET    | `/api/journal`               | List journal entries               |
| POST   | `/api/journal`               | Create/update today's entry        |

All routes except register/login require `Authorization: Bearer <token>`.

## Notes / next steps

- **Dark/Light toggle** is fully functional (CSS variables in `index.css` +
  `tailwind.config.js`), matching the sidebar toggle in the mockup.
- **Learning / Health / Progress / Settings** nav items are intentionally left as
  "coming soon" placeholders — Home and Today already cover their underlying data;
  dedicated views are a natural next iteration.
- To swap the rule-based AI Insight for a real LLM call, see `utils/insightEngine.js`
  and the Anthropic API docs.
