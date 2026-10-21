# Technical Requirements Document (TRD)

## Project Name: SkillSphere 🎓
**System Architecture & Technical Specifications**  
**Document Version:** 2.0.0  
**Status:** Approved / Production Architecture  
**Tech Lead / Architect:** SkillSphere Engineering  

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture Diagram
SkillSphere follows a modern microservice-ready 3-tier cloud architecture consisting of a Single Page Application (SPA) frontend, an Express/Node.js RESTful API backend, a MongoDB document store, and a Redis in-memory cache/accelerator, all containerized and orchestratable via Kubernetes or Docker Compose.

```
+-------------------------------------------------------------------------+
|                              CLIENT LAYER                               |
|        React 18 SPA (Vite, Tailwind CSS, Lucide Icons, Framer Motion)   |
|                             Port: 5173 / 80                             |
+-------------------------------------------------------------------------+
                                     |
                          HTTPS / REST API / Axios
                                     v
+-------------------------------------------------------------------------+
|                           API GATEWAY / INGRESS                         |
|                   Kubernetes NGINX Ingress / Port 80/443                |
|                    Rate Limiter, Helmet, CORS, SSL                      |
+-------------------------------------------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                           APPLICATION LAYER                             |
|                 Node.js (v20+) / Express.js Application                 |
|                               Port: 5000                                |
|  - Auth & RBAC Middleware          - Recommendation Engine              |
|  - Project & Task Controllers      - GitHub API Telemetry & Scoring     |
|  - OCR & Resume Parser             - SMTP Transactional Mailer          |
+-------------------------------------------------------------------------+
                  |                                     |
                  v                                     v
+-----------------------------------+ +-----------------------------------+
|          DATA PERSISTENCE         | |          CACHE & BUFFER           |
|            MongoDB 6.0            | |             Redis 7.0             |
|            Port: 27017            | |            Port: 6379             |
|  - Compound & Multikey Indexes    | |  - Candidate Match Caching        |
|  - ACID Document Transactions     | |  - Cache Metrics (Hits/Misses)    |
|  - Persistent Volume Claims       | |  - TTL Auto-Invalidation          |
+-----------------------------------+ +-----------------------------------+
```

---

## 2. Technology Stack & Environment Specifications

| Component | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Runtime** | React.js | `^18.3.1` | UI View and Component Rendering |
| **Build Tooling** | Vite | `^5.3.1` | Next-generation frontend bundler & dev server |
| **Styling** | Tailwind CSS | `^3.4.4` | Utility-first responsive design system |
| **UI Enhancements** | Framer Motion, Lucide | `^11.2.10`, `^0.400.0` | Micro-interactions and interface iconography |
| **Client-Side OCR** | Tesseract.js, PDF.js | `^6.0.1`, `^4.10.38` | Browser-side PDF text extraction and OCR parsing |
| **Backend Runtime** | Node.js | `>=18.0.0` | Server-side JavaScript execution environment |
| **API Framework** | Express.js | `^4.19.2` | RESTful routing, middleware orchestration |
| **Primary Database** | MongoDB | `>=6.0` | Schema-less document database for entities |
| **ODM Layer** | Mongoose | `^8.4.0` | Strict schema definition, validation, indexing |
| **In-Memory Cache** | Redis | `>=7.0-alpine` | Sub-millisecond recommendation caching |
| **Authentication** | JWT, Passport.js, OAuth2 | `^9.0.2`, `^0.7.0` | Stateless token auth & GitHub OAuth integration |
| **Containerization** | Docker, Docker Compose | `Engine 24+` | Container lifecycle & multi-container setup |
| **Orchestration** | Kubernetes / Kind | `v1.31+` | Production deployment, autoscaling, ingress |

---

## 3. Data Architecture & Database Schemas

All entities are managed via Mongoose schemas in MongoDB with explicit compound and multikey indexing to ensure query optimization.

### 3.1 User Schema (`User.js`)
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatarUrl: { type: String, default: '' },
  password: { type: String }, // Hashed with bcryptjs (10 rounds)
  role: { type: String, enum: ['STUDENT', 'FACULTY', 'ADMIN'], default: 'STUDENT' },
  branch: { type: String },
  year: { type: Number, min: 1, max: 5 },
  availability: { type: String, enum: ['available', 'busy'], default: 'available' },
  skills: [{
    skillId: { type: ObjectId, ref: 'Skill' },
    name: String,
    level: { type: Number, min: 1, max: 5 },
    endorsedBy: [{ type: ObjectId, ref: 'User' }]
  }],
  github: {
    id: { type: String, sparse: true },
    username: String,
    accessToken: String,
    profileUrl: String,
    avatarUrl: String
  }
}
```
**Optimized Indexes:**
- `{ role: 1, year: 1, branch: 1 }` (Compound index for student directory queries)
- `{ 'skills.skillId': 1 }` (Multikey index for fast candidate skill queries)
- `{ role: 1, createdAt: -1 }` (Index for recent signups)

### 3.2 Project Schema (`project.js`)
```javascript
{
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  ownerId: { type: ObjectId, ref: 'User', required: true },
  requiredSkills: [{
    skillId: { type: ObjectId, ref: 'Skill', required: true },
    name: String,
    weight: { type: Number, default: 1 }
  }],
  minMatchScore: { type: Number, default: 50, min: 0, max: 100 },
  members: [{
    userId: { type: ObjectId, ref: 'User' },
    name: String,
    joinedAt: { type: Date, default: Date.now }
  }],
  status: { type: String, enum: ['OPEN', 'IN_PROGRESS', 'CLOSED', 'COMPLETED'], default: 'OPEN' },
  mentorId: { type: ObjectId, ref: 'User', default: null },
  isFacultyApproved: { type: Boolean, default: false },
  githubRepo: {
    url: String,
    owner: String,
    repoName: String,
    lastSyncedAt: Date
  }
}
```
**Optimized Indexes:**
- `{ ownerId: 1, createdAt: -1 }`
- `{ status: 1, createdAt: -1 }`
- `{ 'members.userId': 1 }`
- `{ 'requiredSkills.skillId': 1 }`
- `{ mentorId: 1 }`

### 3.3 Task Schema (`task.js`)
```javascript
{
  projectId: { type: ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  requiredSkill: { type: String, default: '' },
  deadline: { type: Date },
  assignedBy: { type: ObjectId, ref: 'User', required: true },
  assignedTo: { type: ObjectId, ref: 'User' },
  status: { type: String, enum: ['TODO', 'IN_PROGRESS', 'PENDING_REVIEW', 'COMPLETED'], default: 'TODO' },
  completedAt: { type: Date }
}
```
**Optimized Indexes:**
- `{ projectId: 1, createdAt: -1 }`
- `{ assignedTo: 1, status: 1 }`
- `{ deadline: 1 }`

### 3.4 Contribution Schema (`contribution.js`)
```javascript
{
  projectId: { type: ObjectId, ref: 'Project', required: true },
  userId: { type: ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  repository: { type: String, required: true },
  githubUsername: { type: String, required: true },
  contributionType: { type: String, enum: ['COMMIT', 'PULL_REQUEST', 'ISSUE', 'CODE_REVIEW', 'MERGE'], required: true },
  title: { type: String, required: true },
  description: String,
  url: String,
  issueNumber: Number,
  pullRequestNumber: Number,
  commitHash: String,
  linesAdded: { type: Number, default: 0 },
  linesDeleted: { type: Number, default: 0 },
  filesChanged: { type: Number, default: 0 },
  contributionScore: { type: Number, default: 0 },
  reviewedBy: { type: ObjectId, ref: 'User' },
  reviewStatus: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  reviewComment: String,
  githubCreatedAt: Date,
  mergedAt: Date,
  closedAt: Date
}
```

---

## 4. RESTful API Contract & Endpoints

All private endpoints require Bearer JWT authorization: `Authorization: Bearer <TOKEN>`.

### 4.1 Authentication & Profile
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new Student or Faculty |
| `POST` | `/api/auth/login` | Public | Authenticate user and issue JWT |
| `GET` | `/api/auth/github` | Public | Initiate GitHub OAuth2 flow |
| `GET` | `/api/auth/github/callback` | Public | OAuth callback handler |
| `POST` | `/api/auth/github/link` | Authenticated | Link GitHub profile manually |
| `GET` | `/api/students/me` | Authenticated | Retrieve authenticated user profile |
| `PUT` | `/api/students/me` | Authenticated | Update branch, year, availability |
| `POST` | `/api/students/skills` | Authenticated | Add/update skills in profile |

### 4.2 Projects & Recommendations
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/projects` | Authenticated | List all active projects |
| `POST` | `/api/projects` | Authenticated | Create new project |
| `GET` | `/api/projects/:id` | Authenticated | Get project details & team roster |
| `GET` | `/api/projects/:id/recommendations` | Authenticated | Execute heuristic candidate matching |
| `POST` | `/api/projects/:id/join` | Authenticated | Submit join request to project |
| `GET` | `/api/projects/:id/join-requests` | Project Owner | View pending join requests |
| `PUT` | `/api/projects/:id/join-requests/:reqId` | Project Owner | Accept/Reject join request |

### 4.3 Tasks & Todos
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tasks/project/:projectId` | Project Members | Get all project tasks |
| `POST` | `/api/tasks` | Project Members | Create new task |
| `PUT` | `/api/tasks/:id/status` | Assigned User / Lead | Transition task status |
| `GET` | `/api/todos` | Authenticated | Get personal todo items |
| `POST` | `/api/todos` | Authenticated | Create personal todo item |

### 4.4 Contributions & GitHub Sync
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/contributions/projects/:projectId/link-repo` | Project Owner | Link GitHub repository |
| `POST` | `/api/contributions/projects/:projectId/sync` | Project Members | Sync commits, PRs, issues |
| `GET` | `/api/contributions/projects/:projectId/summary` | Authenticated | Aggregate contribution leaderboard |
| `GET` | `/api/contributions/projects/:projectId/user/:userId` | Authenticated | Detailed user contribution history |

### 4.5 Faculty & Governance
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/faculty/pending-projects` | Faculty | List projects awaiting approval |
| `POST` | `/api/faculty/approve/:projectId` | Faculty | Approve academic project |
| `POST` | `/api/faculty/reject/:projectId` | Faculty | Reject project with feedback |
| `POST` | `/api/faculty/endorse-skill` | Faculty / Peer | Endorse student technical skill |

---

## 5. Core Algorithms & Logic Specifications

### 5.1 Heuristic Skill Matching Engine (`matchController.js`)
The algorithm identifies candidates $C \in \text{Students}$ who are not yet project members and possess at least one of the project's required skills $R$.

$$\text{Base Score} = \frac{\sum_{s \in R \cap C_{\text{skills}}} \text{Weight}_s \times \left(0.40 + 0.60 \times \frac{\text{Proficiency}_s}{5}\right)}{\sum_{s \in R} \text{Weight}_s} \times 100$$

**Modifiers applied to Base Score:**
1. **Endorsement Boost:**
   $$\text{Bonus}_{\text{endorse}} = \min(N_{\text{endorsements}} \times 3, 15)\%$$
2. **Availability Modifier:**
   $$\text{Modifier}_{\text{avail}} = \begin{cases} 0\% & \text{if } \text{status} = \text{'available'} \\ -15\% & \text{if } \text{status} = \text{'busy'} \end{cases}$$
3. **Active Workload Penalty:**
   $$\text{Penalty}_{\text{workload}} = \min(N_{\text{active tasks}} \times 5, 25)\%$$
4. **Final Compatibility Score:**
   $$\text{Final Score} = \max(0, \min(100, \text{Base Score} + \text{Bonus}_{\text{endorse}} + \text{Modifier}_{\text{avail}} - \text{Penalty}_{\text{workload}}))$$

### 5.2 Dynamic Contribution Scoring (`contribution.js`)
Each synced GitHub activity is mapped to points before persisting:

$$\text{Score} = \text{BasePoints}_{\text{type}} + \text{Bonus}_{\text{LOC}} + \text{Bonus}_{\text{Files}} + \text{Bonus}_{\text{Merge}}$$

- $\text{BasePoints}$:
  - Commit $= 5$
  - Pull Request $= 20$
  - Issue $= 10$
  - Code Review $= 15$
  - Merge $= 25$
- $\text{Bonus}_{\text{LOC}} = \min\left(\frac{\text{Lines Added}}{10}, 20\right)$
- $\text{Bonus}_{\text{Files}} = \min(\text{Files Changed} \times 2, 10)$
- $\text{Bonus}_{\text{Merge}} = +10$ (applied to PR if status is merged)

---

## 6. Caching & Performance Architecture

### 6.1 Redis Key Design & Invalidation Strategy
- **Key Pattern:** `recommendations:{projectId}`
- **TTL (Time to Live):** 3600 seconds (1 hour).
- **Invalidation Triggers:**
  - `cacheDel('recommendations:' + projectId)` invoked upon new member addition, join-request acceptance, or project skill modifications.
- **Cache Observability:**
  - Header injection: `X-Cache: HIT` vs `X-Cache: MISS`.
  - In-memory instrumentation (`cacheMetrics.js`) tracking hit ratios, set operations, and latency quantiles.

### 6.2 Redis Fail-Safe Resilience Pattern
If the Redis daemon or container is temporarily down:
```javascript
// Graceful fallback to persistent database without process crashing
redisClient.on('error', (err) => {
  console.warn('⚠️ Redis unavailable: Continuing without caching.');
});
```

---

## 7. Security Architecture

1. **HTTP Security Headers:** Integrated `helmet()` protecting against MIME sniffing, Clickjacking (X-Frame-Options), and XSS vectors.
2. **NoSQL Injection Defense:** Custom middleware `sanitizeNoSql` sanitizing recursive object structures against operator injection (`$gt`, `$where`, etc.).
3. **Rate Limiting:** `express-rate-limit` restricting client requests to 100 calls per 15 minutes per IP on `/api` routes.
4. **Credential Isolation:** No credentials hardcoded; centralized `.env` runtime extraction and Kubernetes Secret mounting.

---

## 8. Deployment & Cloud Infrastructure

### 8.1 Docker Multi-Container Architecture (`docker-compose.yml`)
- `skillsphere-mongo`: MongoDB 6 database with local volume persistence `mongo_data`.
- `skillsphere-redis`: Redis alpine lightweight in-memory cache with volume `redis_data`.
- `skillsphere-backend`: Node.js multi-stage container mapped on port `5000:5000`.
- `skillsphere-frontend`: Nginx / Vite production build serving client assets on port `5173:80`.

### 8.2 Kubernetes Architecture (`k8s/`)
SkillSphere provides native Kubernetes cluster deployment definitions configured for Kind or Minikube:
- **Namespace:** `skillsphere` (Isolated environment).
- **ConfigMap (`configmap.yaml`):** Stores non-sensitive parameters (`PORT: 5000`, `SMTP_PORT: 587`).
- **Secret (`secret.yaml`):** Stores Base64-encoded credentials (`MONGO_URI`, `REDIS_URL`, `JWT_SECRET`, `GITHUB_CLIENT_SECRET`, `SMTP_PASS`).
- **Deployments & Services:**
  - `mongodb-deployment.yaml` (ClusterIP: `mongodb:27017` + PersistentVolumeClaim).
  - `redis-deployment.yaml` (ClusterIP: `redis:6379`).
  - `backend-deployment.yaml` (3 replicas, RollingUpdate, Liveness/Readiness probes at `/`, ClusterIP: `backend-service:5000`).
  - `frontend-deployment.yaml` (2 replicas, NGINX reverse proxy, ClusterIP: `frontend-service:80`).
- **Ingress (`ingress.yaml`):** NGINX Ingress Controller routing `/` to frontend and `/api` to backend.

---

## 9. Verification & Health Monitoring

- Backend Health Check: `GET /` $\rightarrow$ `200 OK` (`"SkillSphere API running"`).
- Frontend App Check: `GET /` $\rightarrow$ `200 OK` (React SPA bootstrap).
- Cache Performance Diagnostics: `GET /api/metrics/cache` $\rightarrow$ Live statistics on hits, misses, latency, and keyspace size.
