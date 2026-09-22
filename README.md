# FocusDay

FocusDay is a responsive productivity and habit tracker built with React, Vite, Express, and MongoDB.

## Run locally

1. Copy `.env.example` to `.env` and provide a MongoDB connection string and JWT secret.
2. Start the API:

```powershell
cd server
npm run dev
```

3. Start the client in a second terminal:

```powershell
cd client
npm run dev
```

The API enforces authentication, user data isolation, the three-task daily limit, the 6 PM tomorrow-planning gate, measurable habit records, and one-time carry-over of unfinished tasks. Analytics are calculated from task and habit-record data rather than stored in a separate collection.
