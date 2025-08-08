# Monitoring EKS Cluster using Prometheus and Grafana

## Table of Contents
1. [Overview and Architecture](#overview-and-architecture)
2. [Prerequisites and Setup](#prerequisites-and-setup)
3. [Deployment Using Helm](#deployment-using-helm)
4. [Accessing Grafana Dashboard](#accessing-grafana-dashboard)
5. [Monitoring Components and Metrics](#monitoring-components-and-metrics)
6. [Advanced Configuration](#advanced-configuration)
7. [Troubleshooting and Maintenance](#troubleshooting-and-maintenance)
8. [Cleanup Procedures](#cleanup-procedures)

---

## Overview and Architecture

### 🧩 Components Involved

#### Core Monitoring Stack:
- **Prometheus** – Scrapes and stores time-series metrics data
- **Node Exporter** – Collects host-level metrics (CPU, memory, disk, network)
- **kube-state-metrics** – Collects Kubernetes object metrics (pods, deployments, services)
- **Grafana** – Visualizes metrics from Prometheus with dashboards
- **Helm** – Package manager for Kubernetes to simplify deployment

#### Additional Components:
- **Alertmanager** – Handles alert routing and silencing
- **Pushgateway** – For batch job metrics
- **Service Discovery** – Automatically discovers targets to monitor

### Architecture Flow:
```
EKS Cluster
├── Node Exporter (on each node)
├── kube-state-metrics (cluster-wide)
├── Prometheus (scrapes metrics)
├── Grafana (visualization)
└── Alertmanager (alerts)
```

---

## Deployment Using Helm

### 1. Add Prometheus Helm Repository

```bash
# Add the Prometheus community repository
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

# Update repositories
helm repo update

# List available charts
helm search repo prometheus-community
```

### 2. Create Monitoring Namespace

```bash
# Create dedicated namespace for monitoring
kubectl create namespace monitoring

# Verify namespace creation
kubectl get namespaces | grep monitoring
```

### 3. Install Prometheus Stack

#### Basic Installation:
```bash
# Install kube-prometheus-stack
helm install kube-prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace
```

#### Customized Installation with Values File:
```yaml
# values-custom.yaml
grafana:
  adminPassword: "your-secure-password"
  persistence:
    enabled: true
    size: 10Gi
  service:
    type: ClusterIP

prometheus:
  prometheusSpec:
    retention: 15d
    storageSpec:
      volumeClaimTemplate:
        spec:
          storageClassName: gp2
          accessModes: ["ReadWriteOnce"]
          resources:
            requests:
              storage: 50Gi

alertmanager:
  alertmanagerSpec:
    retention: 120h
    storage:
      volumeClaimTemplate:
        spec:
          storageClassName: gp2
          accessModes: ["ReadWriteOnce"]
          resources:
            requests:
              storage: 10Gi
```

```bash
# Install with custom values
helm install kube-prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --values values-custom.yaml
```

### 4. Verify Installation

```bash
# Check all resources in monitoring namespace
kubectl get all -n monitoring

# Check persistent volumes
kubectl get pvc -n monitoring

# Check services
kubectl get svc -n monitoring

# Check pods status
kubectl get pods -n monitoring -o wide
```

### 5. Check Installation Status

```bash
# Check Helm release status
helm list -n monitoring

# Check deployment status
kubectl get deployments -n monitoring

# Check if all pods are running
kubectl get pods -n monitoring --watch

# Check Prometheus targets
kubectl port-forward svc/kube-prometheus-kube-prometheus 9090:9090 -n monitoring
# Then access: http://localhost:9090
```

---

## Accessing Grafana Dashboard

### 1. Get Grafana Credentials

```bash
# Get admin password
kubectl get secret --namespace monitoring kube-prometheus-grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo

# Default credentials:
# Username: admin
# Password: (output from above command)
```

### 2. Access Methods

#### Method 1: Port Forward (Local Access)
```bash
# Port forward Grafana service
kubectl port-forward svc/kube-prometheus-grafana -n monitoring 3000:80

# Access Grafana
# URL: http://localhost:3000
# Username: admin
# Password: (from step 1)
```

#### Method 2: LoadBalancer (Public Access)
```bash
# Change service type to LoadBalancer
kubectl patch svc kube-prometheus-grafana -n monitoring -p '{"spec":{"type":"LoadBalancer"}}'

# Get external IP
kubectl get svc kube-prometheus-grafana -n monitoring

# Access using external IP
# URL: http://<EXTERNAL-IP>
```

#### Method 3: Ingress (Production Setup)
```yaml
# grafana-ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: grafana-ingress
  namespace: monitoring
  annotations:
    kubernetes.io/ingress.class: "alb"
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
spec:
  rules:
  - host: grafana.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: kube-prometheus-grafana
            port:
              number: 80
```

```bash
# Apply ingress
kubectl apply -f grafana-ingress.yaml

# Access via domain
# URL: https://grafana.yourdomain.com
```

#### Method 4: SSH Tunnel (Secure Remote Access)
```bash
# Create SSH tunnel
ssh -i ~/.ssh/your-key.pem -L 3000:localhost:3000 ec2-user@<EC2-PUBLIC-IP>

# In another terminal, port forward
kubectl port-forward svc/kube-prometheus-grafana -n monitoring 3000:80

# Access locally
# URL: http://localhost:3000
```

### 3. Security Group Configuration

#### For EC2 Instance (if using port forward):
```bash
# Add security group rule
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxxx \
  --protocol tcp \
  --port 3000 \
  --cidr 0.0.0.0/0
```

#### For LoadBalancer:
```bash
# Security group should allow port 80/443
# Usually automatically configured by AWS
```

---

## Monitoring Components and Metrics

### 1. Core Metrics Collected

#### Node Exporter Metrics:
```bash
# CPU metrics
node_cpu_seconds_total
node_cpu_seconds_total{mode="idle"}

# Memory metrics
node_memory_MemTotal_bytes
node_memory_MemAvailable_bytes

# Disk metrics
node_filesystem_size_bytes
node_filesystem_avail_bytes

# Network metrics
node_network_receive_bytes_total
node_network_transmit_bytes_total
```

#### Kube-state-metrics:
```bash
# Pod metrics
kube_pod_status_phase
kube_pod_container_status_running

# Deployment metrics
kube_deployment_status_replicas
kube_deployment_status_replicas_available

# Service metrics
kube_service_spec_type
kube_service_status_load_balancer_ingress_ip

# Node metrics
kube_node_status_condition
kube_node_status_allocatable
```

### 2. Pre-built Dashboards

#### Available Dashboards:
1. **Kubernetes Cluster** - Overall cluster health
2. **Kubernetes Nodes** - Node-level metrics
3. **Kubernetes Pods** - Pod-specific metrics
4. **Workload Resources** - Deployment/StatefulSet metrics
5. **Persistent Volumes** - Storage metrics
6. **Kubelet** - Kubelet performance metrics

#### Access Dashboards:
1. Login to Grafana
2. Go to Dashboards → Browse
3. Select desired dashboard
4. Customize time range and refresh rate

### 3. Custom Dashboard Creation

#### Example Dashboard Configuration:
```json
{
  "dashboard": {
    "title": "EKS Cluster Overview",
    "panels": [
      {
        "title": "CPU Usage by Node",
        "type": "graph",
        "targets": [
          {
            "expr": "100 - (avg by (instance) (irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
            "legendFormat": "{{instance}}"
          }
        ]
      },
      {
        "title": "Memory Usage by Node",
        "type": "graph",
        "targets": [
          {
            "expr": "((node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes) * 100",
            "legendFormat": "{{instance}}"
          }
        ]
      },
      {
        "title": "Pod Count by Namespace",
        "type": "stat",
        "targets": [
          {
            "expr": "count(kube_pod_info) by (namespace)",
            "legendFormat": "{{namespace}}"
          }
        ]
      }
    ]
  }
}
```

### 4. Alerting Rules

#### Example Alert Rules:
```yaml
# alert-rules.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: eks-alerts
  namespace: monitoring
spec:
  groups:
  - name: eks.rules
    rules:
    - alert: HighCPUUsage
      expr: 100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "High CPU usage on {{ $labels.instance }}"
        description: "CPU usage is above 80% for 5 minutes"

    - alert: HighMemoryUsage
      expr: ((node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes) * 100 > 85
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "High memory usage on {{ $labels.instance }}"
        description: "Memory usage is above 85% for 5 minutes"

    - alert: PodCrashLooping
      expr: rate(kube_pod_container_status_restarts_total[15m]) * 60 > 0
      for: 2m
      labels:
        severity: critical
      annotations:
        summary: "Pod {{ $labels.pod }} is crash looping"
        description: "Pod {{ $labels.pod }} in namespace {{ $labels.namespace }} is restarting frequently"
```

---

## Advanced Configuration

### 1. Persistent Storage Configuration

#### Create Storage Class:
```yaml
# storage-class.yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: monitoring-storage
provisioner: ebs.csi.aws.com
parameters:
  type: gp3
  encrypted: "true"
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
```

#### Configure Prometheus Storage:
```yaml
# prometheus-storage.yaml
prometheus:
  prometheusSpec:
    storageSpec:
      volumeClaimTemplate:
        spec:
          storageClassName: monitoring-storage
          accessModes: ["ReadWriteOnce"]
          resources:
            requests:
              storage: 100Gi
```

### 2. High Availability Setup

#### Multi-replica Prometheus:
```yaml
# ha-prometheus.yaml
prometheus:
  prometheusSpec:
    replicas: 3
    retention: 30d
    storageSpec:
      volumeClaimTemplate:
        spec:
          storageClassName: monitoring-storage
          accessModes: ["ReadWriteOnce"]
          resources:
            requests:
              storage: 100Gi
```

#### Grafana High Availability:
```yaml
# ha-grafana.yaml
grafana:
  replicas: 2
  persistence:
    enabled: true
    size: 10Gi
    storageClassName: monitoring-storage
```

### 3. Security Configuration

#### RBAC Configuration:
```yaml
# rbac-config.yaml
rbac:
  create: true
  pspEnabled: true

serviceAccount:
  create: true
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::ACCOUNT:role/PrometheusRole
```

#### Network Policies:
```yaml
# network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: monitoring-network-policy
  namespace: monitoring
spec:
  podSelector:
    matchLabels:
      app: prometheus
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: monitoring
    ports:
    - protocol: TCP
      port: 9090
```

### 4. Custom Scrape Configurations

#### Additional Scrape Targets:
```yaml
# custom-scrape.yaml
prometheus:
  prometheusSpec:
    additionalScrapeConfigs:
    - job_name: 'custom-app'
      static_configs:
      - targets: ['app-service:8080']
      metrics_path: /metrics
      scrape_interval: 30s
    - job_name: 'aws-services'
      static_configs:
      - targets: ['cloudwatch-exporter:9106']
```

---

## Troubleshooting and Maintenance

### 1. Common Issues and Solutions

#### Prometheus Pod Not Starting:
```bash
# Check pod events
kubectl describe pod kube-prometheus-kube-prometheus-0 -n monitoring

# Check logs
kubectl logs kube-prometheus-kube-prometheus-0 -n monitoring

# Check persistent volume
kubectl get pvc -n monitoring
kubectl describe pvc prometheus-kube-prometheus-kube-prometheus -n monitoring
```

#### Grafana Access Issues:
```bash
# Check service status
kubectl get svc kube-prometheus-grafana -n monitoring

# Check pod status
kubectl get pods -l app.kubernetes.io/name=grafana -n monitoring

# Check logs
kubectl logs -l app.kubernetes.io/name=grafana -n monitoring
```

#### Metrics Not Collecting:
```bash
# Check Prometheus targets
kubectl port-forward svc/kube-prometheus-kube-prometheus 9090:9090 -n monitoring
# Access: http://localhost:9090/targets

# Check service discovery
kubectl get endpoints -n monitoring

# Check kube-state-metrics
kubectl get pods -l app.kubernetes.io/name=kube-state-metrics -n monitoring
```

### 2. Performance Optimization

#### Prometheus Configuration:
```yaml
# performance-config.yaml
prometheus:
  prometheusSpec:
    retention: 15d
    retentionSize: "50GB"
    scrapeInterval: 30s
    evaluationInterval: 30s
    resources:
      requests:
        memory: 2Gi
        cpu: 500m
      limits:
        memory: 4Gi
        cpu: 1000m
```

#### Grafana Configuration:
```yaml
# grafana-performance.yaml
grafana:
  resources:
    requests:
      memory: 256Mi
      cpu: 100m
    limits:
      memory: 512Mi
      cpu: 200m
  persistence:
    enabled: true
    size: 10Gi
```

### 3. Backup and Restore

#### Backup Prometheus Data:
```bash
# Create backup job
kubectl create job --from=cronjob/prometheus-backup prometheus-backup-manual -n monitoring

# Or manually backup PVC
kubectl cp monitoring/kube-prometheus-kube-prometheus-0:/prometheus /tmp/prometheus-backup
```

#### Backup Grafana Dashboards:
```bash
# Export dashboards
kubectl exec -it deployment/kube-prometheus-grafana -n monitoring -- grafana-cli admin export-dashboards

# Or use Grafana API
curl -H "Authorization: Bearer <api-token>" \
  http://grafana:3000/api/dashboards/db/backup
```

### 4. Monitoring Commands

#### Useful Commands:
```bash
# Check all monitoring resources
kubectl get all -n monitoring

# Check storage usage
kubectl get pvc -n monitoring
kubectl describe pvc -n monitoring

# Check resource usage
kubectl top pods -n monitoring
kubectl top nodes

# Check service endpoints
kubectl get endpoints -n monitoring

# Check events
kubectl get events -n monitoring --sort-by=.metadata.creationTimestamp
```

---

## Cleanup Procedures

### 1. Uninstall Helm Release

```bash
# List Helm releases
helm list -n monitoring

# Uninstall Prometheus stack
helm uninstall kube-prometheus -n monitoring

# Verify uninstallation
helm list -n monitoring
```

### 2. Delete Namespace and Resources

```bash
# Delete the monitoring namespace (this will delete all resources)
kubectl delete namespace monitoring

# Verify namespace deletion
kubectl get namespaces | grep monitoring
```

### 3. Clean Up Persistent Volumes

```bash
# List all PVCs
kubectl get pvc -A

# Delete PVCs in monitoring namespace
kubectl get pvc -n monitoring
kubectl delete pvc --all -n monitoring

# Check if PVs are still bound
kubectl get pv | grep monitoring
```

### 4. Remove Load Balancers

```bash
# List services with LoadBalancer type
kubectl get svc -A | grep LoadBalancer

# Delete LoadBalancer services
kubectl delete svc kube-prometheus-grafana -n monitoring
kubectl delete svc kube-prometheus-alertmanager -n monitoring
```

### 5. Remove Helm Repository

```bash
# Remove Helm repository
helm repo remove prometheus-community

# Update Helm repositories
helm repo update
```

### 6. Clean Up IAM Resources (if using IRSA)

```bash
# Delete IAM service account
eksctl delete iamserviceaccount \
  --cluster=<cluster-name> \
  --namespace=monitoring \
  --name=prometheus

# Delete IAM role
aws iam delete-role --role-name PrometheusRole
```

### 7. Verify Complete Cleanup

```bash
# Check for any remaining resources
kubectl get all -A | grep monitoring
kubectl get pvc -A | grep monitoring
kubectl get pv | grep monitoring
kubectl get svc -A | grep monitoring

# Check for any remaining secrets
kubectl get secrets -A | grep monitoring

# Check for any remaining configmaps
kubectl get configmaps -A | grep monitoring
```

### 8. Clean Up Security Groups (if manually created)

```bash
# Remove security group rules
aws ec2 revoke-security-group-ingress \
  --group-id sg-xxxxxxxxx \
  --protocol tcp \
  --port 3000 \
  --cidr 0.0.0.0/0
```

### 9. Final Verification

```bash
# Ensure no monitoring resources remain
kubectl get all -A
kubectl get pvc -A
kubectl get pv
kubectl get svc -A

# Check Helm repositories
helm repo list

# Verify cluster is clean
kubectl get nodes
kubectl get namespaces
```

---

## Summary

### Key Takeaways:

1. **Helm simplifies deployment** of the entire monitoring stack
2. **Multiple access methods** available for Grafana (port-forward, LoadBalancer, Ingress)
3. **Persistent storage** ensures data retention across pod restarts
4. **Security considerations** include RBAC, network policies, and IAM roles
5. **Proper cleanup** prevents resource leaks and unnecessary costs

### Best Practices:

1. **Use dedicated namespace** for monitoring components
2. **Configure persistent storage** for Prometheus and Grafana
3. **Set up proper RBAC** and security policies
4. **Monitor resource usage** of the monitoring stack itself
5. **Regular backups** of Prometheus data and Grafana dashboards
6. **Document custom configurations** and alert rules
7. **Test cleanup procedures** in non-production environments

### Production Considerations:

1. **High availability** with multiple replicas
2. **Resource limits** to prevent monitoring from consuming too many resources
3. **Network policies** to restrict access
4. **Regular updates** of Prometheus and Grafana versions
5. **Monitoring the monitoring** stack itself
6. **Cost optimization** with appropriate storage classes and retention policies

This comprehensive monitoring setup provides visibility into your EKS cluster's health, performance, and resource utilization, enabling proactive management and troubleshooting. 