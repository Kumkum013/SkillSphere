# Docker deployment

## Prerequisites

- Docker Desktop (or Docker Engine) with Docker Compose v2
- A configured `backend/.env` file

## First-time setup

From the repository root in PowerShell:

```powershell
Copy-Item backend\.env.example backend\.env
```

Edit `backend\.env` before starting:

- Set `JWT_SECRET` to a long, random secret. For example, generate one with:
  `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
- Set `FRONTEND_URL` to the URL users will use to open the frontend. For local
  Docker this is `http://localhost:5173`; for a hosted deployment, use its public
  HTTPS URL.
- Fill in `SMTP_USER`, `SMTP_PASS`, and `MAIL_FROM` if email delivery is needed.
  For Gmail, `SMTP_PASS` must be a Gmail App Password.

Keep `backend/.env` private; it is ignored by Git and excluded from the backend
Docker build context.

## Build and run

```powershell
docker compose up --build -d
docker compose ps
```

Open [http://localhost:5173](http://localhost:5173). The frontend container
serves the Vite production build and proxies `/api` requests to the backend.
MongoDB and Redis are only exposed on the private Compose network, and MongoDB
data persists in the `mongo_data` volume.

To use a different local frontend port, set `FRONTEND_PORT` in the shell before
starting Compose, or create a root `.env` containing `FRONTEND_PORT=8080`.

## Operations

```powershell
docker compose logs -f
docker compose restart backend
docker compose down
```

`docker compose down` keeps the database volumes. To intentionally delete all
MongoDB and Redis data as well, use `docker compose down --volumes`.

For a public deployment, put HTTPS in front of the frontend service and set
`FRONTEND_URL` to that public HTTPS origin. Do not publish the backend, MongoDB,
or Redis ports directly to the internet.
