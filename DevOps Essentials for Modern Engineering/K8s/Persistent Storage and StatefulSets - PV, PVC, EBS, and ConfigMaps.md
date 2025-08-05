# Persistent Storage and StatefulSets: PV, PVC, EBS, and ConfigMaps

## Table of Contents
1. [Persistent Storage Overview](#persistent-storage-overview)
2. [PersistentVolumes (PV) and PersistentVolumeClaims (PVC)](#persistentvolumes-pv-and-persistentvolumeclaims-pvc)
3. [Dynamic Volume Provisioning with EBS](#dynamic-volume-provisioning-with-ebs)
4. [StatefulSets](#statefulsets)
5. [ConfigMaps](#configmaps)
6. [Best Practices and Troubleshooting](#best-practices-and-troubleshooting)

---

## 1. Persistent Storage Overview

### What is Persistent Storage?
Persistent storage in Kubernetes allows data to survive beyond the lifetime of a pod. Unlike ephemeral storage, which is tied to the pod lifecycle, persistent storage provides data durability and can be shared across pod restarts, reschedules, and even across different pods.

### Why Persistent Storage is Essential
- **Data Durability**: Ensures data survives pod restarts and node failures
- **Stateful Applications**: Required for databases, file servers, and stateful workloads
- **Data Sharing**: Allows multiple pods to access the same data
- **Backup and Recovery**: Enables data backup and disaster recovery strategies

### Storage Architecture in Kubernetes
```
Application Pod
    ↓
PersistentVolumeClaim (PVC)
    ↓
PersistentVolume (PV)
    ↓
Storage Backend (EBS, NFS, etc.)
```

---

## 2. AWS EBS CSI Driver Setup and Deployment

### Prerequisites
Before setting up EBS storage in Kubernetes, ensure you have:
- EKS cluster running
- `kubectl` configured to access your cluster
- `helm` installed
- `eksctl` installed

### Step 1: Clean Up Existing EBS CSI Driver (if any)

#### Delete Existing Service Account and IAM Role
```bash
# Delete the service account
kubectl delete serviceaccount ebs-csi-controller-sa -n kube-system

# Delete the IAM service account using eksctl
eksctl delete iamserviceaccount \
  --name ebs-csi-controller-sa \
  --namespace kube-system \
  --cluster micro-mesh-dev \
  --region eu-west-1

# Delete the IAM Role (AmazonEKS_EBS_CSI_DriverRole)
# Detach the policy from the role
# Remove the trust relationship between EKS and IAM
# Remove the IAM Role from AWS if not used elsewhere
```

### Step 2: Install AWS EBS CSI Driver

#### Add Helm Repository
```bash
helm repo add aws-ebs-csi-driver https://kubernetes-sigs.github.io/aws-ebs-csi-driver
helm repo update
```

#### Create IAM Service Account
```bash
eksctl create iamserviceaccount \
  --name ebs-csi-controller-sa \
  --namespace kube-system \
  --cluster micro-mesh-dev \
  --role-name AmazonEKS_EBS_CSI_DriverRole \
  --region eu-west-1 \
  --override-existing-serviceaccounts \
  --attach-policy-arn arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy \
  --approve
```

#### Install EBS CSI Driver
```bash
helm upgrade --install aws-ebs-csi-driver \
  aws-ebs-csi-driver/aws-ebs-csi-driver \
  --namespace kube-system \
  --set controller.serviceAccount.create=false \
  --set controller.serviceAccount.name=ebs-csi-controller-sa
```

#### Verify Installation
```bash
# Check if pods are running
kubectl get pods -n kube-system -l app.kubernetes.io/name=aws-ebs-csi-driver

# Check CSI drivers
kubectl get csidrivers
```

### Step 3: Create Storage Class

#### Create EBS Storage Class
```yaml
# ebs-sc.yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: ebs-sc
provisioner: ebs.csi.aws.com
parameters:
  type: gp2
  fsType: ext4
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
```

#### Apply Storage Class
```bash
kubectl apply -f ebs-sc.yaml
```

### Step 4: Create PVC and Test

#### Create PVC
```yaml
# pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-ebs-pvc
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: ebs-sc
  resources:
    requests:
      storage: 5Gi
```

#### Apply PVC
```bash
kubectl apply -f pvc.yaml
```

### Step 5: Create Test Pod

#### Create Test Pod
```yaml
# pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: ebs-test-pod
spec:
  containers:
  - name: app
    image: nginx
    volumeMounts:
    - mountPath: "/usr/share/nginx/html"
      name: ebs-volume
  volumes:
  - name: ebs-volume
    persistentVolumeClaim:
      claimName: my-ebs-pvc
```

#### Apply and Verify
```bash
# Apply the pod
kubectl apply -f pod.yaml

# Check pod status
kubectl get pods

# Describe pod for details
kubectl describe pod ebs-test-pod

# Check PVC status
kubectl get pvc

# Check PV status
kubectl get pv
```

### Step 6: Verify EBS Volume Creation

#### Check AWS Console
- Go to EC2 Dashboard
- Navigate to Volumes
- Verify that a new EBS volume was created
- Check the volume is attached to an EC2 instance in your cluster

#### Test Volume Mount
```bash
# Exec into the pod
kubectl exec -it ebs-test-pod -- /bin/bash

# Check if volume is mounted
df -h

# Create a test file
echo "Hello from EBS volume" > /usr/share/nginx/html/test.txt

# Exit the pod
exit

# Delete the pod
kubectl delete pod ebs-test-pod

# Recreate the pod
kubectl apply -f pod.yaml

# Verify the file still exists
kubectl exec -it ebs-test-pod -- cat /usr/share/nginx/html/test.txt
```

### Troubleshooting

#### Common Issues and Solutions

**1. PVC Stuck in Pending**
```bash
# Check PVC status
kubectl describe pvc my-ebs-pvc

# Check events
kubectl get events --field-selector involvedObject.name=my-ebs-pvc

# Verify storage class
kubectl get storageclass ebs-sc
```

**2. EBS CSI Driver Not Working**
```bash
# Check CSI driver pods
kubectl get pods -n kube-system -l app.kubernetes.io/name=aws-ebs-csi-driver

# Check logs
kubectl logs -n kube-system -l app.kubernetes.io/name=aws-ebs-csi-driver

# Verify IAM permissions
kubectl describe serviceaccount ebs-csi-controller-sa -n kube-system
```

**3. Volume Attachment Issues**
```bash
# Check if volume is attached
kubectl get pv
kubectl describe pv <pv-name>

# Check AWS console for volume status
# Verify volume is in the same AZ as the node
```

### Clean Up

#### Remove Test Resources
```bash
# Delete pod
kubectl delete pod ebs-test-pod

# Delete PVC
kubectl delete pvc my-ebs-pvc

# Delete storage class
kubectl delete storageclass ebs-sc
```

#### Remove EBS CSI Driver (if needed)
```bash
# Uninstall helm chart
helm uninstall aws-ebs-csi-driver -n kube-system

# Delete IAM service account
eksctl delete iamserviceaccount \
  --name ebs-csi-controller-sa \
  --namespace kube-system \
  --cluster micro-mesh-dev \
  --region eu-west-1
```


---

## 4. StatefulSets with EBS Storage

### What are StatefulSets?
StatefulSets are Kubernetes workload objects designed for stateful applications that require:
- **Stable Network Identity**: Predictable hostnames and DNS names
- **Ordered Deployment**: Pods created, updated, and deleted in sequence
- **Persistent Storage**: Each pod gets its own persistent volume
- **Stable Storage**: Data survives pod restarts and reschedules

### When to Use StatefulSets
- **Databases**: MySQL, PostgreSQL, MongoDB, Redis
- **Message Queues**: RabbitMQ, Kafka, Apache Pulsar
- **Distributed Systems**: Elasticsearch, Cassandra, etcd
- **Applications with State**: File servers, data stores, caches

### Benefits of StatefulSets

#### 1. **Stable Network Identity**
- **Predictable Hostnames**: Each pod gets a consistent hostname (e.g., `mysql-0`, `mysql-1`)
- **Stable DNS Names**: Pods are accessible via predictable DNS names
- **Persistent IP Addresses**: Pods retain their network identity across restarts
- **Direct Pod Access**: Applications can connect to specific pods reliably

#### 2. **Ordered Deployment and Scaling**
- **Sequential Creation**: Pods are created one by one in order (0, 1, 2...)
- **Controlled Scaling**: Scale up/down operations follow predictable patterns
- **Graceful Shutdown**: Pods are terminated in reverse order during scale down
- **Dependency Management**: Ensures proper initialization sequence

#### 3. **Persistent Storage**
- **Individual Volumes**: Each pod gets its own persistent volume
- **Data Persistence**: Data survives pod restarts and reschedules
- **Volume Templates**: Automatic PVC creation for each pod
- **Storage Isolation**: Each pod's data is isolated from others

#### 4. **Stateful Application Support**
- **Database Clusters**: Primary/replica relationships with stable identities
- **Distributed Systems**: Leader election and node coordination
- **Message Queues**: Broker identification and partition management
- **File Systems**: Consistent file paths and data locations

#### 5. **Operational Benefits**
- **Predictable Behavior**: Consistent deployment and scaling patterns
- **Easy Troubleshooting**: Clear pod naming and identification
- **Backup Management**: Individual pod data can be backed up separately
- **Rolling Updates**: Controlled updates with partition-based strategies

#### 6. **High Availability**
- **Fault Tolerance**: Survives node failures with data persistence
- **Load Distribution**: Multiple replicas for read/write distribution
- **Disaster Recovery**: Individual pod recovery with persistent data
- **Geographic Distribution**: Can span multiple availability zones

#### 7. **Application-Specific Features**
- **Database Replication**: Master-slave or primary-replica setups
- **Message Queue Clustering**: Multi-broker configurations
- **Distributed Caching**: Cache clusters with consistent sharding
- **File Server Clusters**: Distributed file systems with stable paths

#### 8. **Development and Testing**
- **Consistent Environments**: Same pod names across dev/staging/prod
- **Easy Debugging**: Predictable pod identification
- **Local Development**: Can run StatefulSets locally with same behavior
- **Testing Scenarios**: Reliable stateful application testing

### StatefulSet vs Deployment Comparison

| Feature | Deployment | StatefulSet |
|---------|------------|-------------|
| Pod Names | Random (web-abc123) | Predictable (web-0, web-1) |
| Storage | Ephemeral | Persistent per pod |
| Scaling | Any order | Ordered (0, 1, 2...) |
| Updates | Rolling | Rolling or OnDelete |
| Network | Load balanced | Stable DNS per pod |
| Use Case | Stateless apps | Stateful apps |

### Practical StatefulSet Implementation with EBS

#### Why Headless Services are Required for StatefulSets

StatefulSets require headless services (`clusterIP: None`) for several critical reasons:

**1. Stable Network Identity**
- Each StatefulSet pod gets a predictable DNS name: `<pod-name>.<service-name>.<namespace>.svc.cluster.local`
- Example: `mysql-0.mysql.default.svc.cluster.local`
- This allows applications to connect to specific pods directly

**2. Pod Discovery and Communication**
- Headless services enable direct pod-to-pod communication
- Applications can discover and connect to individual StatefulSet pods
- Essential for distributed systems like databases, message queues

**3. Stateful Application Requirements**
- Stateful applications often need to know about specific instances
- Primary/replica relationships in databases
- Leader election in distributed systems
- Data partitioning across specific pods

**4. DNS Resolution**
- Headless services create DNS records for each pod
- Allows applications to resolve individual pod IPs
- Enables load balancing at the application level

**5. Ordered Operations**
- StatefulSets create pods in order (0, 1, 2...)
- Headless services maintain this ordering in DNS
- Critical for applications that depend on pod order

#### Step 1: Create Headless Service
```yaml
# mysql-headless-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: mysql
  labels:
    app: mysql
spec:
  ports:
    - port: 3306
  clusterIP: None  # Headless service
  selector:
    app: mysql
```

#### Step 2: Create StatefulSet with EBS Storage
```yaml
# mysql-statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql
spec:
  serviceName: mysql
  replicas: 1
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
        - name: mysql
          image: mysql:8.0
          ports:
            - containerPort: 3306
              name: mysql
          env:
            - name: MYSQL_ROOT_PASSWORD
              value: my-secret-pw
          volumeMounts:
            - name: mysql-storage
              mountPath: /var/lib/mysql
      volumes:
        - name: mysql-storage
          persistentVolumeClaim:
            claimName: my-ebs-pvc
```

#### Step 3: Deploy StatefulSet
```bash
# Apply the headless service
kubectl apply -f mysql-headless-service.yaml

# Apply the StatefulSet
kubectl apply -f mysql-statefulset.yaml

# Check status
kubectl get statefulset mysql
kubectl get pods -l app=mysql
kubectl get pvc
```

### StatefulSet Scaling Operations

#### Scale Up StatefulSet
```bash
# Scale to 5 replicas
kubectl scale statefulset mysql --replicas=5

# Watch pods being created in order
kubectl get pods -l app=mysql -w
```

**Expected Behavior:**
- Pods created in order: mysql-0, mysql-1, mysql-2, mysql-3, mysql-4
- Each pod gets its own PVC: mysql-data-mysql-0, mysql-data-mysql-1, etc.
- Each pod gets stable DNS: mysql-0.mysql, mysql-1.mysql, etc.

#### Scale Down StatefulSet
```bash
# Scale to 2 replicas
kubectl scale statefulset mysql --replicas=2

# Watch pods being deleted in reverse order
kubectl get pods -l app=mysql -w
```

**Expected Behavior:**
- Pods deleted in reverse order: mysql-4, mysql-3, mysql-2
- PVCs are retained (based on reclaim policy)
- Data in remaining pods is preserved

### StatefulSet Update Strategies

#### Rolling Update (Default)
```yaml
# mysql-statefulset-rolling.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql
spec:
  # ... other specs ...
  updateStrategy:
    type: RollingUpdate
    rollingUpdate:
      partition: 0  # Update all pods
```

**Usage:**
```bash
# Update image
kubectl set image statefulset/mysql mysql=mysql:8.0.33

# Update with partition (update only pods >= partition)
kubectl patch statefulset mysql -p '{"spec":{"updateStrategy":{"rollingUpdate":{"partition":2}}}}'
```

#### OnDelete Update
```yaml
# mysql-statefulset-ondelete.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql
spec:
  # ... other specs ...
  updateStrategy:
    type: OnDelete
```

**Usage:**
```bash
# Delete specific pod to trigger update
kubectl delete pod mysql-1
```

### StatefulSet Networking

#### DNS Resolution
```bash
# Test DNS resolution
kubectl run test-dns --image=busybox --rm -it --restart=Never -- nslookup mysql-0.mysql

# Expected output:
# Server:    10.100.0.10
# Address 1: 10.100.0.10 kube-dns.kube-system.svc.cluster.local
# Name:      mysql-0.mysql
# Address 1: 10.244.1.5 mysql-0.mysql.default.svc.cluster.local
```

#### Service Discovery
```bash
# Get all MySQL endpoints
kubectl get endpoints mysql

# Test connection to specific pod
kubectl run mysql-client --image=mysql:8.0 --rm -it --restart=Never -- mysql -h mysql-0.mysql -u root -ppassword
```

### StatefulSet Data Management

#### Backup Data
```bash
# Backup data from specific pod
kubectl exec mysql-0 -- mysqldump -u root -ppassword mydb > backup.sql

# Backup all pods
for i in {0..2}; do
  kubectl exec mysql-$i -- mysqldump -u root -ppassword mydb > backup-mysql-$i.sql
done
```

#### Restore Data
```bash
# Restore data to specific pod
kubectl exec -i mysql-0 -- mysql -u root -ppassword mydb < backup.sql
```

### StatefulSet Troubleshooting

#### Common Issues and Solutions

**1. Pod Stuck in Pending**
```bash
# Check pod events
kubectl describe pod mysql-0

# Check PVC status
kubectl get pvc mysql-data-mysql-0
kubectl describe pvc mysql-data-mysql-0

# Check storage class
kubectl get storageclass ebs-sc
```

**2. Data Loss After Pod Restart**
```bash
# Check if PVC is bound
kubectl get pvc mysql-data-mysql-0

# Check EBS volume in AWS console
# Verify volume is in same AZ as node

# Check pod logs
kubectl logs mysql-0
```

**3. Scaling Issues**
```bash
# Check StatefulSet status
kubectl describe statefulset mysql

# Check if headless service exists
kubectl get service mysql

# Check DNS resolution
kubectl run test-dns --image=busybox --rm -it --restart=Never -- nslookup mysql
```

### Advanced StatefulSet Patterns

#### Multi-Container StatefulSet
```yaml
# multi-container-statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: app-with-sidecar
spec:
  serviceName: app
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
        volumeMounts:
        - name: app-data
          mountPath: /app/data
      - name: sidecar
        image: fluentd:latest
        volumeMounts:
        - name: app-logs
          mountPath: /var/log/app
  volumeClaimTemplates:
  - metadata:
      name: app-data
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: ebs-sc
      resources:
        requests:
          storage: 10Gi
  - metadata:
      name: app-logs
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: ebs-sc
      resources:
        requests:
          storage: 5Gi
```

#### StatefulSet with Init Containers
```yaml
# init-container-statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: app-with-init
spec:
  serviceName: app
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      initContainers:
      - name: init-db
        image: busybox
        command: ['sh', '-c', 'echo "Initializing database..." && sleep 10']
        volumeMounts:
        - name: app-data
          mountPath: /data
      containers:
      - name: app
        image: myapp:latest
        volumeMounts:
        - name: app-data
          mountPath: /app/data
  volumeClaimTemplates:
  - metadata:
      name: app-data
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: ebs-sc
      resources:
        requests:
          storage: 10Gi
```

### Clean Up StatefulSet

#### Remove StatefulSet and Resources
```bash
# Delete StatefulSet
kubectl delete statefulset mysql

# Delete service
kubectl delete service mysql

# Delete ConfigMap
kubectl delete configmap mysql-config

# Check if PVCs are retained or deleted (based on reclaim policy)
kubectl get pvc

# Delete PVCs manually if needed
kubectl delete pvc mysql-data-mysql-0 mysql-data-mysql-1 mysql-data-mysql-2
```

---

## 5. ConfigMaps

### What are ConfigMaps?
ConfigMaps are a way to store non-confidential configuration data in key-value pairs. ConfigMaps can be consumed by pods and used to store configuration data separately from application code.

### ConfigMap Use Cases
- **Application Configuration**: Database URLs, API endpoints
- **Environment Variables**: Log levels, feature flags
- **Configuration Files**: nginx.conf, application.properties
- **Command-line Arguments**: Application startup parameters

### Creating ConfigMaps

#### 1. From Literal Values
```bash
kubectl create configmap app-config \
  --from-literal=database_url=postgresql://localhost:5432/mydb \
  --from-literal=api_endpoint=https://api.example.com \
  --from-literal=log_level=INFO
```

#### 2. From Files
```bash
kubectl create configmap app-config-file --from-file=config.json
```

#### 3. From YAML
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  # Literal values
  database_url: "postgresql://localhost:5432/mydb"
  api_endpoint: "https://api.example.com"
  log_level: "INFO"
  max_connections: "100"
  # File content
  config.json: |
    {
      "database": {
        "host": "localhost",
        "port": 5432,
        "name": "mydb"
      },
      "api": {
        "timeout": 30,
        "retries": 3
      }
    }
  nginx.conf: |
    server {
        listen 80;
        server_name localhost;
        location / {
            root /usr/share/nginx/html;
            index index.html;
        }
    }
```

### Using ConfigMaps in Pods

#### 1. Environment Variables
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-config
spec:
  containers:
  - name: app
    image: myapp:latest
    env:
    # Individual environment variables
    - name: DATABASE_URL
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: database_url
    - name: API_ENDPOINT
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: api_endpoint
    - name: LOG_LEVEL
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: log_level
    # All ConfigMap data as environment variables
    envFrom:
    - configMapRef:
        name: app-config
```

#### 2. Volume Mounts
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-config-volume
spec:
  containers:
  - name: app
    image: myapp:latest
    volumeMounts:
    - name: config-volume
      mountPath: /etc/config
    - name: nginx-config
      mountPath: /etc/nginx/nginx.conf
      subPath: nginx.conf
  volumes:
  - name: config-volume
    configMap:
      name: app-config-file
  - name: nginx-config
    configMap:
      name: app-config
      items:
      - key: nginx.conf
        path: nginx.conf
```

### ConfigMap Best Practices

#### 1. Organization
- **Namespace-specific**: Create ConfigMaps in the same namespace as the application
- **Environment-specific**: Use different ConfigMaps for dev, staging, prod
- **Application-specific**: Separate ConfigMaps by application or component

#### 2. Security
- **No sensitive data**: Never store passwords, tokens, or keys in ConfigMaps
- **Use Secrets**: Store sensitive data in Kubernetes Secrets
- **RBAC**: Control access to ConfigMaps using RBAC

#### 3. Management
- **Version control**: Store ConfigMap definitions in Git
- **Immutable**: Consider using immutable ConfigMaps for stability
- **Validation**: Validate ConfigMap data before applying

---

## 6. Best Practices and Troubleshooting

### Storage Best Practices

#### 1. Storage Class Selection
- **Performance requirements**: Choose appropriate EBS volume types
- **Cost optimization**: Use GP3 for most workloads, IO2 for high-performance
- **Availability**: Consider multi-AZ deployments for critical data
- **Backup strategy**: Implement regular snapshots and backups

#### 2. PVC Management
- **Resource requests**: Set appropriate storage size requests
- **Access modes**: Choose correct access modes for your workload
- **Storage classes**: Use appropriate storage classes for different workloads
- **Volume expansion**: Enable volume expansion for flexibility

#### 3. StatefulSet Best Practices
- **Headless services**: Always create a headless service for StatefulSets
- **PVC templates**: Use PVC templates for persistent storage
- **Update strategies**: Choose appropriate update strategies
- **Scaling**: Understand ordered scaling behavior

### Troubleshooting Commands

#### Storage Troubleshooting
```bash
# Check PV and PVC status
kubectl get pv
kubectl get pvc

# Describe storage resources
kubectl describe pv <pv-name>
kubectl describe pvc <pvc-name>

# Check storage classes
kubectl get storageclass
kubectl describe storageclass <storage-class-name>

# Check events
kubectl get events --field-selector involvedObject.kind=PersistentVolumeClaim
```

#### StatefulSet Troubleshooting
```bash
# Check StatefulSet status
kubectl get statefulset
kubectl describe statefulset <statefulset-name>

# Check individual pods
kubectl get pods -l app=<app-label>
kubectl describe pod <pod-name>

# Check service endpoints
kubectl get endpoints <service-name>
```

#### ConfigMap Troubleshooting
```bash
# Check ConfigMaps
kubectl get configmap
kubectl describe configmap <configmap-name>

# View ConfigMap data
kubectl get configmap <configmap-name> -o yaml

# Check if ConfigMap is mounted correctly
kubectl exec <pod-name> -- ls /etc/config
kubectl exec <pod-name> -- cat /etc/config/config.json
```

### Common Issues and Solutions

#### 1. PVC Pending
**Issue**: PVC remains in Pending state
**Solutions**:
- Check if storage class exists and is correct
- Verify storage class provisioner is working
- Check for storage capacity issues
- Verify IAM permissions (for EBS)

#### 2. StatefulSet Pods Not Ready
**Issue**: StatefulSet pods not becoming ready
**Solutions**:
- Check if headless service exists
- Verify PVC binding
- Check pod logs for application errors
- Verify network policies

#### 3. ConfigMap Not Mounted
**Issue**: ConfigMap data not available in pod
**Solutions**:
- Verify ConfigMap exists in the same namespace
- Check volume mount paths
- Verify ConfigMap key names
- Check pod events for mount errors

### Monitoring and Alerting

#### Key Metrics to Monitor
- **Storage usage**: PVC capacity and usage
- **Volume performance**: IOPS, throughput, latency
- **StatefulSet health**: Pod readiness, restart counts
- **ConfigMap usage**: ConfigMap access patterns

#### Recommended Alerts
- **Storage capacity**: PVC usage > 80%
- **Volume failures**: Failed volume mounts
- **StatefulSet scaling**: Failed scaling operations
- **ConfigMap errors**: ConfigMap mount failures

---

## References

- [Kubernetes Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)
- [Kubernetes StatefulSets](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/)
- [Kubernetes ConfigMaps](https://kubernetes.io/docs/concepts/configuration/configmap/)
- [AWS EBS CSI Driver](https://github.com/kubernetes-sigs/aws-ebs-csi-driver)
- [Kubernetes Storage Classes](https://kubernetes.io/docs/concepts/storage/storage-classes/)

This comprehensive guide covers all aspects of persistent storage, StatefulSets, and ConfigMaps in Kubernetes, providing both theoretical understanding and practical implementation guidance. 