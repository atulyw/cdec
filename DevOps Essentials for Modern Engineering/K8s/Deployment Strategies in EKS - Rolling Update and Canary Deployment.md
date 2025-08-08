# Deployment Strategies in EKS Kubernetes: Rolling Update and Canary Deployment

## Table of Contents
1. [Introduction to Deployment Strategies](#introduction-to-deployment-strategies)
2. [Rolling Update Deployment](#rolling-update-deployment)
3. [Canary Deployment](#canary-deployment)
4. [Comparison and Best Practices](#comparison-and-best-practices)
5. [Advanced Examples](#advanced-examples)
6. [Troubleshooting and Monitoring](#troubleshooting-and-monitoring)

---

## Introduction to Deployment Strategies

Deployment strategies in Kubernetes determine how new versions of applications are rolled out to production. The choice of strategy impacts:
- **Zero-downtime deployments**
- **Risk mitigation**
- **Rollback capabilities**
- **Resource utilization**
- **User experience**

### Key Deployment Strategy Types:
1. **Rolling Update** - Gradual replacement of old pods with new ones
2. **Canary Deployment** - Testing new version with a small subset of users
3. **Blue-Green Deployment** - Complete switch between two environments
4. **Recreate** - Delete all old pods before creating new ones

---

## Rolling Update Deployment

### What is Rolling Update?
Rolling Update is the default deployment strategy in Kubernetes that gradually replaces old pods with new ones, ensuring zero downtime during deployments.

### How Rolling Update Works:
1. **Gradual Replacement**: Old pods are terminated one by one while new pods are created
2. **Load Balancing**: Traffic is automatically distributed between old and new pods
3. **Health Checks**: New pods must pass readiness/liveness probes before old pods are terminated
4. **Rollback Capability**: Can quickly revert to previous version if issues arise

### Rolling Update Configuration

#### Basic Rolling Update Example:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp-deployment
  labels:
    app: webapp
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # Maximum number of pods that can be created above desired replicas
      maxUnavailable: 1  # Maximum number of pods that can be unavailable during update
  selector:
    matchLabels:
      app: webapp
  template:
    metadata:
      labels:
        app: webapp
    spec:
      containers:
      - name: webapp
        image: nginx:1.21
        ports:
        - containerPort: 80
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 15
          periodSeconds: 20
```

#### Rolling Update Parameters Explained:

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1        # Can create 1 extra pod during update (6 total instead of 5)
    maxUnavailable: 1  # Can have 1 pod unavailable during update (4 available instead of 5)
```

### Rolling Update Scenarios:

#### Scenario 1: Conservative Update (Slow and Safe)
```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 0        # No extra pods created
    maxUnavailable: 1  # Only 1 pod unavailable at a time
```

#### Scenario 2: Fast Update (Quick Deployment)
```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 2        # Can create 2 extra pods
    maxUnavailable: 0  # No pods unavailable (always have full capacity)
```

#### Scenario 3: Balanced Update (Recommended)
```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1        # 1 extra pod allowed
    maxUnavailable: 1  # 1 pod can be unavailable
```

### Practical Rolling Update Example:

#### Step 1: Create Initial Deployment
```bash
# Create the deployment
kubectl apply -f rolling-update-deployment.yaml

# Check deployment status
kubectl get deployments
kubectl get pods -l app=webapp
```

#### Step 2: Update the Deployment
```bash
# Method 1: Update image directly
kubectl set image deployment/webapp-deployment webapp=nginx:1.22

# Method 2: Edit deployment
kubectl edit deployment webapp-deployment

# Method 3: Apply updated YAML
kubectl apply -f updated-deployment.yaml
```

#### Step 3: Monitor the Rolling Update
```bash
# Watch the rolling update in real-time
kubectl rollout status deployment/webapp-deployment

# Check pod status during update
kubectl get pods -l app=webapp -w

# View deployment history
kubectl rollout history deployment/webapp-deployment
```

#### Step 4: Rollback if Needed
```bash
# Rollback to previous version
kubectl rollout undo deployment/webapp-deployment

# Rollback to specific revision
kubectl rollout undo deployment/webapp-deployment --to-revision=2

# Check rollback status
kubectl rollout status deployment/webapp-deployment
```

### Rolling Update Best Practices:

1. **Set Appropriate maxSurge and maxUnavailable**:
   ```yaml
   # For critical applications
   maxSurge: 0
   maxUnavailable: 1
   
   # For non-critical applications
   maxSurge: 1
   maxUnavailable: 1
   ```

2. **Configure Health Checks**:
   ```yaml
   readinessProbe:
     httpGet:
       path: /health
       port: 8080
     initialDelaySeconds: 5
     periodSeconds: 10
     timeoutSeconds: 3
     failureThreshold: 3
   ```

3. **Use Resource Limits**:
   ```yaml
   resources:
     requests:
       memory: "64Mi"
       cpu: "250m"
     limits:
       memory: "128Mi"
       cpu: "500m"
   ```

---

## Canary Deployment

### What is Canary Deployment?
Canary deployment is a strategy where a new version is deployed to a small subset of users (canary) while the majority continues using the stable version. This allows for:
- **Risk mitigation** through gradual exposure
- **Real-time monitoring** of new version performance
- **Quick rollback** if issues are detected
- **A/B testing** capabilities

### Canary Deployment Implementation Methods:

#### Method 1: Using Multiple Deployments

```yaml
# Stable Deployment (90% traffic)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp-stable
  labels:
    app: webapp
    version: stable
spec:
  replicas: 9
  selector:
    matchLabels:
      app: webapp
      version: stable
  template:
    metadata:
      labels:
        app: webapp
        version: stable
    spec:
      containers:
      - name: webapp
        image: nginx:1.21
        ports:
        - containerPort: 80
---
# Canary Deployment (10% traffic)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp-canary
  labels:
    app: webapp
    version: canary
spec:
  replicas: 1
  selector:
    matchLabels:
      app: webapp
      version: canary
  template:
    metadata:
      labels:
        app: webapp
        version: canary
    spec:
      containers:
      - name: webapp
        image: nginx:1.22
        ports:
        - containerPort: 80
---
# Service to route traffic
apiVersion: v1
kind: Service
metadata:
  name: webapp-service
spec:
  selector:
    app: webapp
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP
```

#### Method 2: Using Service Mesh (Istio)

```yaml
# Virtual Service for traffic splitting
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: webapp-vs
spec:
  hosts:
  - webapp.example.com
  http:
  - route:
    - destination:
        host: webapp-stable
        subset: v1
      weight: 90
    - destination:
        host: webapp-canary
        subset: v2
      weight: 10
---
# Destination Rules
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: webapp-dr
spec:
  host: webapp
  subsets:
  - name: v1
    labels:
      version: stable
  - name: v2
    labels:
      version: canary
```

#### Method 3: Using Nginx Ingress Controller

```yaml
# Ingress with traffic splitting
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: webapp-ingress
  annotations:
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-weight: "10"
spec:
  rules:
  - host: webapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: webapp-service
            port:
              number: 80
---
# Main Ingress (90% traffic)
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: webapp-ingress-main
spec:
  rules:
  - host: webapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: webapp-service
            port:
              number: 80
```

### Advanced Canary Deployment Example:

#### Step 1: Create Base Application
```yaml
# webapp-base.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp-base
  labels:
    app: webapp
    version: base
spec:
  replicas: 10
  selector:
    matchLabels:
      app: webapp
      version: base
  template:
    metadata:
      labels:
        app: webapp
        version: base
    spec:
      containers:
      - name: webapp
        image: myapp:v1.0
        ports:
        - containerPort: 8080
        env:
        - name: VERSION
          value: "v1.0"
        - name: ENVIRONMENT
          value: "production"
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 15
          periodSeconds: 20
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: webapp-service
spec:
  selector:
    app: webapp
  ports:
  - port: 80
    targetPort: 8080
  type: ClusterIP
```

#### Step 2: Deploy Canary Version
```yaml
# webapp-canary.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp-canary
  labels:
    app: webapp
    version: canary
spec:
  replicas: 1
  selector:
    matchLabels:
      app: webapp
      version: canary
  template:
    metadata:
      labels:
        app: webapp
        version: canary
    spec:
      containers:
      - name: webapp
        image: myapp:v1.1
        ports:
        - containerPort: 8080
        env:
        - name: VERSION
          value: "v1.1-canary"
        - name: ENVIRONMENT
          value: "canary"
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 15
          periodSeconds: 20
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
```

#### Step 3: Implement Traffic Splitting
```yaml
# traffic-splitting.yaml
apiVersion: v1
kind: Service
metadata:
  name: webapp-service-stable
spec:
  selector:
    app: webapp
    version: base
  ports:
  - port: 80
    targetPort: 8080
  type: ClusterIP
---
apiVersion: v1
kind: Service
metadata:
  name: webapp-service-canary
spec:
  selector:
    app: webapp
    version: canary
  ports:
  - port: 80
    targetPort: 8080
  type: ClusterIP
---
# Ingress with traffic splitting
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: webapp-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: webapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: webapp-service-stable
            port:
              number: 80
```

### Canary Deployment Monitoring:

#### 1. Prometheus Metrics
```yaml
# prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
    - job_name: 'webapp'
      static_configs:
      - targets: ['webapp-service:80']
      metrics_path: /metrics
```

#### 2. Grafana Dashboard
```json
{
  "dashboard": {
    "title": "Canary Deployment Metrics",
    "panels": [
      {
        "title": "Request Rate by Version",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{version=\"base\"}[5m])",
            "legendFormat": "Stable Version"
          },
          {
            "expr": "rate(http_requests_total{version=\"canary\"}[5m])",
            "legendFormat": "Canary Version"
          }
        ]
      },
      {
        "title": "Error Rate by Version",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{version=\"base\", status=~\"5..\"}[5m])",
            "legendFormat": "Stable Errors"
          },
          {
            "expr": "rate(http_requests_total{version=\"canary\", status=~\"5..\"}[5m])",
            "legendFormat": "Canary Errors"
          }
        ]
      }
    ]
  }
}
```

### Canary Deployment Automation:

#### 1. Automated Canary Analysis
```yaml
# canary-analysis.yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: webapp-rollout
spec:
  replicas: 10
  strategy:
    canary:
      steps:
      - setWeight: 10
      - pause: {duration: 5m}
      - setWeight: 20
      - pause: {duration: 5m}
      - setWeight: 50
      - pause: {duration: 5m}
      - setWeight: 100
  selector:
    matchLabels:
      app: webapp
  template:
    metadata:
      labels:
        app: webapp
    spec:
      containers:
      - name: webapp
        image: myapp:v1.1
        ports:
        - containerPort: 8080
```

#### 2. Canary Deployment Script
```bash
#!/bin/bash
# canary-deploy.sh

# Configuration
CANARY_REPLICAS=1
STABLE_REPLICAS=9
CANARY_IMAGE="myapp:v1.1"
STABLE_IMAGE="myapp:v1.0"
NAMESPACE="default"

echo "Starting Canary Deployment..."

# Deploy canary version
kubectl apply -f webapp-canary.yaml

# Wait for canary to be ready
echo "Waiting for canary deployment to be ready..."
kubectl rollout status deployment/webapp-canary -n $NAMESPACE

# Monitor canary for 5 minutes
echo "Monitoring canary deployment for 5 minutes..."
sleep 300

# Check canary health
CANARY_HEALTH=$(kubectl get pods -l app=webapp,version=canary -n $NAMESPACE --no-headers | grep Running | wc -l)

if [ $CANARY_HEALTH -eq $CANARY_REPLICAS ]; then
    echo "Canary is healthy. Proceeding with full deployment..."
    
    # Scale up canary
    kubectl scale deployment webapp-canary --replicas=10 -n $NAMESPACE
    
    # Scale down stable
    kubectl scale deployment webapp-base --replicas=0 -n $NAMESPACE
    
    echo "Canary deployment completed successfully!"
else
    echo "Canary health check failed. Rolling back..."
    kubectl delete deployment webapp-canary -n $NAMESPACE
    echo "Rollback completed."
fi
```

---

## Comparison and Best Practices

### Rolling Update vs Canary Deployment:

| Aspect | Rolling Update | Canary Deployment |
|--------|----------------|-------------------|
| **Risk Level** | Medium | Low |
| **Deployment Speed** | Fast | Slow |
| **Resource Usage** | Efficient | Higher (duplicate resources) |
| **Monitoring Complexity** | Simple | Complex |
| **Rollback Speed** | Fast | Fast |
| **Traffic Control** | Limited | Fine-grained |

### When to Use Each Strategy:

#### Rolling Update Best For:
- **Stable applications** with good test coverage
- **Quick deployments** with minimal risk
- **Resource-constrained environments**
- **Simple applications** without complex dependencies

#### Canary Deployment Best For:
- **Critical applications** requiring high availability
- **Applications with complex dependencies**
- **A/B testing scenarios**
- **Applications with high user impact**

### Best Practices:

#### 1. Health Checks
```yaml
readinessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 10
  timeoutSeconds: 3
  failureThreshold: 3
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 15
  periodSeconds: 20
  timeoutSeconds: 3
  failureThreshold: 3
```

#### 2. Resource Management
```yaml
resources:
  requests:
    memory: "128Mi"
    cpu: "100m"
  limits:
    memory: "256Mi"
    cpu: "200m"
```

#### 3. Monitoring and Alerting
```yaml
# prometheus-rules.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: deployment-alerts
spec:
  groups:
  - name: deployment.rules
    rules:
    - alert: HighErrorRate
      expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
      for: 2m
      labels:
        severity: warning
      annotations:
        summary: "High error rate detected"
```

---

## Advanced Examples

### 1. Blue-Green Deployment with Rolling Update

```yaml
# blue-green-rolling.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp-blue
  labels:
    app: webapp
    color: blue
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
  selector:
    matchLabels:
      app: webapp
      color: blue
  template:
    metadata:
      labels:
        app: webapp
        color: blue
    spec:
      containers:
      - name: webapp
        image: myapp:v1.0
        ports:
        - containerPort: 8080
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp-green
  labels:
    app: webapp
    color: green
spec:
  replicas: 0  # Initially scaled to 0
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
  selector:
    matchLabels:
      app: webapp
      color: green
  template:
    metadata:
      labels:
        app: webapp
        color: green
    spec:
      containers:
      - name: webapp
        image: myapp:v1.1
        ports:
        - containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: webapp-service
spec:
  selector:
    app: webapp
    color: blue  # Initially routes to blue
  ports:
  - port: 80
    targetPort: 8080
  type: ClusterIP
```

### 2. Progressive Canary with Istio

```yaml
# progressive-canary.yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: webapp-vs
spec:
  hosts:
  - webapp.example.com
  http:
  - route:
    - destination:
        host: webapp-stable
        subset: v1
      weight: 90
    - destination:
        host: webapp-canary
        subset: v2
      weight: 10
---
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: webapp-dr
spec:
  host: webapp
  subsets:
  - name: v1
    labels:
      version: stable
  - name: v2
    labels:
      version: canary
---
# Progressive traffic shifting
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: webapp-progressive
spec:
  replicas: 10
  strategy:
    canary:
      steps:
      - setWeight: 5
      - pause: {duration: 2m}
      - setWeight: 10
      - pause: {duration: 2m}
      - setWeight: 20
      - pause: {duration: 2m}
      - setWeight: 50
      - pause: {duration: 2m}
      - setWeight: 100
  selector:
    matchLabels:
      app: webapp
  template:
    metadata:
      labels:
        app: webapp
    spec:
      containers:
      - name: webapp
        image: myapp:v1.1
        ports:
        - containerPort: 8080
```

---

## Troubleshooting and Monitoring

### Common Issues and Solutions:

#### 1. Rolling Update Stuck
```bash
# Check deployment status
kubectl describe deployment webapp-deployment

# Check pod events
kubectl get events --sort-by=.metadata.creationTimestamp

# Check pod logs
kubectl logs -l app=webapp

# Force rollback
kubectl rollout undo deployment/webapp-deployment
```

#### 2. Canary Health Issues
```bash
# Check canary pod status
kubectl get pods -l app=webapp,version=canary

# Check canary logs
kubectl logs -l app=webapp,version=canary

# Check service endpoints
kubectl get endpoints webapp-service

# Test canary endpoint directly
kubectl port-forward svc/webapp-service-canary 8080:80
```

#### 3. Traffic Routing Issues
```bash
# Check ingress status
kubectl describe ingress webapp-ingress

# Check service selectors
kubectl get svc -o wide

# Test traffic splitting
curl -H "Host: webapp.example.com" http://localhost/version
```

### Monitoring Commands:

```bash
# Monitor deployment rollout
kubectl rollout status deployment/webapp-deployment

# Watch pod changes
kubectl get pods -l app=webapp -w

# Check deployment history
kubectl rollout history deployment/webapp-deployment

# Monitor resource usage
kubectl top pods -l app=webapp

# Check service endpoints
kubectl get endpoints webapp-service
```

### Performance Metrics:

```yaml
# metrics-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: metrics-config
data:
  metrics.yaml: |
    metrics:
    - name: deployment_duration
      help: "Time taken for deployment to complete"
      type: histogram
    - name: canary_success_rate
      help: "Success rate of canary deployments"
      type: gauge
    - name: rollback_frequency
      help: "Frequency of deployment rollbacks"
      type: counter
```

---

## Summary

Deployment strategies in EKS Kubernetes provide different approaches to managing application updates:

### Rolling Update:
- **Best for**: Quick, safe deployments with minimal risk
- **Key benefits**: Zero downtime, efficient resource usage
- **Configuration**: `maxSurge` and `maxUnavailable` parameters
- **Use cases**: Stable applications, frequent updates

### Canary Deployment:
- **Best for**: High-risk deployments requiring careful monitoring
- **Key benefits**: Risk mitigation, real-time monitoring, A/B testing
- **Configuration**: Traffic splitting, multiple deployments
- **Use cases**: Critical applications, complex dependencies

### Key Takeaways:
1. **Choose strategy based on application criticality and risk tolerance**
2. **Implement proper health checks and monitoring**
3. **Use resource limits and requests**
4. **Plan for rollback scenarios**
5. **Monitor deployment metrics and performance**

Both strategies can be combined and customized based on specific requirements, providing flexibility for different deployment scenarios in EKS environments. 