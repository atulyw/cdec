# Basic Kubernetes Commands and Concepts

## Table of Contents
1. [Introduction to Kubernetes Objects](#introduction-to-kubernetes-objects)
2. [Pods - The Basic Unit](#pods---the-basic-unit)
3. [Namespaces - Resource Isolation](#namespaces---resource-isolation)
4. [Replicas - Scaling Applications](#replicas---scaling-applications)
5. [Deployments - Managing Application Lifecycle](#deployments---managing-application-lifecycle)
6. [Services - Network Access](#services---network-access)
7. [ConfigMaps and Secrets](#configmaps-and-secrets)
8. [Volumes and Storage](#volumes-and-storage)
9. [Health Checks](#health-checks)
10. [Best Practices](#best-practices)

---

## Introduction to Kubernetes Objects

### What are Kubernetes Objects?
- **Kubernetes Objects** are persistent entities that represent the state of your cluster
- They describe what containerized applications are running, what resources are available, and policies around how those applications behave
- Each object has a **spec** (desired state) and **status** (current state)

### Basic Object Types (in order of complexity)
1. **Pods** - Smallest deployable units
2. **Namespaces** - Virtual clusters within a physical cluster
3. **Replicas** - Multiple instances of the same pod
4. **Deployments** - Declarative updates for pods and ReplicaSets
5. **Services** - Network access to pods
6. **ConfigMaps/Secrets** - Configuration and sensitive data
7. **Volumes** - Persistent storage

---

## Pods - The Basic Unit

### What is a Pod?
- **Pod** is the smallest deployable unit in Kubernetes
- Contains one or more containers that share the same network namespace
- Pods are ephemeral - they can be created, destroyed, and recreated

### Creating Pods

#### 1. Imperative Commands (Quick Start)
```bash
# Create a simple pod
kubectl run nginx-pod --image=nginx:latest

# Create pod with specific port
kubectl run nginx-pod --image=nginx:latest --port=80

# Create pod with environment variables
kubectl run nginx-pod --image=nginx:latest --env="ENV=production"

# Create pod with resource limits
kubectl run nginx-pod --image=nginx:latest --requests="cpu=100m,memory=128Mi" --limits="cpu=200m,memory=256Mi"
```

#### 2. Declarative Approach (YAML)
```yaml
# simple-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: nginx
    tier: frontend
spec:
  containers:
  - name: nginx
    image: nginx:latest
    ports:
    - containerPort: 80
    resources:
      requests:
        memory: "64Mi"
        cpu: "250m"
      limits:
        memory: "128Mi"
        cpu: "500m"
```

```bash
# Apply the YAML file
kubectl apply -f simple-pod.yaml

# Create pod directly from YAML
kubectl create -f simple-pod.yaml
```

### Managing Pods

#### Basic Pod Commands
```bash
# List all pods
kubectl get pods

# List pods with more details
kubectl get pods -o wide

# List pods in specific namespace
kubectl get pods -n default

# Get detailed information about a pod
kubectl describe pod nginx-pod

# Get pod logs
kubectl logs nginx-pod

# Follow logs in real-time
kubectl logs -f nginx-pod

# Execute command in pod
kubectl exec -it nginx-pod -- /bin/bash

# Copy files to/from pod
kubectl cp nginx-pod:/etc/nginx/nginx.conf ./nginx.conf
```

#### Pod Lifecycle Commands
```bash
# Delete a pod
kubectl delete pod nginx-pod

# Force delete a pod
kubectl delete pod nginx-pod --force --grace-period=0

# Edit pod configuration
kubectl edit pod nginx-pod

# Get pod YAML
kubectl get pod nginx-pod -o yaml
```

### Multi-Container Pods
```yaml
# multi-container-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: multi-container-pod
spec:
  containers:
  - name: nginx
    image: nginx:latest
    ports:
    - containerPort: 80
  - name: sidecar
    image: busybox:latest
    command: ['sh', '-c', 'while true; do echo "Sidecar running"; sleep 30; done']
```

```bash
# Apply multi-container pod
kubectl apply -f multi-container-pod.yaml

# Access specific container
kubectl exec -it multi-container-pod -c sidecar -- /bin/sh
```

---

## Namespaces - Resource Isolation

### What are Namespaces?
- **Namespaces** provide a mechanism for isolating groups of resources within a single cluster
- They are like virtual clusters inside a physical cluster
- Default namespaces: `default`, `kube-system`, `kube-public`, `kube-node-lease`

### Working with Namespaces

#### Creating Namespaces
```bash
# Create namespace imperatively
kubectl create namespace my-app

# Create namespace with YAML
kubectl apply -f - <<EOF
apiVersion: v1
kind: Namespace
metadata:
  name: my-app
  labels:
    name: my-app
EOF
```

#### Managing Resources in Namespaces
```bash
# Create pod in specific namespace
kubectl run nginx-pod --image=nginx:latest -n my-app

# List pods in namespace
kubectl get pods -n my-app

# List all resources in namespace
kubectl get all -n my-app

# Set default namespace for current context
kubectl config set-context --current --namespace=my-app

# Get current namespace
kubectl config view --minify --output 'jsonpath={..namespace}'
```

#### Namespace Management
```bash
# List all namespaces
kubectl get namespaces

# Get namespace details
kubectl describe namespace my-app

# Delete namespace (deletes all resources in it)
kubectl delete namespace my-app

# Create resource quota for namespace
kubectl apply -f - <<EOF
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: my-app
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "8"
    limits.memory: 16Gi
EOF
```

---

## Replicas - Scaling Applications

### What are Replicas?
- **Replicas** are multiple instances of the same pod
- Provide high availability and load distribution
- Managed through ReplicaSets (automatically created by Deployments)

### Creating Replicas with ReplicaSet

#### ReplicaSet YAML
```yaml
# replicaset.yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: nginx-replicaset
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:latest
        ports:
        - containerPort: 80
```

#### ReplicaSet Commands
```bash
# Apply ReplicaSet
kubectl apply -f replicaset.yaml

# List ReplicaSets
kubectl get replicasets

# Get ReplicaSet details
kubectl describe replicaset nginx-replicaset

# Scale ReplicaSet
kubectl scale replicaset nginx-replicaset --replicas=5

# Delete ReplicaSet
kubectl delete replicaset nginx-replicaset
```

### Imperative Replica Creation
```bash
# Create multiple replicas using kubectl run
kubectl run nginx --image=nginx:latest --replicas=3

# Scale existing deployment
kubectl scale deployment nginx --replicas=5
```

---

## Deployments - Managing Application Lifecycle

### What are Deployments?
- **Deployments** provide declarative updates for Pods and ReplicaSets
- Manage the desired state for your application
- Support rolling updates and rollbacks
- Most commonly used for stateless applications

### Creating Deployments

#### Basic Deployment YAML
```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.21
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "250m"
          limits:
            memory: "128Mi"
            cpu: "500m"
```

#### Deployment Commands
```bash
# Apply deployment
kubectl apply -f deployment.yaml

# List deployments
kubectl get deployments

# Get deployment details
kubectl describe deployment nginx-deployment

# Get deployment status
kubectl rollout status deployment nginx-deployment

# Scale deployment
kubectl scale deployment nginx-deployment --replicas=5

# Update deployment image
kubectl set image deployment nginx-deployment nginx=nginx:1.22

# Rollback deployment
kubectl rollout undo deployment nginx-deployment

# Rollback to specific revision
kubectl rollout undo deployment nginx-deployment --to-revision=2

# View rollout history
kubectl rollout history deployment nginx-deployment
```

### Advanced Deployment Strategies

#### Rolling Update Strategy
```yaml
# rolling-update-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.21
        ports:
        - containerPort: 80
```

#### Blue-Green Deployment
```bash
# Create blue deployment
kubectl apply -f blue-deployment.yaml

# Create green deployment
kubectl apply -f green-deployment.yaml

# Switch traffic by updating service selector
kubectl patch service nginx-service -p '{"spec":{"selector":{"version":"green"}}}'
```

### Deployment Management
```bash
# Pause deployment
kubectl rollout pause deployment nginx-deployment

# Resume deployment
kubectl rollout resume deployment nginx-deployment

# Restart deployment (recreates all pods)
kubectl rollout restart deployment nginx-deployment

# Delete deployment
kubectl delete deployment nginx-deployment
```

---

## Services - Network Access

### What are Services?
- **Services** provide stable network endpoints for pods
- Enable load balancing across multiple pods
- Handle service discovery within the cluster

### Service Types

#### 1. ClusterIP (Default)
```yaml
# clusterip-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  type: ClusterIP
  selector:
    app: nginx
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
```

#### 2. NodePort
```yaml
# nodeport-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-nodeport
spec:
  type: NodePort
  selector:
    app: nginx
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
    nodePort: 30080
```

#### 3. LoadBalancer
```yaml
# loadbalancer-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-loadbalancer
spec:
  type: LoadBalancer
  selector:
    app: nginx
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
```

### Service Commands
```bash
# Apply service
kubectl apply -f service.yaml

# List services
kubectl get services

# Get service details
kubectl describe service nginx-service

# Get service endpoints
kubectl get endpoints nginx-service

# Port forward to service
kubectl port-forward service/nginx-service 8080:80

# Delete service
kubectl delete service nginx-service
```

---

## ConfigMaps and Secrets

### ConfigMaps - Configuration Data

#### Creating ConfigMaps
```bash
# Create ConfigMap from literal values
kubectl create configmap app-config --from-literal=DB_HOST=localhost --from-literal=DB_PORT=5432

# Create ConfigMap from file
kubectl create configmap app-config --from-file=config.properties

# Create ConfigMap from directory
kubectl create configmap app-config --from-file=./config/
```

#### ConfigMap YAML
```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  DB_HOST: "localhost"
  DB_PORT: "5432"
  config.properties: |
    server.port=8080
    logging.level=INFO
```

#### Using ConfigMaps in Pods
```yaml
# pod-with-configmap.yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-pod
spec:
  containers:
  - name: app
    image: myapp:latest
    envFrom:
    - configMapRef:
        name: app-config
    volumeMounts:
    - name: config-volume
      mountPath: /etc/config
  volumes:
  - name: config-volume
    configMap:
      name: app-config
```

### Secrets - Sensitive Data

#### Creating Secrets
```bash
# Create secret from literal values
kubectl create secret generic db-secret --from-literal=username=admin --from-literal=password=secret123

# Create secret from file
kubectl create secret generic tls-secret --from-file=tls.crt --from-file=tls.key

# Create docker registry secret
kubectl create secret docker-registry regcred --docker-server=<your-registry-server> --docker-username=<your-username> --docker-password=<your-password>
```

#### Secret YAML
```yaml
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
data:
  username: YWRtaW4=  # base64 encoded
  password: c2VjcmV0MTIz
```

#### Using Secrets in Pods
```yaml
# pod-with-secret.yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-pod
spec:
  containers:
  - name: app
    image: myapp:latest
    env:
    - name: DB_USERNAME
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: username
    - name: DB_PASSWORD
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: password
```

---

## Volumes and Storage

### Volume Types

#### 1. emptyDir (Temporary)
```yaml
# pod-with-emptydir.yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-with-emptydir
spec:
  containers:
  - name: app
    image: nginx:latest
    volumeMounts:
    - name: temp-storage
      mountPath: /tmp
  volumes:
  - name: temp-storage
    emptyDir: {}
```

#### 2. PersistentVolumeClaim
```yaml
# pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```

```yaml
# pod-with-pvc.yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-with-pvc
spec:
  containers:
  - name: app
    image: nginx:latest
    volumeMounts:
    - name: persistent-storage
      mountPath: /data
  volumes:
  - name: persistent-storage
    persistentVolumeClaim:
      claimName: app-pvc
```

### Storage Commands
```bash
# Apply PVC
kubectl apply -f pvc.yaml

# List PVCs
kubectl get pvc

# List PVs
kubectl get pv

# Get storage classes
kubectl get storageclass

# Delete PVC
kubectl delete pvc app-pvc
```

---

## Health Checks

### Liveness Probes
```yaml
# pod-with-liveness.yaml
apiVersion: v1
kind: Pod
metadata:
  name: liveness-pod
spec:
  containers:
  - name: app
    image: nginx:latest
    livenessProbe:
      httpGet:
        path: /health
        port: 80
      initialDelaySeconds: 30
      periodSeconds: 10
      timeoutSeconds: 5
      failureThreshold: 3
```

### Readiness Probes
```yaml
# pod-with-readiness.yaml
apiVersion: v1
kind: Pod
metadata:
  name: readiness-pod
spec:
  containers:
  - name: app
    image: nginx:latest
    readinessProbe:
      httpGet:
        path: /ready
        port: 80
      initialDelaySeconds: 5
      periodSeconds: 5
      timeoutSeconds: 3
      failureThreshold: 3
```

### Startup Probes
```yaml
# pod-with-startup.yaml
apiVersion: v1
kind: Pod
metadata:
  name: startup-pod
spec:
  containers:
  - name: app
    image: nginx:latest
    startupProbe:
      httpGet:
        path: /startup
        port: 80
      failureThreshold: 30
      periodSeconds: 10
```

---

## Best Practices

### 1. Resource Management
```yaml
# Always specify resource requests and limits
spec:
  containers:
  - name: app
    image: nginx:latest
    resources:
      requests:
        memory: "64Mi"
        cpu: "250m"
      limits:
        memory: "128Mi"
        cpu: "500m"
```

### 2. Labels and Selectors
```yaml
# Use meaningful labels
metadata:
  labels:
    app: myapp
    version: v1.0
    environment: production
    tier: frontend
```

### 3. Security
```yaml
# Run containers as non-root
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
  containers:
  - name: app
    image: nginx:latest
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
```

### 4. Networking
```yaml
# Use specific ports and protocols
spec:
  containers:
  - name: app
    image: nginx:latest
    ports:
    - name: http
      containerPort: 80
      protocol: TCP
```

### 5. Storage
```yaml
# Use appropriate access modes
spec:
  accessModes:
    - ReadWriteOnce  # Single node
    - ReadWriteMany  # Multiple nodes
    - ReadOnlyMany   # Read-only multiple nodes
```

### Common Commands Summary

#### Basic Operations
```bash
# Get resources
kubectl get pods,services,deployments

# Describe resources
kubectl describe pod <pod-name>

# Logs
kubectl logs <pod-name>

# Execute commands
kubectl exec -it <pod-name> -- /bin/bash

# Port forwarding
kubectl port-forward <resource> <local-port>:<remote-port>
```

#### Apply and Delete
```bash
# Apply resources
kubectl apply -f <file.yaml>

# Delete resources
kubectl delete -f <file.yaml>
kubectl delete pod <pod-name>

# Delete all resources in namespace
kubectl delete all --all -n <namespace>
```

#### Scaling and Updates
```bash
# Scale deployments
kubectl scale deployment <name> --replicas=5

# Update images
kubectl set image deployment <name> <container>=<image>

# Rollout management
kubectl rollout status deployment <name>
kubectl rollout undo deployment <name>
```

#### Context and Namespace
```bash
# Switch context
kubectl config use-context <context-name>

# Set namespace
kubectl config set-context --current --namespace=<namespace>

# List contexts
kubectl config get-contexts
```

---

## Conclusion

This guide covers the fundamental Kubernetes concepts and commands in a logical progression:

1. **Pods** - Start with the basic unit
2. **Namespaces** - Organize and isolate resources
3. **Replicas** - Scale applications horizontally
4. **Deployments** - Manage application lifecycle
5. **Services** - Provide network access
6. **ConfigMaps/Secrets** - Manage configuration
7. **Volumes** - Handle persistent storage
8. **Health Checks** - Ensure application reliability

### Key Takeaways
- Always use declarative YAML for production
- Implement proper resource limits and requests
- Use labels and selectors consistently
- Follow security best practices
- Monitor application health with probes
- Use appropriate storage classes for persistence

### Next Steps
- Learn about StatefulSets for stateful applications
- Explore Ingress controllers for external access
- Implement monitoring and logging solutions
- Set up CI/CD pipelines for Kubernetes deployments 