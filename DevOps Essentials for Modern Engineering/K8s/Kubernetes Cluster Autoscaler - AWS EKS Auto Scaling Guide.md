# Kubernetes Cluster Autoscaler - AWS EKS Auto Scaling Guide

## Table of Contents
1. [Overview](#overview)
2. [Benefits](#benefits)
3. [Prerequisites](#prerequisites)
4. [Setup Process](#setup-process)
5. [Configuration](#configuration)
6. [Testing and Verification](#testing-and-verification)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)
9. [Cleanup](#cleanup)

---

## 1. Overview

### What is Cluster Autoscaler?

The **Kubernetes Cluster Autoscaler** automatically adjusts the size of your Kubernetes cluster when:
- There are pods that failed to run due to insufficient resources
- There are nodes that have been underutilized for an extended period

### How it Works

1. **Scale Up**: When pods fail to schedule due to insufficient resources
2. **Scale Down**: When nodes are underutilized for a specified period
3. **Integration**: Works with AWS Auto Scaling Groups (ASG) for EKS

### Key Features

- **Automatic Node Scaling**: Adds/removes nodes based on demand
- **Pod-Aware**: Considers pod requirements and scheduling constraints
- **Cost Optimization**: Removes underutilized nodes to save costs
- **Integration**: Works seamlessly with AWS EKS and Auto Scaling Groups

---

## 2. Benefits

### Operational Benefits
- **Automatic Resource Management**: No manual intervention required
- **Cost Optimization**: Removes unused nodes automatically
- **High Availability**: Ensures pods can always be scheduled
- **Elastic Scaling**: Handles traffic spikes efficiently

### Business Benefits
- **Cost Savings**: Pay only for resources you actually use
- **Performance**: Maintains application performance during traffic spikes
- **Reliability**: Reduces manual scaling errors
- **Scalability**: Handles growth without manual intervention

### Development Benefits
- **Simplified Operations**: Developers don't need to worry about infrastructure scaling
- **Faster Deployments**: No waiting for manual node provisioning
- **Consistent Performance**: Automatic scaling maintains performance levels

---

## 3. Prerequisites

### AWS Requirements
- EKS cluster with node groups
- Auto Scaling Groups configured
- IAM permissions for autoscaling and EC2 operations
- `kubectl` configured for your cluster

### Cluster Requirements
- Metrics Server installed
- Node groups with proper labels
- Sufficient IAM roles and policies

### Tools Required
```bash
# Verify kubectl access
kubectl get nodes

# Verify AWS CLI access
aws sts get-caller-identity
```

---

## 4. Setup Process

### Step 1: Identify Auto Scaling Groups

First, identify your cluster's Auto Scaling Groups:

```bash
aws autoscaling describe-auto-scaling-groups \
  --region eu-west-1 \
  --query "AutoScalingGroups[*].{Name:AutoScalingGroupName}" \
  --output table
```

### Step 2: Tag Auto Scaling Groups

Tag your Auto Scaling Groups for Cluster Autoscaler:

```bash
# Enable cluster autoscaler
aws autoscaling create-or-update-tags --tags \
  ResourceId=<AutoScalingGroupName>,ResourceType=auto-scaling-group,Key=k8s.io/cluster-autoscaler/enabled,Value=true,PropagateAtLaunch=true \
  ResourceId=<AutoScalingGroupName>,ResourceType=auto-scaling-group,Key=k8s.io/cluster-autoscaler/<CLUSTER_NAME>,Value=true,PropagateAtLaunch=true
```

**Important**: Replace `<AutoScalingGroupName>` with your actual Auto Scaling Group name and `<CLUSTER_NAME>` with your cluster name.

### Step 3: Create IAM Policy

Create the required IAM policy for Cluster Autoscaler:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "autoscaling:DescribeAutoScalingGroups",
        "autoscaling:DescribeAutoScalingInstances",
        "autoscaling:DescribeLaunchConfigurations",
        "autoscaling:DescribeTags",
        "autoscaling:SetDesiredCapacity",
        "autoscaling:TerminateInstanceInAutoScalingGroup",
        "ec2:DescribeLaunchTemplateVersions",
        "ec2:*",
        "autoscaling:*"
      ],
      "Resource": "*"
    }
  ]
}
```

### Step 4: Create IAM Service Account

Create the IAM service account for Cluster Autoscaler:

```bash
eksctl create iamserviceaccount \
  --cluster <CLUSTER_NAME> \
  --namespace kube-system \
  --name cluster-autoscaler \
  --attach-policy-arn arn:aws:iam::<ACCOUNT_ID>:policy/AmazonEKSClusterAutoscalerPolicy \
  --approve \
  --override-existing-serviceaccounts
```

**Important**: Replace `<CLUSTER_NAME>` with your actual cluster name and `<ACCOUNT_ID>` with your AWS account ID.

### Step 5: Find and Update Node Role

Find the role attached to your Auto Scaling instances and add autoscaling and EC2 permissions:

```bash
# Find the IAM role attached to Auto Scaling instances
aws ec2 describe-instances \
  --instance-ids $(aws autoscaling describe-auto-scaling-groups \
    --auto-scaling-group-names <AutoScalingGroupName> \
    --query "AutoScalingGroups[].Instances[].InstanceId" \
    --output text) \
  --query "Reservations[].Instances[].IamInstanceProfile.Arn" \
  --output text
```

**Note**: Replace `<AutoScalingGroupName>` with your actual Auto Scaling Group name.

The output will be in the format: `arn:aws:iam::<ACCOUNT_ID>:instance-profile/<ROLE_NAME>`

Extract the role name and add the required permissions:

```bash
# Extract role name from the ARN (remove the instance-profile/ prefix)
ROLE_NAME=$(aws ec2 describe-instances \
  --instance-ids $(aws autoscaling describe-auto-scaling-groups \
    --auto-scaling-group-names <AutoScalingGroupName> \
    --query "AutoScalingGroups[].Instances[].InstanceId" \
    --output text) \
  --query "Reservations[].Instances[].IamInstanceProfile.Arn" \
  --output text | cut -d'/' -f2)

# Add EC2 and Autoscaling permissions to the role
aws iam attach-role-policy \
  --role-name $ROLE_NAME \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2FullAccess

aws iam attach-role-policy \
  --role-name $ROLE_NAME \
  --policy-arn arn:aws:iam::aws:policy/AutoScalingFullAccess
```

**Alternative**: If you prefer to use custom policies, you can create and attach a custom policy with the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:*",
        "autoscaling:*"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## 5. Configuration

### Step 1: Download Cluster Autoscaler Manifest

```bash
wget https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/examples/cluster-autoscaler-autodiscover.yaml
```

### Step 2: Configure the Manifest

Edit the downloaded file and make the following changes:

1. **Replace cluster name**:
   ```yaml
   # Find and replace <CLUSTER_NAME> with your actual cluster name
   - --node-group-auto-discovery=asg:tag=k8s.io/cluster-autoscaler/enabled,k8s.io/cluster-autoscaler/micro-mesh-dev
   ```

2. **Add safe-to-evict annotation**:
   ```yaml
   annotations:
     cluster-autoscaler.kubernetes.io/safe-to-evict: "false"
   ```

### Step 3: Deploy Cluster Autoscaler

```bash
kubectl apply -f cluster-autoscaler-autodiscover.yaml
```

### Step 4: Verify Installation

```bash
# Check if the deployment is running
kubectl get deployment -n kube-system cluster-autoscaler

# Check the logs
kubectl -n kube-system logs -f deployment/cluster-autoscaler
```

---

## 6. Testing and Verification

### ✅ Step-by-Step: Create a Test Application for Cluster Autoscaling

#### 🔧 1. Create a Deployment with High Resource Requests

Create a deployment with 20 pods, each requesting 500m CPU, which may exceed your current node capacity:

```yaml
# cluster-autoscaler-test.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cluster-autoscaler-test
  labels:
    app: autoscaler-test
spec:
  replicas: 20
  selector:
    matchLabels:
      app: autoscaler-test
  template:
    metadata:
      labels:
        app: autoscaler-test
    spec:
      containers:
      - name: pause
        image: k8s.gcr.io/pause:3.2
        resources:
          requests:
            cpu: "500m"
            memory: "128Mi"
          limits:
            cpu: "500m"
            memory: "128Mi"
```

#### 📥 2. Apply the Deployment

```bash
kubectl apply -f cluster-autoscaler-test.yaml
```

#### 🔍 3. Check Pod Status

Immediately after deployment, some pods will be in Pending state due to lack of resources:

```bash
kubectl get pods -l app=autoscaler-test
```

#### 📈 4. Watch the Cluster Autoscaler Logs

If the Cluster Autoscaler is installed correctly, it will detect the pending pods and scale up the node group:

```bash
kubectl -n kube-system logs -f deployment/cluster-autoscaler
```

You should see logs like:
```
scale-up: launching 1 new node(s), estimated cost...
```

#### 🔄 5. Verify Nodes Are Scaling

Use this to check how many nodes are running:

```bash
kubectl get nodes
```

You should see more nodes joining the cluster within a few minutes (3–5 mins usually).

#### 🧹 6. Clean Up After Test

```bash
kubectl delete deployment cluster-autoscaler-test
```

After some time, the Cluster Autoscaler will notice that the nodes are underutilized and scale them down.

#### 📌 Bonus Tip: Use Horizontal Pod Autoscaler (HPA)

You can also test combined HPA + Cluster Autoscaler:

```bash
kubectl autoscale deployment cluster-autoscaler-test --cpu-percent=50 --min=1 --max=50
```

This will scale pods up and trigger node autoscaling if needed.

---

## 7. Best Practices

### Configuration Best Practices

1. **Resource Requests**: Always set resource requests for pods
2. **Node Groups**: Use separate node groups for different workload types
3. **Scaling Policies**: Configure appropriate scaling policies
4. **Monitoring**: Monitor autoscaler logs and metrics

### Operational Best Practices

1. **Gradual Scaling**: Start with conservative scaling policies
2. **Testing**: Test scaling behavior in non-production environments
3. **Monitoring**: Set up alerts for scaling events
4. **Documentation**: Document your scaling policies and procedures

### Cost Optimization

1. **Right-sizing**: Use appropriate instance types
2. **Spot Instances**: Consider using spot instances for cost savings
3. **Scaling Policies**: Configure appropriate scaling down policies
4. **Monitoring**: Monitor costs and adjust policies accordingly

---

## 8. Troubleshooting

### Common Issues

#### Issue 1: Pods Stuck in Pending
```bash
# Check pod events
kubectl describe pod <pod-name>

# Check node capacity
kubectl get nodes -o wide

# Check autoscaler logs
kubectl -n kube-system logs deployment/cluster-autoscaler
```

#### Issue 2: Nodes Not Scaling Up
```bash
# Check IAM permissions
aws iam get-role --role-name <node-role-name>

# Check Auto Scaling Group tags
aws autoscaling describe-auto-scaling-groups --query "AutoScalingGroups[*].Tags"

# Check autoscaler logs
kubectl -n kube-system logs deployment/cluster-autoscaler
```

#### Issue 3: Nodes Not Scaling Down
```bash
# Check pod disruption budgets
kubectl get pdb

# Check node utilization
kubectl top nodes

# Check autoscaler configuration
kubectl -n kube-system get configmap cluster-autoscaler-status -o yaml
```

### Debugging Commands

```bash
# Check autoscaler status
kubectl -n kube-system get configmap cluster-autoscaler-status -o yaml

# Check node groups
kubectl get nodes --show-labels

# Check pod scheduling
kubectl get events --sort-by='.lastTimestamp'

# Check resource usage
kubectl top nodes
kubectl top pods
```

---

## 9. Cleanup

### Remove Test Resources

```bash
# Delete test deployment
kubectl delete deployment cluster-autoscaler-test

# Delete HPA if created
kubectl delete hpa cluster-autoscaler-test
```

### Remove Cluster Autoscaler (Optional)

```bash
# Delete the deployment
kubectl delete deployment cluster-autoscaler -n kube-system

# Delete the service account
kubectl delete serviceaccount cluster-autoscaler -n kube-system

# Remove IAM service account
eksctl delete iamserviceaccount \
  --cluster micro-mesh-dev \
  --namespace kube-system \
  --name cluster-autoscaler \
  --region eu-west-1
```

### Remove Tags from Auto Scaling Groups

```bash
aws autoscaling delete-tags --tags \
  ResourceId=<your-asg-name>,ResourceType=auto-scaling-group,Key=k8s.io/cluster-autoscaler/enabled \
  ResourceId=<your-asg-name>,ResourceType=auto-scaling-group,Key=k8s.io/cluster-autoscaler/micro-mesh-dev
```

---

## Summary

The Kubernetes Cluster Autoscaler provides automatic scaling of your EKS cluster based on pod scheduling requirements. Key benefits include:

- **Automatic Resource Management**: No manual intervention required
- **Cost Optimization**: Removes unused nodes automatically
- **High Availability**: Ensures pods can always be scheduled
- **Integration**: Works seamlessly with AWS EKS and Auto Scaling Groups

The setup process involves:
1. Tagging Auto Scaling Groups
2. Creating IAM policies and service accounts
3. Deploying the Cluster Autoscaler
4. Testing with high-resource deployments

Remember to monitor the autoscaler logs and adjust scaling policies based on your workload requirements.

---

## 10. Advanced Practices for Scale Up and Scale Down Behavior

### 🚀 Advanced Scale Up Configuration

#### Custom Scale Up Parameters

You can customize the Cluster Autoscaler's scale up behavior by adding these parameters to the deployment:

```yaml
# cluster-autoscaler-advanced.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cluster-autoscaler
  namespace: kube-system
spec:
  template:
    spec:
      containers:
      - name: cluster-autoscaler
        image: k8s.gcr.io/autoscaling/cluster-autoscaler:v1.24.0
        command:
        - ./cluster-autoscaler
        - --v=4
        - --stderrthreshold=info
        - --cloud-provider=aws
        - --skip-nodes-with-local-storage=false
        - --expander=least-waste
        - --node-group-auto-discovery=asg:tag=k8s.io/cluster-autoscaler/enabled,k8s.io/cluster-autoscaler/<CLUSTER_NAME>
        # Scale Up Parameters
        - --scale-up-delay-after-add=10s
        - --scale-up-delay-after-delete=10s
        - --scale-up-delay-after-failure=3m
        - --scale-up-unneeded-time=10m
        - --max-node-provision-time=15m
        - --ok-total-unready-count=3
        - --max-total-unready-percentage=45
        - --scale-down-delay-after-add=10m
        - --scale-down-delay-after-delete=10s
        - --scale-down-delay-after-failure=3m
        - --scale-down-unneeded-time=10m
        - --ignore-daemonsets-utilization=false
        - --skip-nodes-with-system-pods=false
```

#### Scale Up Behavior Parameters Explained

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--scale-up-delay-after-add` | 10s | How long to wait after a node is added before considering scaling up |
| `--scale-up-delay-after-delete` | 10s | How long to wait after a node is deleted before considering scaling up |
| `--scale-up-delay-after-failure` | 3m | How long to wait after a failed scale-up before trying again |
| `--max-node-provision-time` | 15m | Maximum time to wait for a node to be provisioned |
| `--ok-total-unready-count` | 3 | Number of nodes that can be unready before scaling up |
| `--max-total-unready-percentage` | 45 | Maximum percentage of nodes that can be unready |

### 📉 Advanced Scale Down Configuration

#### Scale Down Behavior Parameters

```yaml
# Scale Down specific parameters
- --scale-down-delay-after-add=10m
- --scale-down-delay-after-delete=10s
- --scale-down-delay-after-failure=3m
- --scale-down-unneeded-time=10m
- --ignore-daemonsets-utilization=false
- --skip-nodes-with-system-pods=false
- --scale-down-utilization-threshold=0.5
- --max-node-provision-time=15m
- --scale-down-candidates-pool-ratio=0.1
- --scale-down-candidates-pool-min-count=50
- --max-node-group-size=100
- --min-node-group-size=0
- --scale-down-gpu-utilization-threshold=0.5
- --scale-down-simulate=false
- --scale-down-after-add=true
- --scale-down-after-delete=true
- --scale-down-after-failure=true
- --scale-down-nonempty-candidates-count=30
```

#### Advanced Scale Down Configuration Examples

**Conservative Scale Down (Production):**
```yaml
- --scale-down-delay-after-add=15m
- --scale-down-delay-after-delete=5m
- --scale-down-unneeded-time=15m
- --scale-down-utilization-threshold=0.3
- --ignore-daemonsets-utilization=false
- --skip-nodes-with-system-pods=true
- --scale-down-candidates-pool-ratio=0.05
```

**Aggressive Scale Down (Cost Optimization):**
```yaml
- --scale-down-delay-after-add=5m
- --scale-down-delay-after-delete=1m
- --scale-down-unneeded-time=5m
- --scale-down-utilization-threshold=0.2
- --ignore-daemonsets-utilization=true
- --skip-nodes-with-system-pods=false
- --scale-down-candidates-pool-ratio=0.2
```

**Balanced Scale Down (General Purpose):**
```yaml
- --scale-down-delay-after-add=10m
- --scale-down-delay-after-delete=2m
- --scale-down-unneeded-time=10m
- --scale-down-utilization-threshold=0.4
- --ignore-daemonsets-utilization=false
- --skip-nodes-with-system-pods=true
- --scale-down-candidates-pool-ratio=0.1
```

#### Scale Down Behavior Parameters Explained

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--scale-down-delay-after-add` | 10m | How long to wait after a node is added before considering scaling down |
| `--scale-down-delay-after-delete` | 10s | How long to wait after a node is deleted before considering scaling down |
| `--scale-down-delay-after-failure` | 3m | How long to wait after a failed scale-down before trying again |
| `--scale-down-unneeded-time` | 10m | How long a node must be unneeded before scaling down |
| `--scale-down-utilization-threshold` | 0.5 | Node utilization threshold for scale down (50%) |
| `--ignore-daemonsets-utilization` | false | Whether to ignore DaemonSet pods when calculating utilization |
| `--skip-nodes-with-system-pods` | false | Whether to skip nodes with system pods when scaling down |
| `--max-node-provision-time` | 15m | Maximum time to wait for a node to be provisioned |
| `--scale-down-candidates-pool-ratio` | 0.1 | Ratio of nodes that can be considered for scale down |
| `--scale-down-candidates-pool-min-count` | 50 | Minimum number of nodes in scale down candidates pool |
| `--max-node-group-size` | 100 | Maximum number of nodes in a node group |
| `--min-node-group-size` | 0 | Minimum number of nodes in a node group |
| `--scale-down-gpu-utilization-threshold` | 0.5 | GPU utilization threshold for scale down |
| `--scale-down-simulate` | false | Simulate scale down without actually scaling down |
| `--scale-down-after-add` | true | Whether to scale down after adding nodes |
| `--scale-down-after-delete` | true | Whether to scale down after deleting nodes |
| `--scale-down-after-failure` | true | Whether to scale down after failed operations |
| `--scale-down-delay-after-add` | 10m | Delay before considering scale down after adding nodes |
| `--scale-down-delay-after-delete` | 10s | Delay before considering scale down after deleting nodes |
| `--scale-down-delay-after-failure` | 3m | Delay before considering scale down after failures |
| `--scale-down-unneeded-time` | 10m | Time a node must be unneeded before scaling down |
| `--scale-down-utilization-threshold` | 0.5 | CPU utilization threshold for scale down |
| `--scale-down-nonempty-candidates-count` | 30 | Number of non-empty candidates to consider for scale down |
| `--scale-down-candidates-pool-ratio` | 0.1 | Ratio of nodes in scale down candidates pool |
| `--scale-down-candidates-pool-min-count` | 50 | Minimum number of nodes in scale down candidates pool |

### 🎯 Expander Strategies

Choose the best expander strategy for your workload:

```yaml
# Available expander options:
# - least-waste (default): Prefers node groups that waste the least CPU/memory
# - most-pods: Prefers node groups that can schedule the most pods
# - random: Randomly selects a node group
# - price: Prefers node groups with lower cost (requires cloud provider support)
- --expander=least-waste
```

### 🔧 Custom Scale Down Policies

#### Protect Specific Nodes from Scale Down

Add annotations to nodes or pods to prevent scale down:

```yaml
# Prevent node from being scaled down
kubectl annotate node <node-name> cluster-autoscaler.kubernetes.io/scale-down-disabled=true

# Prevent pod from being evicted during scale down
kubectl annotate pod <pod-name> cluster-autoscaler.kubernetes.io/safe-to-evict=false
```

#### Pod Disruption Budgets

Create Pod Disruption Budgets to control scale down behavior:

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: my-app-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: my-app
```

### 📊 Monitoring and Metrics

#### Enable Metrics for Cluster Autoscaler

```yaml
# Add metrics port to the deployment
ports:
- containerPort: 8085
  name: metrics
  protocol: TCP
```

#### Prometheus Configuration

```yaml
# prometheus-cluster-autoscaler.yaml
apiVersion: v1
kind: Service
metadata:
  name: cluster-autoscaler-metrics
  namespace: kube-system
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "8085"
spec:
  ports:
  - port: 8085
    targetPort: 8085
    protocol: TCP
    name: metrics
  selector:
    app: cluster-autoscaler
```

### 🚨 Advanced Alerts

#### Create Custom Alerts for Scaling Events

```yaml
# cluster-autoscaler-alerts.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: cluster-autoscaler-alerts
  namespace: monitoring
spec:
  groups:
  - name: cluster-autoscaler
    rules:
    - alert: ClusterAutoscalerScaleUp
      expr: increase(cluster_autoscaler_scale_up_count[5m]) > 0
      for: 1m
      labels:
        severity: warning
      annotations:
        summary: "Cluster Autoscaler scaled up nodes"
        description: "Cluster Autoscaler scaled up {{ $value }} nodes in the last 5 minutes"
    
    - alert: ClusterAutoscalerScaleDown
      expr: increase(cluster_autoscaler_scale_down_count[5m]) > 0
      for: 1m
      labels:
        severity: info
      annotations:
        summary: "Cluster Autoscaler scaled down nodes"
        description: "Cluster Autoscaler scaled down {{ $value }} nodes in the last 5 minutes"
```

### 🔄 Advanced Scaling Patterns

#### Multi-Node Group Scaling

Configure different scaling behaviors for different node groups:

```yaml
# Different node groups with different scaling policies
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cluster-autoscaler
spec:
  template:
    spec:
      containers:
      - name: cluster-autoscaler
        command:
        - ./cluster-autoscaler
        # Multiple node group discovery
        - --node-group-auto-discovery=asg:tag=k8s.io/cluster-autoscaler/enabled,k8s.io/cluster-autoscaler/<CLUSTER_NAME>
        # Different scaling policies for different node types
        - --scale-down-utilization-threshold=0.3  # More aggressive for spot instances
        - --scale-down-unneeded-time=5m           # Faster scale down for cost optimization
```

#### Multi-Instance Type Auto Scaling Configuration

Create multiple Auto Scaling Groups with different instance types for optimal resource utilization:

##### 1. Create Multiple Node Groups with Different Instance Types

```bash
# Create node group for general workloads (t3.medium)
eksctl create nodegroup \
  --cluster <CLUSTER_NAME> \
  --region <REGION> \
  --name general-workers \
  --node-type t3.medium \
  --nodes 1 \
  --nodes-min 1 \
  --nodes-max 10 \
  --managed

# Create node group for compute-intensive workloads (c5.large)
eksctl create nodegroup \
  --cluster <CLUSTER_NAME> \
  --region <REGION> \
  --name compute-workers \
  --node-type c5.large \
  --nodes 1 \
  --nodes-min 1 \
  --nodes-max 5 \
  --managed

# Create node group for memory-intensive workloads (r5.large)
eksctl create nodegroup \
  --cluster <CLUSTER_NAME> \
  --region <REGION> \
  --name memory-workers \
  --node-type r5.large \
  --nodes 1 \
  --nodes-min 1 \
  --nodes-max 5 \
  --managed

# Create node group for spot instances (cost optimization)
eksctl create nodegroup \
  --cluster <CLUSTER_NAME> \
  --region <REGION> \
  --name spot-workers \
  --node-type t3.medium \
  --nodes 1 \
  --nodes-min 1 \
  --nodes-max 20 \
  --spot \
  --managed
```

##### 2. Tag Each Node Group for Cluster Autoscaler

```bash
# Get Auto Scaling Group names
aws autoscaling describe-auto-scaling-groups \
  --region <REGION> \
  --query "AutoScalingGroups[*].{Name:AutoScalingGroupName}" \
  --output table

# Tag general workers
aws autoscaling create-or-update-tags --tags \
  ResourceId=eksctl-<CLUSTER_NAME>-nodegroup-general-workers,ResourceType=auto-scaling-group,Key=k8s.io/cluster-autoscaler/enabled,Value=true,PropagateAtLaunch=true \
  ResourceId=eksctl-<CLUSTER_NAME>-nodegroup-general-workers,ResourceType=auto-scaling-group,Key=k8s.io/cluster-autoscaler/<CLUSTER_NAME>,Value=true,PropagateAtLaunch=true \
  ResourceId=eksctl-<CLUSTER_NAME>-nodegroup-general-workers,ResourceType=auto-scaling-group,Key=node.kubernetes.io/instance-type,Value=t3.medium,PropagateAtLaunch=true

# Tag compute workers
aws autoscaling create-or-update-tags --tags \
  ResourceId=eksctl-<CLUSTER_NAME>-nodegroup-compute-workers,ResourceType=auto-scaling-group,Key=k8s.io/cluster-autoscaler/enabled,Value=true,PropagateAtLaunch=true \
  ResourceId=eksctl-<CLUSTER_NAME>-nodegroup-compute-workers,ResourceType=auto-scaling-group,Key=k8s.io/cluster-autoscaler/<CLUSTER_NAME>,Value=true,PropagateAtLaunch=true \
  ResourceId=eksctl-<CLUSTER_NAME>-nodegroup-compute-workers,ResourceType=auto-scaling-group,Key=node.kubernetes.io/instance-type,Value=c5.large,PropagateAtLaunch=true

# Tag memory workers
aws autoscaling create-or-update-tags --tags \
  ResourceId=eksctl-<CLUSTER_NAME>-nodegroup-memory-workers,ResourceType=auto-scaling-group,Key=k8s.io/cluster-autoscaler/enabled,Value=true,PropagateAtLaunch=true \
  ResourceId=eksctl-<CLUSTER_NAME>-nodegroup-memory-workers,ResourceType=auto-scaling-group,Key=k8s.io/cluster-autoscaler/<CLUSTER_NAME>,Value=true,PropagateAtLaunch=true \
  ResourceId=eksctl-<CLUSTER_NAME>-nodegroup-memory-workers,ResourceType=auto-scaling-group,Key=node.kubernetes.io/instance-type,Value=r5.large,PropagateAtLaunch=true

# Tag spot workers
aws autoscaling create-or-update-tags --tags \
  ResourceId=eksctl-<CLUSTER_NAME>-nodegroup-spot-workers,ResourceType=auto-scaling-group,Key=k8s.io/cluster-autoscaler/enabled,Value=true,PropagateAtLaunch=true \
  ResourceId=eksctl-<CLUSTER_NAME>-nodegroup-spot-workers,ResourceType=auto-scaling-group,Key=k8s.io/cluster-autoscaler/<CLUSTER_NAME>,Value=true,PropagateAtLaunch=true \
  ResourceId=eksctl-<CLUSTER_NAME>-nodegroup-spot-workers,ResourceType=auto-scaling-group,Key=node.kubernetes.io/instance-type,Value=t3.medium,PropagateAtLaunch=true \
  ResourceId=eksctl-<CLUSTER_NAME>-nodegroup-spot-workers,ResourceType=auto-scaling-group,Key=lifecycle,Value=spot,PropagateAtLaunch=true
```

##### 3. Configure Cluster Autoscaler for Multi-Instance Types

```yaml
# cluster-autoscaler-multi-instance.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cluster-autoscaler
  namespace: kube-system
spec:
  template:
    spec:
      containers:
      - name: cluster-autoscaler
        image: k8s.gcr.io/autoscaling/cluster-autoscaler:v1.24.0
        command:
        - ./cluster-autoscaler
        - --v=4
        - --stderrthreshold=info
        - --cloud-provider=aws
        - --skip-nodes-with-local-storage=false
        - --expander=least-waste
        - --node-group-auto-discovery=asg:tag=k8s.io/cluster-autoscaler/enabled,k8s.io/cluster-autoscaler/<CLUSTER_NAME>
        # Multi-instance type configuration
        - --scale-down-delay-after-add=10m
        - --scale-down-delay-after-delete=10s
        - --scale-down-delay-after-failure=3m
        - --scale-down-unneeded-time=10m
        - --ignore-daemonsets-utilization=false
        - --skip-nodes-with-system-pods=false
        # Instance type specific settings
        - --scale-down-utilization-threshold=0.5
        - --max-node-provision-time=15m
        - --ok-total-unready-count=3
        - --max-total-unready-percentage=45
```

##### 4. Create Node Selectors and Taints for Workload Distribution

```yaml
# node-labels-and-taints.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: node-labels-config
  namespace: kube-system
data:
  node-labels: |
    # General workers
    - key: node.kubernetes.io/instance-type
      value: t3.medium
      taint: false
    
    # Compute workers
    - key: node.kubernetes.io/instance-type
      value: c5.large
      taint: false
      tolerations:
        - key: compute
          operator: Equal
          value: "true"
          effect: NoSchedule
    
    # Memory workers
    - key: node.kubernetes.io/instance-type
      value: r5.large
      taint: false
      tolerations:
        - key: memory
          operator: Equal
          value: "true"
          effect: NoSchedule
    
    # Spot workers
    - key: node.kubernetes.io/instance-type
      value: t3.medium
      taint: true
      tolerations:
        - key: spot
          operator: Equal
          value: "true"
          effect: NoSchedule
```

##### 5. Deploy Workloads to Specific Instance Types

```yaml
# general-workload.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: general-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: general-app
  template:
    metadata:
      labels:
        app: general-app
    spec:
      containers:
      - name: app
        image: nginx
        resources:
          requests:
            cpu: "100m"
            memory: "128Mi"
          limits:
            cpu: "200m"
            memory: "256Mi"
      nodeSelector:
        node.kubernetes.io/instance-type: t3.medium
```

```yaml
# compute-intensive-workload.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: compute-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: compute-app
  template:
    metadata:
      labels:
        app: compute-app
    spec:
      containers:
      - name: app
        image: nginx
        resources:
          requests:
            cpu: "500m"
            memory: "512Mi"
          limits:
            cpu: "1000m"
            memory: "1Gi"
      nodeSelector:
        node.kubernetes.io/instance-type: c5.large
      tolerations:
      - key: compute
        operator: Equal
        value: "true"
        effect: NoSchedule
```

```yaml
# memory-intensive-workload.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: memory-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: memory-app
  template:
    metadata:
      labels:
        app: memory-app
    spec:
      containers:
      - name: app
        image: nginx
        resources:
          requests:
            cpu: "200m"
            memory: "2Gi"
          limits:
            cpu: "500m"
            memory: "4Gi"
      nodeSelector:
        node.kubernetes.io/instance-type: r5.large
      tolerations:
      - key: memory
        operator: Equal
        value: "true"
        effect: NoSchedule
```

```yaml
# spot-workload.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: spot-app
spec:
  replicas: 5
  selector:
    matchLabels:
      app: spot-app
  template:
    metadata:
      labels:
        app: spot-app
    spec:
      containers:
      - name: app
        image: nginx
        resources:
          requests:
            cpu: "100m"
            memory: "128Mi"
          limits:
            cpu: "200m"
            memory: "256Mi"
      nodeSelector:
        node.kubernetes.io/instance-type: t3.medium
      tolerations:
      - key: spot
        operator: Equal
        value: "true"
        effect: NoSchedule
```

##### 6. Monitor Multi-Instance Type Scaling

```bash
# Check node groups
kubectl get nodes --show-labels | grep instance-type

# Check Auto Scaling Groups
aws autoscaling describe-auto-scaling-groups \
  --region <REGION> \
  --query "AutoScalingGroups[*].{Name:AutoScalingGroupName,DesiredCapacity:DesiredCapacity,MinSize:MinSize,MaxSize:MaxSize}" \
  --output table

# Monitor Cluster Autoscaler logs
kubectl -n kube-system logs -f deployment/cluster-autoscaler | grep -E "(scale-up|scale-down|node-group)"

# Check pod distribution across instance types
kubectl get pods -o wide | grep -E "(general|compute|memory|spot)"
```

##### 7. Cost Optimization with Multi-Instance Types

```yaml
# cost-optimized-cluster-autoscaler.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cluster-autoscaler
  namespace: kube-system
spec:
  template:
    spec:
      containers:
      - name: cluster-autoscaler
        command:
        - ./cluster-autoscaler
        # Cost optimization settings
        - --expander=price  # Prefer cheaper instances
        - --scale-down-utilization-threshold=0.3
        - --scale-down-unneeded-time=5m
        - --ignore-daemonsets-utilization=true
        - --skip-nodes-with-system-pods=false
        # Instance type specific scaling
        - --scale-down-delay-after-add=10m
        - --scale-down-delay-after-delete=10s
        - --max-node-provision-time=15m
        - --node-group-auto-discovery=asg:tag=k8s.io/cluster-autoscaler/enabled,k8s.io/cluster-autoscaler/<CLUSTER_NAME>
```

##### 8. Advanced Multi-Instance Type Patterns

**GPU Workloads:**
```yaml
# gpu-nodegroup.yaml
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig
metadata:
  name: <CLUSTER_NAME>
  region: <REGION>
nodeGroups:
- name: gpu-workers
  instanceType: p3.2xlarge  # GPU instance
  minSize: 0
  maxSize: 5
  volumeSize: 100
  labels:
    node.kubernetes.io/instance-type: p3.2xlarge
    accelerator: nvidia-tesla-v100
  taints:
  - key: nvidia.com/gpu
    value: present
    effect: NoSchedule
```

**High Availability Pattern:**
```yaml
# ha-multi-az.yaml
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig
metadata:
  name: <CLUSTER_NAME>
  region: <REGION>
nodeGroups:
- name: general-workers-az1
  instanceType: t3.medium
  minSize: 1
  maxSize: 5
  availabilityZones: ["us-west-2a"]
- name: general-workers-az2
  instanceType: t3.medium
  minSize: 1
  maxSize: 5
  availabilityZones: ["us-west-2b"]
- name: general-workers-az3
  instanceType: t3.medium
  minSize: 1
  maxSize: 5
  availabilityZones: ["us-west-2c"]
```

#### Spot Instance Integration

```yaml
# Optimize for spot instances
- --scale-down-utilization-threshold=0.3
- --scale-down-unneeded-time=5m
- --max-node-provision-time=10m
- --expander=price  # Prefer cheaper instances
```

### 📈 Performance Optimization

#### Tune for High-Performance Workloads

```yaml
# High-performance configuration
- --scale-up-delay-after-add=5s
- --scale-up-delay-after-delete=5s
- --max-node-provision-time=10m
- --ok-total-unready-count=1
- --max-total-unready-percentage=25
- --scale-down-unneeded-time=5m
- --scale-down-utilization-threshold=0.7
```

#### Tune for Cost Optimization

```yaml
# Cost-optimized configuration
- --scale-down-utilization-threshold=0.3
- --scale-down-unneeded-time=3m
- --ignore-daemonsets-utilization=true
- --skip-nodes-with-system-pods=true
- --expander=least-waste
```

### 🛠 Troubleshooting Advanced Issues

#### Debug Scale Up Failures

```bash
# Check scale up events
kubectl get events --sort-by='.lastTimestamp' | grep -i "scale"

# Check autoscaler logs for scale up issues
kubectl -n kube-system logs deployment/cluster-autoscaler | grep -i "scale-up"

# Check node group capacity
kubectl get nodes -o wide
```

#### Debug Scale Down Issues

```bash
# Check why nodes aren't scaling down
kubectl -n kube-system logs deployment/cluster-autoscaler | grep -i "scale-down"

# Check node utilization
kubectl top nodes

# Check pod distribution
kubectl get pods -o wide
```

### 📋 Best Practices Summary

1. **Start Conservative**: Begin with default settings and adjust based on workload
2. **Monitor Metrics**: Set up proper monitoring and alerting
3. **Test Scaling**: Regularly test both scale up and scale down scenarios
4. **Use PDBs**: Implement Pod Disruption Budgets for critical workloads
5. **Optimize Costs**: Use appropriate scaling thresholds for cost optimization
6. **Document Policies**: Document your scaling policies and procedures
7. **Regular Reviews**: Periodically review and adjust scaling parameters
8. **Backup Plans**: Have manual scaling procedures as backup 