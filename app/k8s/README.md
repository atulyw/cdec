# CloudBlitz Backend - Kubernetes Deployment

This directory contains Kubernetes manifests for deploying the CloudBlitz backend services to Amazon EKS.

## Architecture

- **Auth Service**: User authentication and JWT token management
- **Course Service**: Course CRUD operations
- **Enrollment Service**: User course enrollments
- **MongoDB**: External SaaS MongoDB (not deployed in cluster)

## Prerequisites

1. **EKS Cluster**: Running Amazon EKS cluster
2. **Docker Registry**: Accessible Docker registry for images
3. **MongoDB SaaS**: External MongoDB instance
4. **Ingress Controller**: NGINX Ingress Controller installed
5. **Cert Manager**: For SSL certificate management

## Environment Variables

Update the following in your Jenkins pipeline:

```bash
AWS_REGION=us-east-1
EKS_CLUSTER_NAME=backend-dev-cluster
DOCKER_REGISTRY=your-docker-registry.com
```

## Deployment Structure

```
k8s/
├── namespace.yaml          # CloudBlitz namespace
├── configmap.yaml          # Shared configuration
├── ingress.yaml            # API routing and SSL
└── README.md              # This file

backend/
├── auth-service/
│   ├── k8s/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   └── Jenkinsfile
├── course-service/
│   ├── k8s/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   └── Jenkinsfile
└── enrollment-service/
    ├── k8s/
    │   ├── deployment.yaml
    │   └── service.yaml
    └── Jenkinsfile
```

## Services

### Auth Service
- **Port**: 8081
- **Health Check**: `/api/auth/health`
- **Database**: `cb_auth`

### Course Service
- **Port**: 8082
- **Health Check**: `/api/courses/health`
- **Database**: `cb_courses`

### Enrollment Service
- **Port**: 8083
- **Health Check**: `/api/enroll/health`
- **Database**: `cb_enrollments`

## Ingress Configuration

The ingress routes traffic from `api.cloudblitz.in` to the appropriate services:

- `https://api.cloudblitz.in/api/auth/*` → Auth Service
- `https://api.cloudblitz.in/api/courses/*` → Course Service
- `https://api.cloudblitz.in/api/enroll/*` → Enrollment Service

## Deployment Commands

### Manual Deployment

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Create configmap
kubectl apply -f k8s/configmap.yaml

# Deploy services
kubectl apply -f backend/auth-service/k8s/
kubectl apply -f backend/course-service/k8s/
kubectl apply -f backend/enrollment-service/k8s/

# Deploy ingress
kubectl apply -f k8s/ingress.yaml
```

### Check Deployment Status

```bash
# Check pods
kubectl get pods -n cloudblitz

# Check services
kubectl get services -n cloudblitz

# Check ingress
kubectl get ingress -n cloudblitz

# Check logs
kubectl logs -f deployment/auth-service -n cloudblitz
kubectl logs -f deployment/course-service -n cloudblitz
kubectl logs -f deployment/enrollment-service -n cloudblitz
```

## Jenkins Pipeline

Each service has its own Jenkinsfile for individual deployment, and there's a main Jenkinsfile in the `backend/` directory for deploying all services together.

### Individual Service Deployment
```bash
# Deploy auth service only
cd backend/auth-service
# Run Jenkins pipeline for auth-service
```

### Full Backend Deployment
```bash
# Deploy all services
cd backend/
# Run Jenkins pipeline for all services
```

## Monitoring and Health Checks

All services include:
- **Liveness Probes**: Check if the service is running
- **Readiness Probes**: Check if the service is ready to receive traffic
- **Resource Limits**: CPU and memory limits
- **Health Endpoints**: `/health` endpoints for monitoring

## Security

- **JWT Secret**: Shared across auth and enrollment services
- **CORS**: Configured for `https://cloudblitz.in`
- **SSL/TLS**: Automatic certificate management with Let's Encrypt
- **Network Policies**: Can be added for additional security

## Scaling

Each service is configured with:
- **Replicas**: 2 instances for high availability
- **Resource Requests**: 256Mi memory, 250m CPU
- **Resource Limits**: 512Mi memory, 500m CPU

To scale a service:
```bash
kubectl scale deployment auth-service --replicas=3 -n cloudblitz
```

## Troubleshooting

### Common Issues

1. **Pod Not Starting**: Check resource limits and MongoDB connectivity
2. **Health Check Failures**: Verify health endpoints are accessible
3. **Ingress Issues**: Check NGINX ingress controller and SSL certificates
4. **Database Connection**: Verify MongoDB SaaS connectivity

### Debug Commands

```bash
# Describe pod for events
kubectl describe pod <pod-name> -n cloudblitz

# Check service endpoints
kubectl get endpoints -n cloudblitz

# Port forward for local testing
kubectl port-forward service/auth-service 8081:8081 -n cloudblitz
```

## Production Considerations

1. **Secrets Management**: Use Kubernetes secrets for sensitive data
2. **Monitoring**: Implement Prometheus and Grafana
3. **Logging**: Centralized logging with ELK stack
4. **Backup**: Database backup strategies
5. **Disaster Recovery**: Multi-region deployment
6. **Security**: Network policies and RBAC

