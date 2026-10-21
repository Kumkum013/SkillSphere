# SkillSphere Project Guide 🎓

**Complete Guide - Beginners भी easily use कर सकते हैं**

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Project Structure](#project-structure)
4. [Setup Instructions](#setup-instructions)
5. [Running the Project](#running-the-project)
6. [Features & Modules](#features--modules)
7. [GitHub Integration & Contribution Tracking](#github-integration--contribution-tracking)
8. [Kubernetes Deployment](#kubernetes-deployment)
9. [API Endpoints](#api-endpoints)
10. [Database Structure](#database-structure)
11. [Common Issues & Solutions](#common-issues--solutions)
12. [Docker Setup (Optional)](#docker-setup-optional)

---

## 🎯 Project Overview

**SkillSphere** एक Student Project Collaboration Platform है जो students को projects पर काम करने में help करता है।

### Key Features:
- **Skill Matching**: Students को skills के according में projects में match करना
- **Project Management**: Projects create, manage और track करना
- **Task Management**: Tasks assign और track करना
- **Chat System**: Team members के साथ chat करना
- **Faculty Approval**: Faculty से project approval लेना
- **Resume Scanning**: PDF से skills automatically extract करना
- **GitHub Integration**: GitHub accounts link करना और contributions track करना
- **Contribution Tracking**: Team members की contributions automatically track करना

### Tech Stack:
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Caching**: Redis
- **Frontend**: React.js, Vite
- **Styling**: Tailwind CSS
- **Authentication**: JWT (JSON Web Tokens)

---

## 📦 Prerequisites

इन software को install करना जरूरी है:

### 1. Node.js (Required)
- Download: https://nodejs.org/
- Version: 18.x या higher
- Install करने के बाद check करें:
  ```bash
  node --version
  npm --version
  ```

### 2. MongoDB (Required)
- Download: https://www.mongodb.com/try/download/community
- Install करें और start करें
- Check करें:
  ```bash
  mongosh
  ```
  अगर connect हो जाए तो MongoDB चल रहा है

### 3. Redis (Required for Caching)
- Option 1: Docker Desktop के साथ (Recommended)
- Option 2: Memurai (Windows specific)
- Setup instructions नीचे दी गई हैं

### 4. Docker Desktop (Optional)
- Download: https://www.docker.com/products/docker-desktop/
- Useful for Redis और full project deployment

---

## 📁 Project Structure

```
SkillSphere2.0-main/
├── backend/                    # Backend API
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   │   ├── db.js          # MongoDB connection
│   │   │   └── redis.js       # Redis connection
│   │   ├── models/            # Database Models
│   │   │   ├── User.js        # Student/Faculty/Admin
│   │   │   ├── project.js     # Project schema
│   │   │   ├── task.js        # Task schema
│   │   │   ├── skill.js       # Skill schema
│   │   │   └── ...other models
│   │   ├── routes/            # API Routes
│   │   │   ├── authRoutes.js
│   │   │   ├── studentRoutes.js
│   │   │   ├── projectRoutes.js
│   │   │   └── ...other routes
│   │   ├── controllers/       # Business Logic
│   │   ├── middleware/        # Auth, validation
│   │   └── app.js             # Express app setup
│   ├── server.js              # Entry point
│   ├── package.json
│   └── .env                   # Environment variables
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── context/           # React Context
│   │   ├── services/          # API calls
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── docker-compose.yml         # Docker configuration
```

---

## 🚀 Setup Instructions

### Step 1: Project को Clone करें (अगर नहीं है)
```bash
git clone <repository-url>
cd SkillSphere2.0-main
```

### Step 2: MongoDB Setup

#### Option A: Local MongoDB Install
1. MongoDB Community Server download करें
2. Install करें और MongoDB service start करें
3. Check connection:
   ```bash
   mongosh
   ```

#### Option B: Docker में MongoDB
```bash
docker run -d --name skillsphere-mongo -p 27017:27017 mongo:6
```

### Step 3: Redis Setup

#### Option A: Docker में Redis (Recommended)
```bash
docker run -d --name skillsphere-redis -p 6379:6379 redis:7-alpine
```

#### Option B: Memurai (Windows)
1. Memurai download करें: https://www.memurai.com/
2. Install करें
3. It automatically starts on port 6379

### Step 4: Backend Setup

1. **Backend folder में जाएं:**
   ```bash
   cd backend
   ```

2. **Dependencies install करें:**
   ```bash
   npm install
   ```

3. **Environment file create करें:**
   - अगर `.env` file नहीं है तो create करें
   - `.env.example` को copy करके `.env` बनाएं
   - या manually create करें:

   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/skillsphere
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your_secret_key_here
   FRONTEND_URL=http://localhost:5173
   ```

4. **JWT_SECRET बदलें:**
   - कोई random string use करें
   - Example: `JWT_SECRET=skillsphere_secret_2026_secure_key`

### Step 5: Frontend Setup

1. **Frontend folder में जाएं:**
   ```bash
   cd frontend
   ```

2. **Dependencies install करें:**
   ```bash
   npm install
   ```

---

## ▶️ Running the Project

### Method 1: Manual (Development Mode)

#### 1. MongoDB Start करें
```bash
# Windows Services में MongoDB service start करें
# या command से:
mongod --dbpath C:\data\db
```

#### 2. Redis Start करें (Docker से)
```bash
docker start skillsphere-redis
```

#### 3. Backend Start करें
```bash
cd backend
npm start
# या development के लिए:
npm run dev
```

Expected Output:
```
MongoDB connected
⚡ Redis connected successfully
Server running on port 5000
```

#### 4. Frontend Start करें (New Terminal)
```bash
cd frontend
npm run dev
```

Expected Output:
```
VITE v5.x.x ready in xxx ms
➜  Local:   http://localhost:5173/
```

#### 5. Browser में Open करें
```
http://localhost:5173
```

---

### Method 2: Docker Compose (All-in-One)

```bash
# Project root में जाएं
cd SkillSphere2.0-main

# सभी services start करें
docker-compose up -d

# Logs देखें
docker-compose logs -f

# Stop करने के लिए
docker-compose down
```

---

## 🎨 Features & Modules

### 1. Authentication System
- **Registration**: Student और Faculty register कर सकते हैं
- **Login**: Email और password से login
- **JWT Tokens**: Secure authentication
- **Role-based Access**: Student, Faculty, Admin roles

### 2. Student Module
- **Profile Management**: Name, branch, year update करना
- **Skills Management**: Skills add और proficiency level set करना
- **Endorsements**: Faculty से skills endorse करवाना
- **Availability**: Available/Busy status set करना

### 3. Project Module
- **Create Project**: Title, description, required skills के साथ project create
- **Faculty Approval**: Faculty से approval लेना
- **Member Management**: Team members add करना
- **Skill Matching**: Auto match students based on skills

### 4. Task Module
- **Create Tasks**: Project के लिए tasks create करना
- **Assign Tasks**: Team members को tasks assign करना
- **Status Tracking**: TODO, IN_PROGRESS, COMPLETED status
- **Priority Levels**: High, Medium, Low priority

### 5. Chat Module
- **Real-time Chat**: Team members के साथ chat
- **Group Chat**: Project-based group chat
- **Message History**: Previous messages देखना

### 6. Notification Module
- **Invitation Alerts**: Project invitation notifications
- **Task Updates**: Task assignment और status updates
- **System Notifications**: Important system alerts

### 7. Resume Scanning
- **PDF Upload**: Resume PDF upload करना
- **Skill Extraction**: OCR से skills automatically extract
- **Auto-add Skills**: Extracted skills automatically add होते हैं

---

## � GitHub Integration & Contribution Tracking

### Overview
GitHub integration feature allows users to:
- **Link GitHub Account**: OAuth से GitHub account connect करना
- **Track Contributions**: Commits, Pull Requests, Issues automatically track करना
- **Contribution Dashboard**: Project manager को team contributions देखने का dashboard
- **Score System**: Automatic scoring based on contribution type और impact

### Setup GitHub OAuth

#### Step 1: GitHub OAuth App Create करें
1. GitHub पर login करें
2. Settings → Developer settings → OAuth Apps जाएं
3. "New OAuth App" click करें
4. Fill करें:
   - **Application name**: SkillSphere
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `http://localhost:5000/api/auth/github/callback`
5. "Register application" click करें
6. **Client ID** और **Client Secret** copy करें

#### Step 2: Environment Variables Configure करें
Backend `.env` file में add करें:
```env
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
GITHUB_TOKEN=your_github_personal_access_token_here # Optional
```

#### Step 3: GitHub Account Link करें
**Option A: OAuth से Link करना**
1. Frontend में "Link GitHub" button click करें
2. GitHub पर redirect होंगे
3. Authorize करें
4. Automatically redirect हो जाएंगे

**Option B: Manual Link करना**
```bash
POST /api/auth/github/link
{
  "githubUsername": "your_github_username"
}
```

### Contribution Tracking Workflow

#### 1. Project को GitHub Repository से Link करें
```bash
POST /api/contributions/projects/:projectId/link-repo
{
  "repoUrl": "https://github.com/owner/repo-name"
}
```

#### 2. Team Members को GitHub Link करवाएं
- सभी team members को अपना GitHub account link करना जरूरी है
- Profile settings से GitHub account link कर सकते हैं

#### 3. Contributions Sync करें
```bash
POST /api/contributions/projects/:projectId/sync
```
यह automatically fetch करेगा:
- **Commits**: उस repository में सभी commits
- **Pull Requests**: Open और closed PRs
- **Issues**: Created issues
- **Merges**: Merged PRs

#### 4. Contribution Dashboard देखें
```bash
GET /api/contributions/projects/:projectId/summary
```
यह देगा:
- Per-user contribution summary
- Total score per member
- Contribution types breakdown
- Recent activity
- Rankings

### Contribution Scoring System

**Base Scores:**
- **Commit**: 5 points
- **Pull Request**: 20 points
- **Issue**: 10 points
- **Code Review**: 15 points
- **Merge**: 25 points

**Bonus Points:**
- **Lines of Code**: +1 point per 10 lines (max 20)
- **Files Changed**: +2 points per file (max 10)
- **Merged PR**: +10 bonus points

**Example:**
- PR with 50 lines, 3 files, merged = 20 + 5 + 6 + 10 = **41 points**

### API Endpoints for GitHub Integration

#### Authentication (`/api/auth`)
- `GET /github` - GitHub OAuth login initiate करें
- `GET /github/callback` - GitHub OAuth callback
- `POST /github/link` - GitHub account manually link करें
- `POST /github/unlink` - GitHub account unlink करें

#### Contributions (`/api/contributions`)
- `POST /projects/:projectId/link-repo` - GitHub repository link करें
- `POST /projects/:projectId/sync` - GitHub contributions sync करें
- `GET /projects/:projectId` - सभी contributions fetch करें
- `GET /projects/:projectId/summary` - Contribution summary fetch करें
- `POST /projects/:projectId/manual` - Manual contribution add करें
- `PUT /:contributionId/review` - Contribution review करें

### Frontend Usage

#### Contribution Dashboard Access
1. Project detail page जाएं
2. "Contributions" tab select करें
3. "Open Contribution Dashboard" button click करें
4. Full contribution dashboard दिखेगा

#### Dashboard Features
- **Summary Tab**: Team rankings और overall stats
- **Details Tab**: सभी contributions की detailed list
- **Sync Button**: GitHub से latest contributions sync करें
- **Link Repo Button**: GitHub repository link करें

### Database Models

#### User Model (Updated)
```javascript
{
  // ... existing fields
  github: {
    id: String,           // GitHub user ID
    username: String,     // GitHub username
    accessToken: String,  // OAuth access token
    profileUrl: String,   // GitHub profile URL
    avatarUrl: String     // GitHub avatar URL
  }
}
```

#### Project Model (Updated)
```javascript
{
  // ... existing fields
  githubRepo: {
    url: String,          // Repository URL
    owner: String,        // Repository owner
    repoName: String,     // Repository name
    lastSyncedAt: Date    // Last sync timestamp
  }
}
```

#### Contribution Model (New)
```javascript
{
  projectId: ObjectId,
  userId: ObjectId,
  userName: String,
  repository: String,
  githubUsername: String,
  contributionType: 'COMMIT' | 'PULL_REQUEST' | 'ISSUE' | 'CODE_REVIEW' | 'MERGE',
  title: String,
  description: String,
  url: String,
  linesAdded: Number,
  linesDeleted: Number,
  filesChanged: Number,
  contributionScore: Number,  // Auto-calculated
  reviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED',
  reviewedBy: ObjectId,
  reviewComment: String,
  githubCreatedAt: Date,
  mergedAt: Date,
  closedAt: Date
}
```

### Troubleshooting GitHub Integration

#### Issue 1: GitHub OAuth Fails
**Solution:**
- Client ID और Secret check करें
- Callback URL correct है check करें
- GitHub OAuth app settings verify करें

#### Issue 2: No Contributions Showing
**Solution:**
- सभी team members ने GitHub account link किया check करें
- Repository URL correct है verify करें
- Repository public है या access token use करें
- Sync button click करें

#### Issue 3: Rate Limit Errors
**Solution:**
- GitHub API rate limit (5000 requests/hour for authenticated)
- Personal access token use करें
- Sync frequency कम करें

#### Issue 4: Wrong Contributions Synced
**Solution:**
- Repository owner और name verify करें
- Team members के GitHub usernames check करें
- Repository में contributions verify करें

### Best Practices

1. **Regular Sync**: Daily या weekly sync करें
2. **Review Contributions**: Project manager को contributions review करनी चाहिए
3. **Transparent Scoring**: Team को scoring system explain करें
4. **Manual Entries**: GitHub में नहीं है तो manual entries allow करें
5. **Private Repos**: Private repositories के लिए access token use करें

---

## ☸️ Kubernetes Deployment

Kubernetes deployment provides scalable, production-ready deployment with automatic scaling, self-healing, and easy management.

### Prerequisites

1. **Kubernetes Cluster**
   - Minikube (for local development)
   - Kind (Kubernetes in Docker)
   - Cloud provider (GKE, EKS, AKS, etc.)
   - On-premise cluster

2. **kubectl** - Kubernetes command-line tool
   ```bash
   # Install kubectl
   # Windows: choco install kubernetes-cli
   # Mac: brew install kubectl
   # Linux: curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
   ```

3. **Docker** - For building images
   - Docker Desktop installed and running

### Kubernetes Manifests Structure

```
k8s/
├── namespace.yaml              # Namespace definition
├── configmap.yaml             # Configuration data
├── secret.yaml                # Sensitive data (passwords, tokens)
├── mongodb-deployment.yaml    # MongoDB deployment + service + PVC
├── redis-deployment.yaml      # Redis deployment + service + PVC
├── backend-deployment.yaml    # Backend deployment + service + HPA
├── frontend-deployment.yaml   # Frontend deployment + service + HPA
├── ingress.yaml               # Ingress for routing
├── deploy.sh                  # Linux/Mac deployment script
├── deploy.ps1                 # Windows PowerShell deployment script
└── SECRET_SETUP.md            # Secret encoding guide
```

### Step-by-Step Deployment

#### Step 1: Setup Kubernetes Cluster

**Option A: Using Minikube (Local)**
```bash
# Install Minikube
# Windows: choco install minikube
# Mac: brew install minikube
# Linux: curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64

# Start Minikube
minikube start

# Enable ingress
minikube addons enable ingress
```

**Option B: Using Kind (Local)**
```bash
# Install Kind
# Windows: choco install kind
# Mac: brew install kind
# Linux: go install sigs.k8s.io/kind@latest

# Create cluster
kind create cluster --name skillsphere
```

**Option C: Cloud Provider**
- **GKE (Google Cloud)**: Google Kubernetes Engine
- **EKS (AWS)**: Elastic Kubernetes Service
- **AKS (Azure)**: Azure Kubernetes Service

#### Step 2: Configure Secrets

**Important:** You must update the secrets with your actual values before deployment.

**Option A: Edit secret.yaml directly**
```bash
# Open k8s/secret.yaml and replace the base64 encoded values
# See k8s/SECRET_SETUP.md for encoding instructions
```

**Option B: Create secret from command line**
```bash
kubectl create secret generic skillsphere-secret \
  --from-literal=JWT_SECRET='your_strong_jwt_secret_here' \
  --from-literal=GITHUB_CLIENT_ID='your_github_client_id' \
  --from-literal=GITHUB_CLIENT_SECRET='your_github_client_secret' \
  --from-literal=GITHUB_TOKEN='your_github_personal_access_token' \
  --from-literal=EMAIL_HOST='smtp.gmail.com' \
  --from-literal=EMAIL_PORT='587' \
  --from-literal=EMAIL_USER='your_email@gmail.com' \
  --from-literal=EMAIL_PASS='your_app_password' \
  --namespace=skillsphere
```

#### Step 3: Build Docker Images

```bash
# Build backend image
cd backend
docker build -t skillsphere-backend:latest .
cd ..

# Build frontend image
cd frontend
docker build -t skillsphere-frontend:latest .
cd ..
```

#### Step 4: Load Images into Cluster (for local clusters)

**For Minikube:**
```bash
minikube image load skillsphere-backend:latest
minikube image load skillsphere-frontend:latest
```

**For Kind:**
```bash
kind load docker-image skillsphere-backend:latest --name skillsphere
kind load docker-image skillsphere-frontend:latest --name skillsphere
```

**For Cloud Providers:** Push images to container registry
```bash
# Tag images for registry
docker tag skillsphere-backend:latest your-registry/skillsphere-backend:latest
docker tag skillsphere-frontend:latest your-registry/skillsphere-frontend:latest

# Push to registry
docker push your-registry/skillsphere-backend:latest
docker push your-registry/skillsphere-frontend:latest

# Update image references in deployment manifests
```

#### Step 5: Deploy to Kubernetes

**Option A: Using Deployment Script (Recommended)**

**Windows:**
```powershell
cd k8s
.\deploy.ps1
```

**Linux/Mac:**
```bash
cd k8s
chmod +x deploy.sh
./deploy.sh
```

**Option B: Manual Deployment**
```bash
# Apply namespace
kubectl apply -f k8s/namespace.yaml

# Apply configuration
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# Deploy databases
kubectl apply -f k8s/mongodb-deployment.yaml
kubectl apply -f k8s/redis-deployment.yaml

# Wait for databases to be ready
kubectl wait --for=condition=ready pod -l app=mongodb -n skillsphere --timeout=120s
kubectl wait --for=condition=ready pod -l app=redis -n skillsphere --timeout=120s

# Deploy applications
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml

# Deploy ingress
kubectl apply -f k8s/ingress.yaml
```

#### Step 6: Verify Deployment

```bash
# Check all pods
kubectl get pods -n skillsphere

# Check services
kubectl get services -n skillsphere

# Check ingress
kubectl get ingress -n skillsphere

# Check deployments
kubectl get deployments -n skillsphere

# Check persistent volumes
kubectl get pvc -n skillsphere
```

Expected output:
```
NAME                                    READY   STATUS    RESTARTS   AGE
mongodb-xxxxx-xxxxx                     1/1     Running   0          2m
redis-xxxxx-xxxxx                       1/1     Running   0          2m
skillsphere-backend-xxxxx-xxxxx         1/1     Running   0          1m
skillsphere-backend-xxxxx-xxxxx         1/1     Running   0          1m
skillsphere-frontend-xxxxx-xxxxx        1/1     Running   0          1m
skillsphere-frontend-xxxxx-xxxxx        1/1     Running   0          1m
```

#### Step 7: Access the Application

**For Minikube:**
```bash
# Get Minikube IP
minikube ip

# Add to /etc/hosts (Linux/Mac) or C:\Windows\System32\drivers\etc\hosts (Windows)
<minikube-ip> skillsphere.local

# Access application
http://skillsphere.local
```

**For Kind:**
```bash
# Get cluster IP
kubectl get nodes -o wide

# Add to hosts file
<node-ip> skillsphere.local

# Access application
http://skillsphere.local
```

**For Cloud Providers:**
- Configure DNS to point to your load balancer IP
- Access via your domain

### Kubernetes Components Explained

#### 1. Namespace
- Isolates resources in a dedicated namespace `skillsphere`
- Prevents resource conflicts

#### 2. ConfigMap
- Stores non-sensitive configuration
- Environment variables for applications
- Easy to update without restarting pods

#### 3. Secret
- Stores sensitive data (passwords, tokens)
- Base64 encoded
- Secure than environment variables

#### 4. Deployment
- Manages pod replicas
- Self-healing (restarts failed pods)
- Rolling updates

#### 5. Service
- Exposes applications internally (ClusterIP)
- Load balancing between pods
- Service discovery

#### 6. PersistentVolumeClaim (PVC)
- Requests storage for databases
- MongoDB: 5Gi
- Redis: 1Gi
- Data persists across pod restarts

#### 7. HorizontalPodAutoscaler (HPA)
- Automatically scales based on CPU/memory
- Backend: 2-5 replicas
- Frontend: 2-5 replicas
- Scales under load

#### 8. Ingress
- External access to applications
- Routes traffic to services
- SSL/TLS termination (optional)

### Common Kubernetes Commands

#### View Logs
```bash
# Backend logs
kubectl logs -f deployment/skillsphere-backend -n skillsphere

# Frontend logs
kubectl logs -f deployment/skillsphere-frontend -n skillsphere

# MongoDB logs
kubectl logs -f deployment/mongodb -n skillsphere

# Redis logs
kubectl logs -f deployment/redis -n skillsphere
```

#### Scale Deployments
```bash
# Scale backend to 3 replicas
kubectl scale deployment/skillsphere-backend --replicas=3 -n skillsphere

# Scale frontend to 3 replicas
kubectl scale deployment/skillsphere-frontend --replicas=3 -n skillsphere
```

#### Update Applications
```bash
# Rollout restart
kubectl rollout restart deployment/skillsphere-backend -n skillsphere
kubectl rollout restart deployment/skillsphere-frontend -n skillsphere

# Check rollout status
kubectl rollout status deployment/skillsphere-backend -n skillsphere
```

#### Exec into Pod
```bash
# Get pod name
kubectl get pods -n skillsphere

# Exec into backend pod
kubectl exec -it <pod-name> -n skillsphere -- /bin/sh

# Exec into MongoDB pod
kubectl exec -it <pod-name> -n skillsphere -- mongosh
```

#### Delete Deployment
```bash
# Delete all resources in namespace
kubectl delete namespace skillsphere

# Or delete specific resources
kubectl delete -f k8s/
```

### Monitoring and Debugging

#### Check Pod Status
```bash
kubectl describe pod <pod-name> -n skillsphere
```

#### Check Events
```bash
kubectl get events -n skillsphere --sort-by='.lastTimestamp'
```

#### Port Forwarding (for debugging)
```bash
# Forward backend port
kubectl port-forward deployment/skillsphere-backend 5000:5000 -n skillsphere

# Forward frontend port
kubectl port-forward deployment/skillsphere-frontend 8080:80 -n skillsphere
```

### Production Considerations

#### 1. Resource Limits
- Adjust CPU/memory limits based on actual usage
- Monitor with Prometheus/Grafana

#### 2. Persistent Storage
- Use cloud storage classes for production
- Configure backups
- Set up snapshot policies

#### 3. Security
- Enable RBAC (Role-Based Access Control)
- Use network policies
- Enable pod security policies
- Scan images for vulnerabilities

#### 4. High Availability
- Use multiple replicas
- Spread across availability zones
- Configure health checks properly

#### 5. SSL/TLS
- Enable TLS in ingress
- Use cert-manager for automatic certificates
- Configure HTTPS only

#### 6. Logging and Monitoring
- Centralized logging (ELK stack, Loki)
- Metrics collection (Prometheus)
- Alerting (Alertmanager)

### Troubleshooting

#### Issue 1: Pods Not Starting
```bash
# Check pod status
kubectl get pods -n skillsphere

# Describe pod for details
kubectl describe pod <pod-name> -n skillsphere

# Check logs
kubectl logs <pod-name> -n skillsphere
```

#### Issue 2: Images Not Pulling
```bash
# Check image pull policy
kubectl describe deployment skillsphere-backend -n skillsphere

# Ensure images are in registry
docker images | grep skillsphere

# For local clusters, load images
minikube image load skillsphere-backend:latest
```

#### Issue 3: Persistent Volume Claims Pending
```bash
# Check storage class
kubectl get storageclass

# Check PVC status
kubectl describe pvc mongodb-pvc -n skillsphere

# Create storage class if needed
```

#### Issue 4: Ingress Not Working
```bash
# Check ingress controller
kubectl get pods -n ingress-nginx

# Check ingress configuration
kubectl describe ingress skillsphere-ingress -n skillsphere

# Ensure DNS is configured
nslookup skillsphere.local
```

### Cleanup

```bash
# Delete all resources
kubectl delete namespace skillsphere

# Delete Minikube cluster (if using Minikube)
minikube delete

# Delete Kind cluster (if using Kind)
kind delete cluster --name skillsphere
```

### Next Steps

1. **Setup Monitoring**: Install Prometheus and Grafana
2. **Setup Logging**: Configure centralized logging
3. **Setup CI/CD**: Automate deployments with GitHub Actions/Jenkins
4. **Setup Backup**: Configure database backups
5. **Setup SSL**: Enable HTTPS with cert-manager

---

## 🔌 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - New user registration
- `POST /login` - User login
- `GET /me` - Get current user profile

### Students (`/api/students`)
- `GET /` - Get all students
- `GET /:id` - Get student by ID
- `PUT /:id` - Update student profile
- `POST /:id/skills` - Add skill
- `PUT /:id/skills/:skillId` - Update skill level
- `POST /:id/resume` - Upload resume PDF

### Projects (`/api/projects`)
- `POST /` - Create new project
- `GET /` - Get all projects
- `GET /:id` - Get project by ID
- `PUT /:id` - Update project
- `DELETE /:id` - Delete project
- `POST /:id/approve` - Faculty approval
- `GET /:id/recommendations` - Get matched students
- `POST /:id/members` - Add team member

### Tasks (`/api/tasks`)
- `POST /` - Create task
- `GET /project/:projectId` - Get project tasks
- `PUT /:id` - Update task
- `DELETE /:id` - Delete task
- `PUT /:id/status` - Update task status

### Chat (`/api/chat`)
- `GET /:projectId` - Get chat messages
- `POST /:projectId` - Send message

### Faculty (`/api/faculty`)
- `GET /projects` - Get pending approvals
- `POST /projects/:id/approve` - Approve project
- `POST /students/:id/endorse` - Endorse student skill

### Metrics (`/api/metrics`)
- `GET /cache` - Get Redis cache hit rate and cache activity (Admin only; requires a Bearer token)
- Hit rate is reported as hits divided by total cache lookups since the backend started.

### Load testing and traffic capacity
The backend includes a load-test script, but the sustainable traffic level depends on the machine, database, Redis, endpoint, and workload. Measure it in a test environment rather than treating a benchmark result as a production guarantee.

```bash
cd backend
npm run loadtest -- --path /
npm run loadtest -- --capacity --path / --max-concurrency 100 --step 10
```

The capacity test increases concurrent requests until p95 latency exceeds 1000 ms or the error rate exceeds 1%. It reports the highest tested concurrency and observed requests per second that met those thresholds. To test a protected endpoint, set `LOAD_TEST_TOKEN` to a test user's JWT and pass its path with `--path`; for example, `/api/projects`.

By default, the API rate limiter allows 100 requests per IP per 15 minutes, so API load tests can reach that limit before the server reaches its capacity. In an isolated test environment, set `API_RATE_LIMIT_MAX` and `API_RATE_LIMIT_WINDOW_MS` to suitable positive integers before starting the backend. Defaults remain unchanged when these variables are not set. Do not raise production limits just to obtain a larger benchmark result.

---

## 🗄️ Database Structure

### User Model
```javascript
{
  name: String,
  email: String,
  password: String,      // Hashed
  role: 'STUDENT' | 'FACULTY' | 'ADMIN',
  branch: String,        // For students
  year: Number,          // For students
  skills: [{
    skillId: ObjectId,
    level: Number,       // 1-5
    endorsedBy: [ObjectId]  // Faculty IDs
  }],
  availability: 'available' | 'busy',
  createdAt: Date
}
```

### Project Model
```javascript
{
  title: String,
  description: String,
  requiredSkills: [{
    skillId: ObjectId,
    name: String,
    weight: Number       // Importance weight
  }],
  members: [{
    userId: ObjectId,
    role: String
  }],
  minMatchScore: Number, // Minimum score to match
  isFacultyApproved: Boolean,
  createdBy: ObjectId,
  createdAt: Date
}
```

### Task Model
```javascript
{
  title: String,
  description: String,
  projectId: ObjectId,
  assignedTo: ObjectId,
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'PENDING_REVIEW',
  priority: 'LOW' | 'MEDIUM' | 'HIGH',
  dueDate: Date,
  createdAt: Date
}
```

### Skill Model
```javascript
{
  name: String,
  category: String,
  createdAt: Date
}
```

---

## 🔧 Common Issues & Solutions

### Issue 1: MongoDB Connection Failed
**Error:** `MongoDB connection failed`

**Solutions:**
1. MongoDB service check करें:
   ```bash
   # Windows
   services.msc में MongoDB service check करें
   ```
2. MongoDB manually start करें:
   ```bash
   mongod --dbpath C:\data\db
   ```
3. `.env` में MONGO_URI check करें:
   ```env
   MONGO_URI=mongodb://localhost:27017/skillsphere
   ```

### Issue 2: Redis Connection Failed
**Error:** `⚠️ Redis unavailable: Continuing without caching.`

**Solutions:**
1. Redis container check करें:
   ```bash
   docker ps
   ```
2. Redis start करें:
   ```bash
   docker start skillsphere-redis
   ```
3. New container create करें:
   ```bash
   docker run -d --name skillsphere-redis -p 6379:6379 redis:7-alpine
   ```

### Issue 3: Port Already in Use
**Error:** `EADDRINUSE: address already in use :::5000`

**Solutions:**
1. Process kill करें:
   ```bash
   # Windows PowerShell
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```
2. Port change करें `.env` में:
   ```env
   PORT=5001
   ```

### Issue 4: npm install Failed
**Error:** Package installation errors

**Solutions:**
1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```
2. Delete node_modules और reinstall:
   ```bash
   rmdir /s node_modules
   npm install
   ```
3. Node version check करें (18.x या higher required)

### Issue 5: Frontend Not Connecting to Backend
**Error:** API calls failing, CORS errors

**Solutions:**
1. Backend running है check करें (port 5000)
2. Frontend की API URL check करें:
   ```javascript
   // frontend/src/services/api.js
   const API_URL = 'http://localhost:5000/api';
   ```
3. CORS enabled है check करें (backend/src/app.js)

### Issue 6: Docker Not Working
**Error:** Docker commands not found

**Solutions:**
1. Docker Desktop installed है check करें
2. Docker Desktop start करें
3. WSL integration enable करें:
   - Docker Desktop → Settings → Resources → WSL Integration
   - Enable integration

---

## 🐳 Docker Setup (Optional)

### Full Docker Deployment

**Prerequisites:**
- Docker Desktop installed और running

**Steps:**

1. **Environment setup:**
   ```bash
   # docker-compose.yml already configured
   # No additional setup needed
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **Check status:**
   ```bash
   docker-compose ps
   ```

4. **View logs:**
   ```bash
   docker-compose logs -f backend
   docker-compose logs -f frontend
   ```

5. **Stop services:**
   ```bash
   docker-compose down
   ```

6. **Stop with volumes (complete cleanup):**
   ```bash
   docker-compose down -v
   ```

**Services:**
- MongoDB: Port 27017
- Redis: Port 6379
- Backend: Port 5000
- Frontend: Port 5173

---

## 📝 Environment Variables Reference

### Backend `.env`
```env
# Server Configuration
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/skillsphere

# Redis
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your_random_secret_key_here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Email (Optional - for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Frontend Configuration
No `.env` required by default, but can add:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🎓 User Roles & Permissions

### Student
- Create profile और add skills
- Browse projects
- Apply for projects
- View assigned tasks
- Update task status
- Chat with team members

### Faculty
- View all projects
- Approve/reject projects
- Endorse student skills
- Monitor student progress
- Access analytics

### Admin
- Full system access
- User management
- System configuration
- Database operations

---

## 🔄 Workflow Example

### Creating a Project (Student Perspective)

1. **Login** as Student
2. **Go to Projects** → "Create New Project"
3. **Fill Details:**
   - Project Title
   - Description
   - Required Skills (with weights)
   - Minimum Match Score
4. **Submit** project
5. **Wait for Faculty Approval**
6. **Once Approved:**
   - View matched students
   - Send invitations
   - Assign tasks to team members

### Skill Matching Process

1. **Student Profile:**
   - Skills with proficiency levels (1-5)
   - Endorsements from faculty
   - Current workload (active tasks)
   - Availability status

2. **Project Requirements:**
   - Required skills with weights
   - Minimum match score threshold

3. **Matching Algorithm:**
   - Skill match score (50% weight)
   - Workload score (30% weight)
   - Availability score (20% weight)
   - Endorsement bonus (up to +10 points)

4. **Result:**
   - Ranked list of eligible students
   - Match score for each student
   - Detailed breakdown

---

## 📊 Monitoring & Debugging

### Backend Logs
```bash
cd backend
npm start
# Logs appear in terminal
```

### Frontend Logs
```bash
cd frontend
npm run dev
# Check browser console (F12)
```

### MongoDB Logs
```bash
# Check MongoDB logs
# Usually in: C:\Program Files\MongoDB\Server\6.0\log\mongod.log
```

### Redis Logs
```bash
docker logs skillsphere-redis
```

---

## 🚀 Deployment Tips

### Production Checklist
- [ ] Change JWT_SECRET to strong random key
- [ ] Use environment-specific config
- [ ] Enable HTTPS
- [ ] Set up production database
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up monitoring
- [ ] Configure logging
- [ ] Backup strategy

### Security Best Practices
- Never commit `.env` file
- Use strong passwords
- Enable helmet.js headers
- Implement rate limiting
- Validate all inputs
- Use parameterized queries
- Regular security updates

---

## 🆘 Help & Support

### Useful Commands
```bash
# Backend restart
cd backend && npm start

# Frontend restart
cd frontend && npm run dev

# Docker services
docker-compose up -d
docker-compose down

# MongoDB backup
mongodump --db skillsphere --out backup/

# MongoDB restore
mongorestore --db skillsphere backup/skillsphere
```

### Documentation Links
- Node.js: https://nodejs.org/docs/
- Express: https://expressjs.com/
- MongoDB: https://www.mongodb.com/docs/
- React: https://react.dev/
- Docker: https://docs.docker.com/

---

## 📞 Contact

अगर कोई issue हो तो:
1. इस guide में check करें
2. Common issues section देखें
3. Logs check करें
4. Team से contact करें

---

**Happy Coding! 🎉**
