# SkillSphere Project Guide

SkillSphere is a React and Express web application for students and faculty to find teammates, organize project work, and collaborate.

## Implemented features

- **Authentication:** Public registration is limited to students; log in using case-insensitive, whitespace-trimmed email lookup, hashed passwords, and JWT-based sessions, while faculty/admin accounts must be provisioned by a trusted administrator.
- **Password recovery:** Request a one-time password reset link by email; links expire after 30 minutes and can only be used once.
- **Student profiles and skills:** View and update profile details, manage skills and proficiency levels, and set availability.
- **Resume matching:** Extract text from a resume in the browser, detect catalogued skills, and recommend open projects using the resulting match score.
- **Student directory:** Search and filter student profiles by name, skill, branch, year, and availability.
- **Projects:** Create, browse, view, update, and delete projects with required skills and project membership.
- **Student recommendations:** Match students to projects using skill fit and other scoring factors, and show recommendations to project owners.
- **Join requests and invitations:** Request to join projects, review requests, and send, accept, or decline invitations.
- **Tasks:** Assign project tasks, track their status from to-do through review to completion, and review work.
- **Personal to-dos:** Create, update, complete, and delete private to-do items.
- **Project chat:** Exchange project-wide and member-to-member messages, with access limited to project members.
- **Notifications:** View notifications related to team requests, task reviews, and faculty endorsements.
- **Faculty tools:** View a faculty overview, claim project mentorship, approve projects, and endorse student skills.
- **GitHub contributions:** Project owners connect public or private repositories via GitHub OAuth; owners and faculty can view per-contributor commit counts, with optional matching to team profiles by GitHub username.
- **API safeguards:** Apply security headers, request rate limits, and NoSQL input sanitization to API requests.
- **Recommendations cache:** Use Redis to cache project recommendation responses and invalidate affected entries after relevant updates.

## Prerequisites

For the recommended Docker setup, install and start Docker Desktop (or Docker Engine) with Docker Compose v2.

For running the backend and frontend directly on your machine, install Node.js 20 or later, npm, MongoDB, and Redis.

## Recommended: run with Docker Compose

Run these commands in PowerShell from the project root:

1. Create the backend environment file:

   ```powershell
   Copy-Item backend\.env.example backend\.env
   ```

2. Open `backend\.env` and set a strong, unique `JWT_SECRET`. Configure `SMTP_USER`, `SMTP_PASS`, and `MAIL_FROM` if email delivery is needed. Keep this file private.

   Public registration creates student accounts only. Faculty and admin accounts must be provisioned through a trusted administrative process; the current project does not include an admin user-management screen.

3. To enable private-repository contribution tracking, create a GitHub OAuth App in GitHub Developer Settings. Use `http://localhost:5173` as its homepage URL and `http://localhost:5173/github/callback` as its authorization callback URL. Add its client ID and client secret to `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`. Keep the callback URL exactly the same as the one configured on GitHub. Generate and set `GITHUB_TOKEN_ENCRYPTION_KEY`:

   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   Copy the generated 64-character value into `backend\.env`. GitHub OAuth requests the `repo` scope to read private repository contributions. The access token is encrypted in MongoDB using this key; do not share or change the key without reconnecting repositories.

   GitHub OAuth is optional; skip this step if you do not need repository contributions.

4. Build and start the app and its MongoDB and Redis services:

   ```powershell
   docker compose up --build -d
   ```

5. Check that the services started:

   ```powershell
   docker compose ps
   ```

   MongoDB and Redis should show as healthy, and the backend should become healthy after startup.

6. Open the app at [http://localhost:5173](http://localhost:5173). The frontend routes API requests to the backend; the backend, MongoDB, and Redis are not published directly to the host by the default Compose configuration.

Useful operations:

```powershell
docker compose logs -f
docker compose logs --since 15m backend
docker compose restart backend
docker compose down
```

`docker compose down` preserves the MongoDB and Redis volumes. Do not use `docker compose down --volumes` unless you intentionally want to delete their stored data.

To verify SMTP credentials without sending an email, run:

```powershell
docker compose exec -T backend node -e "const nodemailer=require('nodemailer'); const port=Number(process.env.SMTP_PORT||587); const transport=nodemailer.createTransport({host:process.env.SMTP_HOST||'smtp.gmail.com',port,secure:process.env.SMTP_SECURE==='true'||(!process.env.SMTP_SECURE&&port===465),auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}}); transport.verify().then(()=>{console.log('SMTP authentication succeeded');transport.close()}).catch(err=>{console.error('SMTP authentication failed:',err.code,err.message);transport.close();process.exit(1)})"
```

If credentials were changed in `backend\.env`, recreate the backend so Docker reloads them:

```powershell
docker compose up -d --force-recreate backend
```

## Run frontend and backend directly (local development)

This option assumes MongoDB and Redis are installed and listening on the Windows host at their default ports.

1. Create and edit the environment file:

   ```powershell
   Copy-Item backend\.env.example backend\.env
   ```

   For services running directly on the host, set these values in `backend\.env`:

   ```dotenv
   MONGO_URI=mongodb://localhost:27017/skillsphere
   REDIS_URL=redis://localhost:6379
   GITHUB_CALLBACK_URL=http://localhost:5173/github/callback
   ```

   Also replace the example `JWT_SECRET` with a strong, unique value.

   To use GitHub contribution tracking, configure `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and a generated `GITHUB_TOKEN_ENCRYPTION_KEY` as described above. Register `http://localhost:5173/github/callback` as the GitHub OAuth App callback URL. GitHub OAuth remains optional.

2. In a terminal, install backend dependencies and start the API:

   ```powershell
   cd backend
   npm ci
   npm run dev
   ```

   The API runs on port `5000` by default. Check [http://localhost:5000/](http://localhost:5000/) for `SkillSphere API running`.

3. In a second terminal, install frontend dependencies and start Vite:

   ```powershell
   cd frontend
   npm ci
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173).

If MongoDB or Redis is instead running in Docker, make sure its port is published to the host before using these local-development commands. The Compose service names `mongo` and `redis` resolve inside the Compose network; they are not Windows hostnames.

## Redis and cache

Redis is the fast, temporary store used here to avoid recalculating project recommendations on every request. The backend stores recommendation responses for 30 minutes, returns a cached response when available, and removes relevant cached recommendations after profile, skill, project, or team changes. MongoDB remains the persistent database; if Redis is unavailable, cache reads and writes are skipped and requests continue without the cache.

The Compose setup configures the backend to use `redis://redis:6379`. A backend running directly on Windows should use `redis://localhost:6379` when Redis is installed on the host or its container port is published to the host.

### GitHub contribution tracking

This integration is separate from Redis caching. A project owner connects a GitHub repository from the project's **Contributions** tab using the GitHub OAuth App. Owners and faculty can then see GitHub contributor handles and commit counts. To associate those handles with SkillSphere team members, members save their GitHub username in **Profile → GitHub account**. GitHub commit counts are not a measure of code quality, lines changed, or effort.

The OAuth callback address has to match the address registered in the GitHub OAuth App. Docker Compose and local development both use `http://localhost:5173/github/callback`; the callback page exchanges the authorization code with the backend using the signed-in SkillSphere account. The project owner must stay signed in to the same SkillSphere account that started the connection. The OAuth App client secret and the encryption key must remain private. The `repo` scope is needed for private repositories. If the encryption key changes, stored tokens can no longer be decrypted; reconnect the affected project repositories with the same configured key.

### Check Redis health

From the project root, run:

```powershell
docker compose ps
docker compose exec -T redis redis-cli ping
```

The Redis command should print `PONG`. To inspect recent backend connection or cache errors:

```powershell
docker compose logs --since 15m backend
```

Look for `Redis connected successfully`, `Redis Client Warning`, or `Redis connection failed`. The recommendation API responses also include an `X-Cache` header: `MISS` means the result was calculated, and `HIT` means it was served from Redis. For example, an authenticated request to `GET /api/projects/{projectId}/recommendations` should generally show a miss first and a hit on a later request while the cache entry is still valid.

To inspect cached recommendation key names without printing their cached values:

```powershell
docker compose exec -T redis redis-cli --scan --pattern "recommendations:*"
```

### Optional backend cache round-trip check

This checks Redis through the backend's actual cache helper, rather than checking only that the Redis service responds. Run it from the project root while the Compose backend is running:

```powershell
docker compose exec -T backend node -e "const c=require('./src/config/redis'); (async()=>{await c.connectRedis(); const k='diagnostic:cache-roundtrip'; const set=await c.cacheSet(k,{ok:true},10); const value=await c.cacheGet(k); console.log(JSON.stringify({set,value})); await c.cacheDel(k); process.exit(set && value && value.ok ? 0 : 1)})().catch(e=>{console.error(e); process.exit(1)})"
```

Expected output includes `{"set":true,"value":{"ok":true}}`. The temporary diagnostic entry is deleted by the command.

## Common errors and fixes

| Symptom | Likely cause | How to fix |
| --- | --- | --- |
| `docker compose` cannot connect to Docker | Docker Desktop/Engine is stopped, or Compose v2 is unavailable. | Start Docker Desktop and check `docker compose version`, then retry. |
| Compose reports `backend/.env` is missing | The local environment file has not been created. | Run `Copy-Item backend\.env.example backend\.env` from the project root. |
| `MongoDB connection error` or backend never becomes healthy | MongoDB is stopped, still starting, or `MONGO_URI` points to the wrong host. | Check `docker compose ps` and `docker compose logs mongo`; in Compose use `mongodb://mongo:27017/skillsphere`, and for a host-installed local MongoDB use `mongodb://localhost:27017/skillsphere`. |
| `Redis connection failed` or `ECONNREFUSED` | Redis is stopped, or the backend cannot reach the hostname/port in `REDIS_URL`. | In Compose, check `docker compose ps` and `docker compose exec -T redis redis-cli ping`; use `redis://redis:6379` inside Compose and `redis://localhost:6379` for a host process with Redis available on the host. |
| Redis works but cache requests report `MISS` | It may be the first request, the key may have expired or been invalidated, or different project/user keys are being requested. | Repeat the same recommendation request before its 30-minute expiry; check its `X-Cache` header and backend logs. |
| Redis starts after the backend, but caching remains disabled | The Redis client may have exhausted its configured reconnect attempts. | Once Redis is healthy, run `docker compose restart backend` and inspect the backend logs for a successful Redis connection. |
| `EADDRINUSE` / port already in use | Another process is using port `5173` or `5000` (or a published service port). | Stop the conflicting application or configure the frontend's `FRONTEND_PORT` for Compose; keep the backend port and its configured API URL consistent for local development. |
| Login/token errors after setup | `JWT_SECRET` is still the example value or differs between backend restarts. | Set a strong, stable `JWT_SECRET` in `backend\.env` and restart the backend. Existing browser sessions may need to log in again. |
| Login says `Invalid email or password` | The account/password does not match the database the running backend uses, or the password was entered incorrectly. | Use the same registered email and case-sensitive password. Email capitalization and spaces around the email are ignored. Docker Compose uses its own `mongo_data` database volume; accounts created by a separate locally run backend/MongoDB are in a different database. |
| Password is forgotten | The original password cannot be retrieved because passwords are stored as hashes. | Select **Forgot password?** on the login page, enter the account email, and use the one-time link sent by email within 30 minutes. Check the spam folder and confirm SMTP is configured. |
| A faculty member cannot create an account on the public signup page | Public self-registration is intentionally limited to students. | Have a trusted administrator provision a verified Faculty account; the current app does not yet include an admin user-management screen. |
| Emails fail but the rest of the app works | SMTP settings are missing/incorrect, or Gmail rejected the credentials. | Configure `SMTP_USER`, `MAIL_FROM`, and a current Gmail App Password (with 2-Step Verification enabled) in `SMTP_PASS`; never use the normal Gmail password. Run the SMTP verify command above without sending a message, then recreate the backend container to reload `.env`. |
| SMTP verification returns `EAUTH` or Gmail `535-5.7.8 BadCredentials` | Gmail rejected the configured account/password. The server can be reached, but authentication did not succeed. | In the Google Account for `SMTP_USER`, enable 2-Step Verification and create a fresh App Password for `SMTP_PASS`. Replace the old value in `backend\.env`, confirm `MAIL_FROM` matches the sending account, recreate the backend with `docker compose up -d --force-recreate backend`, then run the SMTP verify command again. Do not paste the App Password into chat or logs. |
| GitHub connect reports OAuth is not configured | OAuth client settings or the encryption key are absent/invalid. | Configure `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and a 64-character hexadecimal `GITHUB_TOKEN_ENCRYPTION_KEY`, then restart the backend. |
| GitHub says `redirect_uri` mismatch or callback fails | The callback URL differs from the one registered in the OAuth App. | Use `http://localhost:5173/github/callback` and make the GitHub App and `GITHUB_CALLBACK_URL` values match exactly. |
| GitHub contribution request returns 401/403/404 | The authorizing account lost repository access, OAuth was revoked, or the URL points to a different repository. | Confirm the repo URL and account access, then reconnect the repository as its owner with the required `repo` scope. |
| Contributor appears but is not mapped to a SkillSphere member | Their GitHub handle is not saved on that member's profile or it differs from the GitHub login. | Have the member enter the exact GitHub username under **Profile → GitHub account**. |
| GitHub OAuth works but stored credentials cannot be decrypted | `GITHUB_TOKEN_ENCRYPTION_KEY` was changed or does not match the key used to encrypt the stored token. | Restore the original key from a secure backup or reconnect the project repository using the current key. |
| Browser cannot reach the API during local development | The backend is not running on port `5000`, or the frontend is configured with the wrong API base URL. | Start the backend and verify `http://localhost:5000/`; the default Vite API base is `http://localhost:5000/api`. |

## Current Redis check

During the latest troubleshooting session, the Compose Redis service reported healthy, `redis-cli ping` returned `PONG`, and a backend cache `SET`/`GET` round trip succeeded. A transient `Socket closed unexpectedly` warning appeared in the backend log, followed by a successful Redis reconnect. Re-run the health checks above to confirm the current state if the warning appears again.
