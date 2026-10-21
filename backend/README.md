# SkillSphere Backend — MVP Skeleton (Step 1 of many)

## What's in this zip
```
skillsphere-backend/
├── src/
│   ├── config/db.js      -> MongoDB connection
│   ├── models/User.js    -> User schema (student/faculty/admin)
│   ├── routes/           -> empty, filled in next steps
│   ├── controllers/      -> empty, filled in next steps
│   ├── services/         -> empty, filled in next steps
│   ├── middleware/       -> empty, filled in next steps
│   └── app.js             -> Express app setup (cors, json parsing)
├── server.js               -> entry point, starts DB + server
├── package.json
├── .env.example
└── .gitignore
```

## Setup

1. Make sure MongoDB is running locally:
   ```
   mongosh
   ```
   If that connects, your local Mongo server is already running (common if installed as a background service). If not, start it manually:
   ```
   mongod --dbpath /path/to/your/data/folder
   ```

2. Copy the example env file and rename it:
   ```
   cp .env.example .env
   ```
   Then open `.env` and replace `JWT_SECRET` with any random string.

3. Install dependencies:
   ```
   npm install
   ```

4. Run the dev server:
   ```
   npm run dev
   ```
   You should see:
   ```
   MongoDB connected
   Server running on port 5000
   ```

5. Visit `http://localhost:5000/` in your browser — you should see:
   `SkillSphere API running`

## What's NOT built yet (coming in next steps)
- Skill and Project models
- Auth routes (register/login, JWT, password hashing)
- Student profile + skills APIs
- Project + matching engine
- React frontend

Don't skip ahead in code — each next step builds directly on this skeleton and the reasoning explained in chat.
