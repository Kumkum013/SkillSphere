#!/bin/bash

# SkillSphere Kubernetes Deployment Script
# This script automates the deployment process

set -e

echo "🚀 Starting SkillSphere Kubernetes Deployment..."

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Please install kubectl first."
    exit 1
fi

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Variables
NAMESPACE="skillsphere"
BACKEND_IMAGE="skillsphere-backend:latest"
FRONTEND_IMAGE="skillsphere-frontend:latest"

echo "📦 Building Docker images..."

# Build backend image
echo "Building backend image..."
cd backend
docker build -t $BACKEND_IMAGE .
cd ..

# Build frontend image
echo "Building frontend image..."
cd frontend
docker build -t $FRONTEND_IMAGE .
cd ..

echo "✅ Docker images built successfully"

# Load images into kind/minikube if using local cluster
# Uncomment if using kind or minikube
# if command -v kind &> /dev/null; then
#     echo "Loading images into kind cluster..."
#     kind load docker-image $BACKEND_IMAGE
#     kind load docker-image $FRONTEND_IMAGE
# fi

# Uncomment if using minikube
# if command -v minikube &> /dev/null; then
#     echo "Loading images into minikube..."
#     minikube image load $BACKEND_IMAGE
#     minikube image load $FRONTEND_IMAGE
# fi

echo "📝 Applying Kubernetes manifests..."

# Create namespace
echo "Creating namespace..."
kubectl apply -f k8s/namespace.yaml

# Apply ConfigMap and Secret
echo "Applying ConfigMap and Secret..."
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# Deploy MongoDB
echo "Deploying MongoDB..."
kubectl apply -f k8s/mongodb-deployment.yaml

# Deploy Redis
echo "Deploying Redis..."
kubectl apply -f k8s/redis-deployment.yaml

# Wait for MongoDB and Redis to be ready
echo "Waiting for MongoDB and Redis to be ready..."
kubectl wait --for=condition=ready pod -l app=mongodb -n $NAMESPACE --timeout=120s
kubectl wait --for=condition=ready pod -l app=redis -n $NAMESPACE --timeout=120s

# Deploy Backend
echo "Deploying Backend..."
kubectl apply -f k8s/backend-deployment.yaml

# Deploy Frontend
echo "Deploying Frontend..."
kubectl apply -f k8s/frontend-deployment.yaml

# Deploy Ingress
echo "Deploying Ingress..."
kubectl apply -f k8s/ingress.yaml

echo "⏳ Waiting for deployments to be ready..."
kubectl wait --for=condition=available deployment/skillsphere-backend -n $NAMESPACE --timeout=180s
kubectl wait --for=condition=available deployment/skillsphere-frontend -n $NAMESPACE --timeout=180s

echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Deployment Status:"
kubectl get pods -n $NAMESPACE
kubectl get services -n $NAMESPACE
kubectl get ingress -n $NAMESPACE

echo ""
echo "🎉 SkillSphere is now deployed on Kubernetes!"
echo ""
echo "To access the application:"
echo "  - Frontend: http://skillsphere.local (or your configured domain)"
echo "  - Backend API: http://skillsphere.local/api"
echo ""
echo "To view logs:"
echo "  kubectl logs -f deployment/skillsphere-backend -n $NAMESPACE"
echo "  kubectl logs -f deployment/skillsphere-frontend -n $NAMESPACE"
echo ""
echo "To scale deployments:"
echo "  kubectl scale deployment/skillsphere-backend --replicas=3 -n $NAMESPACE"
echo "  kubectl scale deployment/skillsphere-frontend --replicas=3 -n $NAMESPACE"
