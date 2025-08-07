# Horizontal Pod Autoscaler (HPA): Auto Scaling Guide

## Table of Contents
1. [HPA Overview](#hpa-overview)
2. [HPA Benefits](#hpa-benefits)
3. [HPA Components and Architecture](#hpa-components-and-architecture)
4. [Creating and Configuring HPA](#creating-and-configuring-hpa)
5. [HPA Metrics and Scaling](#hpa-metrics-and-scaling)
6. [Advanced HPA Features](#advanced-hpa-features)
7. [Best Practices and Monitoring](#best-practices-and-monitoring)
8. [Practical Examples](#practical-examples)

---

## 1. HPA Overview

### What is Horizontal Pod Autoscaler (HPA)?
Horizontal Pod Autoscaler (HPA) is a Kubernetes resource that automatically scales the number of pods in a deployment, replica set, or stateful set based on observed CPU utilization, memory usage, or custom metrics.

### HPA Characteristics
- **Automatic Scaling**: Scales pods up or down based on metrics
- **Resource-Based**: Primarily uses CPU and memory metrics
- **Custom Metrics**: Supports custom and external metrics
- **Namespace-Scoped**: Works within a specific namespace
- **Target-Based**: Scales based on target resource utilization

### When to Use HPA
- **Variable Workloads**: Applications with unpredictable traffic patterns
- **Cost Optimization**: Scale down during low usage periods
- **Performance**: Maintain application performance under load
- **Resource Efficiency**: Optimize resource utilization
- **High Availability**: Ensure sufficient capacity for traffic spikes

---

## 2. HPA Benefits

### 1. **Automatic Resource Management**
- **Dynamic Scaling**: Automatically adjusts pod count based on demand
- **Cost Optimization**: Scale down during low usage to save resources
- **Performance Maintenance**: Scale up to handle increased load
- **Resource Efficiency**: Optimize CPU and memory utilization

### 2. **Operational Benefits**
- **Reduced Manual Intervention**: No need to manually scale deployments
- **24/7 Availability**: Continuous monitoring and scaling
- **Predictable Performance**: Maintain consistent response times
- **Load Distribution**: Distribute load across multiple pods

### 3. **Business Benefits**
- **Cost Savings**: Pay only for resources you actually use
- **Improved User Experience**: Consistent performance under varying load
- **Scalability**: Handle traffic spikes without manual intervention
- **Reliability**: Automatic recovery from traffic surges

### 4. **Development Benefits**
- **Simplified Operations**: Less operational overhead
- **Testing**: Easy to test scaling behavior
- **Deployment Confidence**: Automatic scaling reduces deployment risks
- **Monitoring Integration**: Built-in metrics and monitoring

---

## 3. HPA Components and Architecture

### HPA Components

#### 1. **Metrics Server**
```bash
# Install metrics server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Verify installation
kubectl get pods -n kube-system -l k8s-app=metrics-server
```

#### 2. **HPA Controller**
- **Built-in Controller**: Part of Kubernetes control plane
- **Monitoring Loop**: Continuously monitors target metrics
- **Decision Engine**: Makes scaling decisions based on metrics
- **API Integration**: Communicates with Kubernetes API

#### 3. **Metrics Sources**
- **Resource Metrics**: CPU and memory from metrics server
- **Custom Metrics**: Application-specific metrics
- **External Metrics**: Metrics from external systems
- **Object Metrics**: Metrics from Kubernetes objects

### HPA Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Application   │    │   HPA Controller│    │  Metrics Server │
│   Pods         │◄──►│                 │◄──►│                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Deployment    │    │   Kubernetes    │    │   Custom/External│
│   ReplicaSet    │    │   API Server    │    │   Metrics       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 4. Creating and Configuring HPA

### Basic HPA Configuration

#### Method 1: kubectl Command
```bash
# Create HPA with CPU target
kubectl autoscale deployment myapp --cpu-percent=70 --min=2 --max=10

# Create HPA with memory target
kubectl autoscale deployment myapp --cpu-percent=70 --memory-percent=80 --min=2 --max=10
```

#### Method 2: YAML Definition
```yaml
# basic-hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa
  labels:
    app: myapp
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
```

### Advanced HPA Configuration

#### Custom Metrics HPA
```yaml
# custom-metrics-hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-custom-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Object
    object:
      metric:
        name: requests-per-second
      describedObject:
        apiVersion: networking.k8s.io/v1
        kind: Ingress
        name: myapp-ingress
      target:
        type: Value
        value: 1000
  - type: External
    external:
      metric:
        name: queue_messages_ready
        selector:
          matchLabels:
            queue: worker_tasks
      target:
        type: AverageValue
        averageValue: 30
```

#### Multiple Metrics HPA
```yaml
# multi-metrics-hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-multi-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 3
  maxReplicas: 15
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  - type: Pods
    pods:
      metric:
        name: packets-per-second
      target:
        type: AverageValue
        averageValue: 1k
```

---

## 5. HPA Metrics and Scaling

### Resource Metrics

#### CPU Metrics
```yaml
# CPU-based HPA
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: cpu-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

#### Memory Metrics
```yaml
# Memory-based HPA
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: memory-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Custom Metrics

#### Pod Metrics
```yaml
# Pod custom metrics
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: custom-pod-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Pods
    pods:
      metric:
        name: packets-per-second
      target:
        type: AverageValue
        averageValue: 1k
```

#### Object Metrics
```yaml
# Object custom metrics
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: object-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Object
    object:
      metric:
        name: requests-per-second
      describedObject:
        apiVersion: networking.k8s.io/v1
        kind: Ingress
        name: myapp-ingress
      target:
        type: Value
        value: 1000
```

### External Metrics
```yaml
# External metrics
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: external-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: External
    external:
      metric:
        name: queue_messages_ready
        selector:
          matchLabels:
            queue: worker_tasks
      target:
        type: AverageValue
        averageValue: 30
```

---

## 6. Advanced HPA Features

### Scaling Behavior Configuration

#### Scale Up Behavior
```yaml
# Aggressive scale up
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: aggressive-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 0  # No stabilization window
      policies:
      - type: Percent
        value: 100  # Scale up by 100%
        periodSeconds: 15  # Every 15 seconds
      - type: Pods
        value: 4  # Or scale up by 4 pods
        periodSeconds: 15
    scaleDown:
      stabilizationWindowSeconds: 300  # 5 minutes stabilization
      policies:
      - type: Percent
        value: 10  # Scale down by 10%
        periodSeconds: 60
```

#### Scale Down Behavior
```yaml
# Conservative scale down
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: conservative-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
    scaleDown:
      stabilizationWindowSeconds: 600  # 10 minutes stabilization
      policies:
      - type: Percent
        value: 5  # Scale down by 5%
        periodSeconds: 120  # Every 2 minutes
```

### Predictive Scaling
```yaml
# Predictive scaling with custom metrics
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: predictive-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: External
    external:
      metric:
        name: predicted_traffic
      target:
        type: AverageValue
        averageValue: 1000
```

---

## 7. Best Practices and Monitoring

### HPA Best Practices

#### 1. **Resource Configuration**
```yaml
# Proper resource requests and limits
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: app
        image: myapp:latest
        ports:
        - containerPort: 8080
        resources:
          requests:
            cpu: 250m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 512Mi
```

#### 2. **HPA Configuration**
```yaml
# Well-configured HPA
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
```

### Monitoring and Troubleshooting

#### HPA Status Monitoring
```bash
# Check HPA status
kubectl get hpa
kubectl describe hpa myapp-hpa

# Check HPA events
kubectl get events --field-selector involvedObject.name=myapp-hpa

# Check metrics server
kubectl top pods
kubectl top nodes
```

#### Metrics Server Troubleshooting
```bash
# Check metrics server status
kubectl get pods -n kube-system -l k8s-app=metrics-server
kubectl logs -n kube-system deployment/metrics-server

# Test metrics API
kubectl get --raw "/apis/metrics.k8s.io/v1beta1/pods" | jq .

# Check custom metrics
kubectl get --raw "/apis/custom.metrics.k8s.io/v1beta1/" | jq .
```

#### HPA Debugging Commands
```bash
# Check HPA configuration
kubectl get hpa myapp-hpa -o yaml

# Check target deployment
kubectl get deployment myapp -o yaml

# Check pod metrics
kubectl top pods -l app=myapp

# Check HPA events
kubectl get events --field-selector involvedObject.kind=HorizontalPodAutoscaler
```

---

## 8. Practical Examples

### Complete HPA Example

#### 1. Create Deployment
```yaml
# app-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hpa-demo
  labels:
    app: hpa-demo
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hpa-demo
  template:
    metadata:
      labels:
        app: hpa-demo
    spec:
      containers:
      - name: app
        image: nginx:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 200m
            memory: 256Mi
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
```

#### 2. Create Service
```yaml
# app-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: hpa-demo-service
spec:
  selector:
    app: hpa-demo
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: ClusterIP
```

#### 3. Create HPA
```yaml
# app-hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: hpa-demo-hpa
  labels:
    app: hpa-demo
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: hpa-demo
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
```

#### 4. Deploy and Test
```bash
# Apply all resources
kubectl apply -f app-deployment.yaml
kubectl apply -f app-service.yaml
kubectl apply -f app-hpa.yaml

# Verify deployment
kubectl get deployment hpa-demo
kubectl get pods -l app=hpa-demo
kubectl get hpa hpa-demo-hpa

# Check HPA status
kubectl describe hpa hpa-demo-hpa

# Generate load to test scaling
kubectl run load-generator --image=busybox --rm -it --restart=Never -- \
  /bin/sh -c "while true; do wget -q -O- http://hpa-demo-service; sleep 0.1; done"

# Monitor scaling
kubectl get pods -l app=hpa-demo -w
kubectl get hpa hpa-demo-hpa -w
```

### Load Testing Example

#### 1. Create Load Test Script
```bash
#!/bin/bash
# load-test.sh
SERVICE_URL="http://hpa-demo-service"
DURATION=300  # 5 minutes
CONCURRENT_USERS=50

echo "Starting load test for $DURATION seconds with $CONCURRENT_USERS concurrent users"

# Generate load using Apache Bench
ab -n 10000 -c $CONCURRENT_USERS -t $DURATION $SERVICE_URL/

echo "Load test completed"
```

#### 2. Monitor Scaling
```bash
# Watch HPA and pods
kubectl get hpa hpa-demo-hpa -w &
kubectl get pods -l app=hpa-demo -w &

# Run load test
./load-test.sh

# Check final status
kubectl get hpa hpa-demo-hpa
kubectl get pods -l app=hpa-demo
```

### Clean Up
```bash
# Delete all resources
kubectl delete deployment hpa-demo
kubectl delete service hpa-demo-service
kubectl delete hpa hpa-demo-hpa

# Verify cleanup
kubectl get deployment,service,hpa
```

---

## 9. Hands-On HPA Demo with Custom CPU Load App

### 🧪 Kubernetes Horizontal Pod Autoscaler (HPA) Demo with Custom CPU Load App

This demo showcases how Kubernetes Horizontal Pod Autoscaler (HPA) works using a **custom Python app** that can simulate CPU load via an HTTP request.

---

### 🎯 Objective

- Learn how HPA scales pods based on CPU usage.
- Use a **custom Docker image** with a Flask API to trigger CPU stress.
- Observe automatic scaling behavior using `kubectl get hpa`.

---

### 📦 Components

1. **Python Flask App**
    - `/`: Health check
    - `/load?duration=30`: Triggers CPU load for 30 seconds

2. **Dockerfile**: To build the custom image

3. **Kubernetes Deployment**: Runs the app

4. **Kubernetes Service**: Exposes the app

5. **HPA**: Auto-scales based on CPU usage

---

### 🛠 Prerequisites

- Kubernetes cluster (EKS, Minikube, etc.)
- `kubectl` configured
- Metrics Server installed:
    ```bash
    kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
    ```

---

### 🚀 Setup Instructions

#### 1. Create the Python Flask App

**📄 `app.py`**
```python
from flask import Flask, request
import threading
import time

app = Flask(__name__)

@app.route('/')
def hello():
    return "Hello from CPU Stress App!"

@app.route('/load')
def load():
    duration = int(request.args.get('duration', 10))
    thread = threading.Thread(target=burn_cpu, args=(duration,))
    thread.start()
    return f"CPU load started for {duration} seconds."

def burn_cpu(duration):
    end_time = time.time() + duration
    while time.time() < end_time:
        _ = 2**100000

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080)
```

#### 2. Create Dockerfile

**📄 `Dockerfile`**
```dockerfile
FROM python:3.9-slim

RUN pip install flask

COPY app.py /app.py

CMD ["python", "/app.py"]
```

#### 3. Build and Push Docker Image
```bash
# Build the image
docker build -t <your-dockerhub-username>/cpu-load-app:latest .

# Push to registry
docker push <your-dockerhub-username>/cpu-load-app:latest
```

**Replace `<your-dockerhub-username>` with your DockerHub or ECR username.**

#### 4. Deploy to Kubernetes

**📄 `deployment.yaml`**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cpu-custom-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: cpu-custom
  template:
    metadata:
      labels:
        app: cpu-custom
    spec:
      containers:
      - name: cpu-custom-container
        image: <your-dockerhub-username>/cpu-load-app:latest
        ports:
        - containerPort: 8080
        resources:
          requests:
            cpu: "200m"
          limits:
            cpu: "500m"
```

**Apply the deployment:**
```bash
kubectl apply -f deployment.yaml
```

#### 5. Expose the App with a Service

**📄 `service.yaml`**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: cpu-custom-app
spec:
  selector:
    app: cpu-custom
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
  type: ClusterIP
```

**Apply it:**
```bash
kubectl apply -f service.yaml
```

#### 6. Create HPA
```bash
# Create HPA with 50% CPU target
kubectl autoscale deployment cpu-custom-app \
  --cpu-percent=50 \
  --min=1 \
  --max=5
```

**Verify:**
```bash
kubectl get hpa
```

#### 7. Trigger CPU Load

**Port-forward the service:**
```bash
kubectl port-forward svc/cpu-custom-app 8080:80
```

**In another terminal, run:**
```bash
curl http://localhost:8080/load?duration=60
```

This simulates 60 seconds of CPU stress.

#### 8. Observe HPA in Action

**Watch HPA metrics:**
```bash
watch kubectl get hpa
```

**Also watch the pods:**
```bash
watch kubectl get pods -l app=cpu-custom
```

You will see the pod count scale up if CPU exceeds 50%.

---

### 🧹 Cleanup
```bash
# Delete all resources
kubectl delete deployment cpu-custom-app
kubectl delete service cpu-custom-app
kubectl delete hpa cpu-custom-app
```

---

## Summary

Horizontal Pod Autoscaler (HPA) is a powerful Kubernetes feature for automatic scaling:

### Key Benefits
- **Automatic Scaling**: Scales pods based on metrics
- **Cost Optimization**: Scale down during low usage
- **Performance**: Maintain application performance
- **Operational Efficiency**: Reduce manual intervention

### Configuration Options
- **Resource Metrics**: CPU and memory utilization
- **Custom Metrics**: Application-specific metrics
- **External Metrics**: External system metrics
- **Scaling Behavior**: Configurable scale up/down policies

### Best Practices
- **Resource Requests**: Always set resource requests
- **Monitoring**: Monitor HPA status and metrics
- **Testing**: Test scaling behavior with load tests
- **Documentation**: Document HPA configurations

This comprehensive guide provides everything needed to implement and manage HPA in Kubernetes environments. 