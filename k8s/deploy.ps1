# SkillSphere Kubernetes Deployment Script for Windows
# This script automates the deployment process on Windows

Write-Host "🚀 Starting SkillSphere Kubernetes Deployment..." -ForegroundColor Green

# Check if kubectl is installed
if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) {
    Write-Host "❌ kubectl is not installed. Please install kubectl first." -ForegroundColor Red
    Write-Host "Download from: https://kubernetes.io/docs/tasks/tools/" -ForegroundColor Yellow
    exit 1
}

# Check if docker is installed
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is not installed. Please install Docker first." -ForegroundColor Red
    exit 1
}

# Variables
$NAMESPACE = "skillsphere"
$BACKEND_IMAGE = "skillsphere-backend:latest"
$FRONTEND_IMAGE = "skillsphere-frontend:latest"

Write-Host "📦 Building Docker images..." -ForegroundColor Cyan

# Build backend image
Write-Host "Building backend image..." -ForegroundColor Yellow
Set-Location backend
docker build -t $BACKEND_IMAGE .
Set-Location ..

# Build frontend image
Write-Host "Building frontend image..." -ForegroundColor Yellow
Set-Location frontend
docker build -t $FRONTEND_IMAGE .
Set-Location ..

Write-Host "✅ Docker images built successfully" -ForegroundColor Green

# Load images into kind/minikube if using local cluster
# Uncomment if using kind or minikube
# if (Get-Command kind -ErrorAction SilentlyContinue) {
#     Write-Host "Loading images into kind cluster..." -ForegroundColor Yellow
#     kind load docker-image $BACKEND_IMAGE
#     kind load docker-image $FRONTEND_IMAGE
# }

# Uncomment if using minikube
# if (Get-Command minikube -ErrorAction SilentlyContinue) {
#     Write-Host "Loading images into minikube..." -ForegroundColor Yellow
#     minikube image load $BACKEND_IMAGE
#     minikube image load $FRONTEND_IMAGE
# }

Write-Host "📝 Applying Kubernetes manifests..." -ForegroundColor Cyan

# Create namespace
Write-Host "Creating namespace..." -ForegroundColor Yellow
kubectl apply -f k8s/namespace.yaml

# Apply ConfigMap and Secret
Write-Host "Applying ConfigMap and Secret..." -ForegroundColor Yellow
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# Deploy MongoDB
Write-Host "Deploying MongoDB..." -ForegroundColor Yellow
kubectl apply -f k8s/mongodb-deployment.yaml

# Deploy Redis
Write-Host "Deploying Redis..." -ForegroundColor Yellow
kubectl apply -f k8s/redis-deployment.yaml

# Wait for MongoDB and Redis to be ready
Write-Host "Waiting for MongoDB and Redis to be ready..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l app=mongodb -n $NAMESPACE --timeout=120s
kubectl wait --for=condition=ready pod -l app=redis -n $NAMESPACE --timeout=120s

# Deploy Backend
Write-Host "Deploying Backend..." -ForegroundColor Yellow
kubectl apply -f k8s/backend-deployment.yaml

# Deploy Frontend
Write-Host "Deploying Frontend..." -ForegroundColor Yellow
kubectl apply -f k8s/frontend-deployment.yaml

# Deploy Ingress
Write-Host "Deploying Ingress..." -ForegroundColor Yellow
kubectl apply -f k8s/ingress.yaml

Write-Host "⏳ Waiting for deployments to be ready..." -ForegroundColor Yellow
kubectl wait --for=condition=available deployment/skillsphere-backend -n $NAMESPACE --timeout=180s
kubectl wait --for=condition=available deployment/skillsphere-frontend -n $NAMESPACE --timeout=180s

Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host ""

Write-Host "📊 Deployment Status:" -ForegroundColor Cyan
kubectl get pods -n $NAMESPACE
kubectl get services -n $NAMESPACE
kubectl get ingress -n $NAMESPACE

Write-Host ""
Write-Host "🎉 SkillSphere is now deployed on Kubernetes!" -ForegroundColor Green
Write-Host ""
Write-Host "To access the application:" -ForegroundColor Yellow
Write-Host "  - Frontend: http://skillsphere.local (or your configured domain)" -ForegroundColor White
Write-Host "  - Backend API: http://skillsphere.local/api" -ForegroundColor White
Write-Host ""
Write-Host "To view logs:" -ForegroundColor Yellow
Write-Host "  kubectl logs -f deployment/skillsphere-backend -n $NAMESPACE" -ForegroundColor White
Write-Host "  kubectl logs -f deployment/skillsphere-frontend -n $NAMESPACE" -ForegroundColor White
Write-Host ""
Write-Host "To scale deployments:" -ForegroundColor Yellow
Write-Host "  kubectl scale deployment/skillsphere-backend --replicas=3 -n $NAMESPACE" -ForegroundColor White
Write-Host "  kubectl scale deployment/skillsphere-frontend --replicas=3 -n $NAMESPACE" -ForegroundColor White
