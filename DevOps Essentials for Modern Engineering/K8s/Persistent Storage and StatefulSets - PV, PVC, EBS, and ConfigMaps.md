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

## 2. PersistentVolumes (PV) and PersistentVolumeClaims (PVC)

### PersistentVolume (PV)
A PersistentVolume (PV) is a piece of storage in the cluster that has been provisioned by an administrator or dynamically provisioned using Storage Classes. It is a resource in the cluster just like a node is a cluster resource.

#### PV Characteristics
- **Cluster Resource**: Like a node, a PV is a cluster resource
- **Lifecycle**: Independent of the pod lifecycle
- **Access Modes**: Define how the volume can be mounted
- **Reclaim Policy**: Determines what happens to the volume when the PVC is deleted

#### Access Modes
1. **ReadWriteOnce (RWO)**: Single node can mount as read-write
2. **ReadOnlyMany (ROX)**: Multiple nodes can mount as read-only
3. **ReadWriteMany (RWM)**: Multiple nodes can mount as read-write

#### Reclaim Policies
- **Retain**: Volume is kept even after PVC deletion
- **Delete**: Volume is deleted when PVC is deleted
- **Recycle**: Volume is cleaned and made available for reuse

### PersistentVolumeClaim (PVC)
A PersistentVolumeClaim (PVC) is a request for storage by a user. It is similar to a pod. Pods consume node resources and PVCs consume PV resources.

#### PVC Characteristics
- **Storage Request**: Like a pod, a PVC consumes PV resources
- **Lifecycle**: Bound to a specific PV
- **Storage Class**: Can specify a storage class for dynamic provisioning
- **Access Modes**: Must match the PV's access modes

### Storage Classes
Storage Classes provide a way for administrators to describe the "classes" of storage they offer. Different classes might map to quality-of-service levels, or to backup policies, or to arbitrary policies determined by the cluster administrators.

#### Storage Class Components
- **Provisioner**: Determines which volume plugin to use
- **Parameters**: Storage-specific parameters
- **Reclaim Policy**: What happens to the volume when PVC is deleted
- **Volume Binding Mode**: When to bind and provision the volume

### Static vs Dynamic Provisioning

#### Static Provisioning
Administrator creates PVs manually, and users claim them via PVCs.

```yaml
# Static PV Example
apiVersion: v1
kind: PersistentVolume
metadata:
  name: manual-pv
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: manual
  hostPath:
    path: "/mnt/data"
```

#### Dynamic Provisioning
Storage classes enable dynamic provisioning, where volumes are created on-demand.

```yaml
# Storage Class for Dynamic Provisioning
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp3
  iops: "3000"
  throughput: "125"
reclaimPolicy: Delete
volumeBindingMode: Immediate
allowVolumeExpansion: true
```

---

## 3. Dynamic Volume Provisioning with EBS

### AWS EBS Integration
Amazon Elastic Block Store (EBS) provides persistent block storage volumes for use with EC2 instances. Kubernetes can dynamically provision EBS volumes using the AWS EBS CSI Driver.

### EBS Volume Types

#### GP3 (General Purpose SSD)
- **Use Case**: Most workloads, boot volumes
- **Performance**: 3,000 IOPS baseline, up to 16,000 IOPS
- **Throughput**: 125 MiB/s baseline, up to 1,000 MiB/s
- **Cost**: Most cost-effective SSD option

#### IO2 (Provisioned IOPS SSD)
- **Use Case**: Critical applications requiring high IOPS
- **Performance**: Up to 64,000 IOPS per volume
- **Throughput**: Up to 1,000 MiB/s
- **Cost**: Highest performance, highest cost

#### ST1 (Throughput Optimized HDD)
- **Use Case**: Big data, data warehousing, log processing
- **Performance**: 500 IOPS baseline
- **Throughput**: Up to 500 MiB/s
- **Cost**: Cost-effective for throughput-intensive workloads

#### SC1 (Cold HDD)
- **Use Case**: Infrequently accessed data
- **Performance**: 250 IOPS baseline
- **Throughput**: Up to 250 MiB/s
- **Cost**: Lowest cost option

### AWS EBS CSI Driver Setup

#### 1. Install the EBS CSI Driver
```bash
# Add the AWS EBS CSI Driver Helm repository
helm repo add aws-ebs-csi-driver https://kubernetes-sigs.github.io/aws-ebs-csi-driver
helm repo update

# Install the AWS EBS CSI Driver
helm install aws-ebs-csi-driver aws-ebs-csi-driver/aws-ebs-csi-driver \
  --namespace kube-system \
  --set controller.serviceAccount.create=true \
  --set controller.serviceAccount.annotations."eks\.amazonaws\.com/role-arn"=arn:aws:iam::ACCOUNT_ID:role/AmazonEKS_EBS_CSI_DriverRole
```

#### 2. Create IAM Role (for EKS)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:AttachVolume",
        "ec2:CreateSnapshot",
        "ec2:CreateTags",
        "ec2:CreateVolume",
        "ec2:DeleteSnapshot",
        "ec2:DeleteTags",
        "ec2:DeleteVolume",
        "ec2:DescribeInstances",
        "ec2:DescribeSnapshots",
        "ec2:DescribeTags",
        "ec2:DescribeVolumes",
        "ec2:DetachVolume"
      ],
      "Resource": "*"
    }
  ]
}
```

### EBS Storage Class Examples

#### GP3 Storage Class
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: ebs-gp3
provisioner: ebs.csi.aws.com
parameters:
  type: gp3
  iops: "3000"
  throughput: "125"
  encrypted: "true"
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
```

#### IO2 Storage Class
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: ebs-io2
provisioner: ebs.csi.aws.com
parameters:
  type: io2
  iops: "10000"
  encrypted: "true"
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
```

### Volume Expansion
EBS volumes can be expanded without downtime.

```yaml
# PVC with Volume Expansion
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: expandable-pvc
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: ebs-gp3
  resources:
    requests:
      storage: 10Gi
---
# To expand, patch the PVC
# kubectl patch pvc expandable-pvc -p '{"spec":{"resources":{"requests":{"storage":"20Gi"}}}}'
```

### Complete GP3 Deployment Example

#### 1. Storage Class Definition
```yaml
# gp3-storage-class.yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: ebs-gp3
  annotations:
    storageclass.kubernetes.io/is-default-class: "true"
provisioner: ebs.csi.aws.com
parameters:
  type: gp3
  iops: "3000"
  throughput: "125"
  encrypted: "true"
  kmsKeyId: "arn:aws:kms:region:account:key/key-id"  # Optional
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
```

#### 2. PVC with GP3 Storage
```yaml
# gp3-pvc-example.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-storage-gp3
  labels:
    app: myapp
    storage-type: gp3
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: ebs-gp3
  resources:
    requests:
      storage: 20Gi
    limits:
      storage: 100Gi  # Optional: set maximum expansion limit
```

#### 3. Deployment Using GP3 PVC
```yaml
# gp3-deployment-example.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-with-gp3-storage
  labels:
    app: myapp
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
        image: nginx:latest
        ports:
        - containerPort: 80
        volumeMounts:
        - name: app-data
          mountPath: /app/data
        - name: app-logs
          mountPath: /app/logs
        - name: app-config
          mountPath: /app/config
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
      volumes:
      - name: app-data
        persistentVolumeClaim:
          claimName: app-storage-gp3
      - name: app-logs
        persistentVolumeClaim:
          claimName: app-logs-gp3
      - name: app-config
        configMap:
          name: app-config
```

#### 4. Multiple PVCs with Different GP3 Configurations
```yaml
# multiple-gp3-pvcs.yaml
---
# High-performance GP3 for database
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: database-storage-gp3
  labels:
    app: database
    storage-type: gp3-high-performance
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: ebs-gp3
  resources:
    requests:
      storage: 100Gi
---
# Standard GP3 for application data
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-data-gp3
  labels:
    app: myapp
    storage-type: gp3-standard
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: ebs-gp3
  resources:
    requests:
      storage: 50Gi
---
# Small GP3 for logs
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: logs-storage-gp3
  labels:
    app: myapp
    storage-type: gp3-logs
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: ebs-gp3
  resources:
    requests:
      storage: 10Gi
```

#### 5. StatefulSet with GP3 Storage
```yaml
# statefulset-gp3-example.yaml
apiVersion: v1
kind: Service
metadata:
  name: mysql
  labels:
    app: mysql
spec:
  ports:
  - port: 3306
    targetPort: 3306
    name: mysql
  clusterIP: None
  selector:
    app: mysql
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql
  labels:
    app: mysql
spec:
  serviceName: mysql
  replicas: 3
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
          value: "password"
        - name: MYSQL_DATABASE
          value: "mydb"
        volumeMounts:
        - name: mysql-data
          mountPath: /var/lib/mysql
        - name: mysql-config
          mountPath: /etc/mysql/conf.d
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          exec:
            command:
            - mysqladmin
            - ping
            - -h
            - localhost
            - -u
            - root
            - -p$MYSQL_ROOT_PASSWORD
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          exec:
            command:
            - mysql
            - -h
            - localhost
            - -u
            - root
            - -p$MYSQL_ROOT_PASSWORD
            - -e
            - "SELECT 1"
          initialDelaySeconds: 5
          periodSeconds: 2
      volumes:
      - name: mysql-config
        configMap:
          name: mysql-config
  volumeClaimTemplates:
  - metadata:
      name: mysql-data
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: ebs-gp3
      resources:
        requests:
          storage: 20Gi
```

#### 6. Deployment Scripts and Commands
```bash
# Deploy GP3 Storage Class
kubectl apply -f gp3-storage-class.yaml

# Deploy PVCs
kubectl apply -f gp3-pvc-example.yaml
kubectl apply -f multiple-gp3-pvcs.yaml

# Deploy Application
kubectl apply -f gp3-deployment-example.yaml

# Deploy StatefulSet
kubectl apply -f statefulset-gp3-example.yaml

# Check Status
kubectl get storageclass
kubectl get pvc
kubectl get pv
kubectl get pods

# Monitor Storage Usage
kubectl describe pvc app-storage-gp3
kubectl get events --field-selector involvedObject.name=app-storage-gp3

# Expand Volume (if needed)
kubectl patch pvc app-storage-gp3 -p '{"spec":{"resources":{"requests":{"storage":"40Gi"}}}}'

# Check GP3 Volume Performance
kubectl exec -it <pod-name> -- df -h
kubectl exec -it <pod-name> -- iostat -x 1 5
```

#### 7. GP3 Performance Monitoring
```yaml
# gp3-monitoring.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: gp3-monitoring-config
data:
  # Prometheus monitoring configuration
  prometheus.yml: |
    global:
      scrape_interval: 15s
    
    scrape_configs:
      - job_name: 'gp3-storage-metrics'
        static_configs:
          - targets: ['localhost:9090']
        metrics_path: /metrics
        params:
          storage_type: ['gp3']
  
  # Custom metrics for GP3 volumes
  gp3-metrics.py: |
    import psutil
    import time
    
    def get_gp3_metrics():
        disk_usage = psutil.disk_usage('/app/data')
        return {
            'gp3_volume_size_bytes': disk_usage.total,
            'gp3_volume_used_bytes': disk_usage.used,
            'gp3_volume_free_bytes': disk_usage.free,
            'gp3_volume_usage_percent': (disk_usage.used / disk_usage.total) * 100
        }
```

#### 8. GP3 Best Practices

**Performance Optimization**:
```yaml
# Optimized GP3 configuration
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: ebs-gp3-optimized
provisioner: ebs.csi.aws.com
parameters:
  type: gp3
  iops: "16000"  # Maximum IOPS for GP3
  throughput: "1000"  # Maximum throughput for GP3
  encrypted: "true"
  kmsKeyId: "arn:aws:kms:region:account:key/key-id"
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
```

**Cost Optimization**:
```yaml
# Cost-optimized GP3 configuration
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: ebs-gp3-cost-optimized
provisioner: ebs.csi.aws.com
parameters:
  type: gp3
  iops: "3000"  # Baseline IOPS
  throughput: "125"  # Baseline throughput
  encrypted: "true"
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
```

**Backup Strategy**:
```yaml
# Backup PVC for GP3 volumes
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: backup-storage-gp3
  labels:
    app: backup
    storage-type: gp3-backup
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: ebs-gp3
  resources:
    requests:
      storage: 200Gi
```

This comprehensive GP3 deployment example covers all aspects from basic PVC creation to advanced StatefulSet deployment with monitoring and best practices.

---

## 4. StatefulSets

### What are StatefulSets?
StatefulSets are the workload API object used to manage stateful applications. StatefulSets manage the deployment and scaling of a set of Pods, and provide guarantees about the ordering and uniqueness of these Pods.

### StatefulSet Characteristics
- **Stable Network Identity**: Each pod has a predictable hostname
- **Ordered Deployment**: Pods are created, updated, and deleted in order
- **Persistent Storage**: Each pod gets its own persistent storage
- **Stable DNS**: Each pod gets a predictable DNS name

### When to Use StatefulSets
- **Databases**: MySQL, PostgreSQL, MongoDB
- **Message Queues**: RabbitMQ, Kafka
- **Applications requiring stable identities**: Distributed systems
- **Applications with persistent storage requirements**: File servers, data stores

### StatefulSet vs Deployment

| Feature | Deployment | StatefulSet |
|---------|------------|-------------|
| Pod Names | Random (web-abc123) | Predictable (web-0, web-1) |
| Storage | Ephemeral | Persistent per pod |
| Scaling | Any order | Ordered (0, 1, 2...) |
| Updates | Rolling | Rolling or OnDelete |
| Network | Load balanced | Stable DNS per pod |
| Use Case | Stateless apps | Stateful apps |

### StatefulSet Components

#### 1. Headless Service
StatefulSets require a headless service to manage the network identity of the pods.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: mysql
  labels:
    app: mysql
spec:
  ports:
  - port: 3306
  clusterIP: None
  selector:
    app: mysql
```

#### 2. StatefulSet with PVC Template
```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql
spec:
  serviceName: mysql
  replicas: 3
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
        env:
        - name: MYSQL_ROOT_PASSWORD
          value: "password"
        volumeMounts:
        - name: mysql-data
          mountPath: /var/lib/mysql
  volumeClaimTemplates:
  - metadata:
      name: mysql-data
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: ebs-gp3
      resources:
        requests:
          storage: 10Gi
```

### StatefulSet Scaling

#### Scaling Up
```bash
kubectl scale statefulset mysql --replicas=5
```
- Pods are created in order (mysql-0, mysql-1, mysql-2, mysql-3, mysql-4)
- Each pod gets its own PVC

#### Scaling Down
```bash
kubectl scale statefulset mysql --replicas=2
```
- Pods are deleted in reverse order (mysql-4, mysql-3, mysql-2)
- PVCs are retained (based on reclaim policy)

### StatefulSet Update Strategies

#### Rolling Update
```yaml
spec:
  updateStrategy:
    type: RollingUpdate
    rollingUpdate:
      partition: 0
```

#### OnDelete Update
```yaml
spec:
  updateStrategy:
    type: OnDelete
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