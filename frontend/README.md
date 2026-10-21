# SkillSphere Frontend

React + Vite + Tailwind + Framer Motion, talking to your SkillSphere backend at `http://localhost:5000`.

## Setup

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. Make sure your backend is running on port 5000 first (CORS is already configured there to allow this).

## Pages

- `/login`, `/register` — auth
- `/dashboard` — overview: your tasks, pending invitations, open projects
- `/projects` — browse all open projects, create a new one
- `/projects/:id` — project detail: team tab, matching-engine recommendations tab (with invite button for owners), task board tab (drag-free, dropdown-based status)
- `/invitations` — accept/decline pending invitations
- `/profile` — view/edit your skills, toggle availability

## What's animated

- Page entrances (fade + slight slide up) on every page via Framer Motion
- Staggered card reveals on Dashboard and Projects grids
- Match-score recommendation cards animate in with a stagger, and show a live conic-gradient "ring" visualizing the % score
- Tab switching on the project detail page has a sliding underline and cross-fade between tab content
- Task cards animate in/out smoothly when their status changes (via `layout` + `AnimatePresence`)
- Invitation cards slide out when accepted/declined
- Buttons have a subtle press (scale down) animation on tap

## Design tokens

Defined in `tailwind.config.js` — `bg`, `ink`, `match` (indigo accent), `coral`, `success`, `border`. Headings use Space Grotesk, body text uses Inter (both loaded via Google Fonts in `index.html`).

## Known limitation

The matching engine and invite flow are easiest to demo with at least 2 student accounts — one as the project owner, one as a candidate with overlapping skills. See the backend README/your own testing notes for how to create a second test student.
