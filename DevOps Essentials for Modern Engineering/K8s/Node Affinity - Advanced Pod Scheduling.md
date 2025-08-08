# Node Affinity: Advanced Pod Scheduling in Kubernetes

## Table of Contents
1. [Node Affinity Overview](#node-affinity-overview)
2. [Types of Node Affinity](#types-of-node-affinity)
3. [Node Affinity Rules and Operators](#node-affinity-rules-and-operators)
4. [Practical Examples](#practical-examples)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)
7. [Comparison with Node Selectors](#comparison-with-node-selectors)

---

## 1. Node Affinity Overview

### What is Node Affinity?
Node Affinity is a Kubernetes feature that allows you to constrain which nodes your pod can be scheduled on based on node labels. It provides a more expressive and flexible way to control pod placement compared to simple node selectors.

### Key Concepts
- **Affinity**: The attraction between pods and nodes based on labels
- **Anti-affinity**: The repulsion between pods and nodes
- **Hard requirements**: Must be satisfied (requiredDuringSchedulingIgnoredDuringExecution)
- **Soft preferences**: Preferred but not required (preferredDuringSchedulingIgnoredDuringExecution)
- **Node labels**: Key-value pairs attached to nodes for identification

### Node Affinity Benefits
- **Flexible Scheduling**: More expressive than node selectors
- **Soft Constraints**: Allow scheduling even if preferences aren't met
- **Complex Rules**: Support for multiple conditions and operators
- **Performance Optimization**: Place workloads on optimal nodes
- **Resource Management**: Distribute workloads across different node types

---

## 2. Types of Node Affinity

### Node Affinity Types Table

| Type | Description |
|------|-------------|
| `requiredDuringSchedulingIgnoredDuringExecution` | **Hard rule** — pod will only be scheduled if the rule is satisfied. |
| `preferredDuringSchedulingIgnoredDuringExecution` | **Soft rule** — scheduler will try to honor it but can ignore if not possible. |

### 1. **Required Node Affinity (Hard Requirements)**
- **Type**: `requiredDuringSchedulingIgnoredDuringExecution`
- **Behavior**: Pods will only be scheduled on nodes that satisfy ALL conditions
- **Failure**: If no nodes match, pods remain unscheduled
- **Use Case**: Critical requirements that must be met

### 2. **Preferred Node Affinity (Soft Preferences)**
- **Type**: `preferredDuringSchedulingIgnoredDuringExecution`
- **Behavior**: Pods prefer nodes that satisfy conditions but can be scheduled elsewhere
- **Failure**: Pods can be scheduled on non-preferred nodes
- **Use Case**: Performance optimization and resource preferences

### 3. **Node Anti-Affinity**
- **Purpose**: Prevent pods from being scheduled on specific nodes
- **Use Cases**: 
  - Avoid scheduling on nodes with specific hardware
  - Distribute workloads across different availability zones
  - Prevent resource contention

---

## 3. Node Affinity Rules and Operators

### Available Operators

#### 1. **In Operator**
- **Syntax**: `In`
- **Behavior**: Value must be in the specified set
- **Example**: `node-role.kubernetes.io/worker In (worker1, worker2)`

#### 2. **NotIn Operator**
- **Syntax**: `NotIn`
- **Behavior**: Value must NOT be in the specified set
- **Example**: `node-role.kubernetes.io/worker NotIn (master1, master2)`

#### 3. **Exists Operator**
- **Syntax**: `Exists`
- **Behavior**: Label key must exist (value doesn't matter)
- **Example**: `accelerator-type Exists`

#### 4. **DoesNotExist Operator**
- **Syntax**: `DoesNotExist`
- **Behavior**: Label key must NOT exist
- **Example**: `maintenance-mode DoesNotExist`

#### 5. **Gt (Greater Than) Operator**
- **Syntax**: `Gt`
- **Behavior**: Value must be greater than specified number
- **Example**: `cpu-cores Gt 4`

#### 6. **Lt (Less Than) Operator**
- **Syntax**: `Lt`
- **Behavior**: Value must be less than specified number
- **Example**: `memory-gb Lt 16`

### Weight System for Preferred Affinity
- **Range**: 1-100
- **Higher weight**: Higher preference
- **Calculation**: Sum of all matching expressions
- **Default**: 1 if not specified

---

## 4. Practical Examples

### Common Use Cases
- **GPU Workloads**: Run GPU-intensive workloads only on nodes with GPUs
- **Storage Optimization**: Run storage-intensive workloads on SSD nodes
- **Environment Separation**: Run test pods only on test-node groups
- **Performance Tuning**: Place high-performance workloads on optimized nodes
- **Resource Management**: Distribute workloads across different node types

### Example 1: Basic Node Affinity for SSD Storage

#### Scenario: Run workloads only on nodes with SSD storage
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: example-pod
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: disktype
            operator: In
            values:
            - ssd
```

#### Explanation:
- **Required**: Pod will only schedule on nodes with `disktype=ssd` label
- **Operator**: `In` checks if the node's label value matches the specified value
- **Use Case**: Ensure storage-intensive workloads run on fast SSD storage

#### Setting up Node Labels in EKS:
```bash
# Label a node with disktype=ssd
kubectl label nodes ip-192-168-0-1.ec2.internal disktype=ssd

# Verify the label was applied
kubectl get nodes --show-labels | grep disktype
```

### Example 2: GPU Node Scheduling

#### Scenario: Schedule pods only on GPU nodes
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: gpu-pod
spec:
  containers:
  - name: gpu-app
    image: nvidia/cuda:11.0-base
    command: ["nvidia-smi"]
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: accelerator-type
            operator: In
            values:
            - gpu
            - nvidia-gpu
```

#### Explanation:
- **Required**: Pod will only schedule on nodes with `accelerator-type` label
- **Values**: Accepts nodes labeled with either `gpu` or `nvidia-gpu`
- **Operator**: `In` checks if the node's label value is in the specified list

### Example 2: Complex Required Node Affinity

#### Scenario: Schedule on high-performance nodes in specific zones
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: high-perf-pod
spec:
  containers:
  - name: compute-intensive-app
    image: compute-app:latest
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: node-type
            operator: In
            values:
            - high-performance
            - compute-optimized
          - key: zone
            operator: In
            values:
            - us-west-2a
            - us-west-2b
          - key: cpu-cores
            operator: Gt
            values:
            - "8"
```

#### Explanation:
- **Multiple conditions**: All conditions must be satisfied (AND logic)
- **Node type**: Must be high-performance or compute-optimized
- **Zone**: Must be in specific availability zones
- **CPU cores**: Must have more than 8 CPU cores

### Example 3: Preferred Node Affinity with Weights

#### Scenario: Prefer nodes with SSD storage and high memory
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: storage-intensive-pod
spec:
  containers:
  - name: storage-app
    image: storage-app:latest
  affinity:
    nodeAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        preference:
          matchExpressions:
          - key: storage-type
            operator: In
            values:
            - ssd
            - nvme
      - weight: 50
        preference:
          matchExpressions:
          - key: memory-gb
            operator: Gt
            values:
            - "32"
```

#### Explanation:
- **SSD preference**: 100 weight for SSD/NVMe storage
- **Memory preference**: 50 weight for nodes with >32GB RAM
- **Soft constraints**: Pod can still schedule on HDD nodes with less memory
- **Weight calculation**: Total score = 100 (if SSD) + 50 (if >32GB RAM)

### Example 4: Node Anti-Affinity

#### Scenario: Avoid scheduling on maintenance nodes
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: production-pod
spec:
  containers:
  - name: production-app
    image: production-app:latest
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: maintenance-mode
            operator: DoesNotExist
```

#### Explanation:
- **Anti-affinity**: Uses `DoesNotExist` operator
- **Maintenance avoidance**: Pods won't schedule on nodes with `maintenance-mode` label
- **Production safety**: Ensures production workloads avoid maintenance windows

### Example 5: Multi-tier Application with Node Affinity

#### Scenario: Deploy different tiers on different node types
```yaml
# Database tier - High memory, SSD storage
apiVersion: apps/v1
kind: Deployment
metadata:
  name: database-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: database
  template:
    metadata:
      labels:
        app: database
    spec:
      containers:
      - name: database
        image: postgres:13
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: node-type
                operator: In
                values:
                - database
                - high-memory
              - key: storage-type
                operator: In
                values:
                - ssd
                - nvme
---
# Web tier - Standard compute nodes
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-deployment
spec:
  replicas: 5
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: web
        image: nginx:latest
      affinity:
        nodeAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            preference:
              matchExpressions:
              - key: node-type
                operator: In
                values:
                - web
                - standard
```

### Example 6: GPU Workload Distribution

#### Scenario: Distribute GPU workloads across different GPU types
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: gpu-training-pod
spec:
  containers:
  - name: training-app
    image: tensorflow:latest
    resources:
      limits:
        nvidia.com/gpu: 1
  affinity:
    nodeAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        preference:
          matchExpressions:
          - key: gpu-type
            operator: In
            values:
            - v100
            - a100
      - weight: 50
        preference:
          matchExpressions:
          - key: gpu-memory
            operator: Gt
            values:
            - "16"
```

---

## 5. Best Practices

### 1. **Label Strategy**
- **Consistent naming**: Use consistent label naming conventions
- **Hierarchical labels**: `environment/production`, `zone/us-west-2a`
- **Descriptive values**: Use meaningful label values
- **Documentation**: Document your labeling strategy

### 2. **Affinity Design**
- **Start with soft constraints**: Use preferred affinity first
- **Gradual hardening**: Move to required affinity when stable
- **Test thoroughly**: Test affinity rules in non-production first
- **Monitor scheduling**: Watch for unschedulable pods

### 3. **Performance Considerations**
- **Limit complexity**: Don't create overly complex affinity rules
- **Efficient operators**: Use `Exists`/`DoesNotExist` when possible
- **Weight distribution**: Use meaningful weight values
- **Resource awareness**: Consider node resource capacity

### 4. **Operational Best Practices**
- **Node labeling automation**: Automate node labeling process
- **Affinity documentation**: Document affinity rules and their purpose
- **Regular review**: Periodically review and update affinity rules
- **Backup strategies**: Have fallback scheduling strategies

### 5. **Security Considerations**
- **Label validation**: Validate node labels for security
- **Access control**: Control who can modify node labels
- **Audit logging**: Log node label changes
- **Compliance**: Ensure affinity rules meet compliance requirements

---

## 6. Troubleshooting

### Common Issues and Solutions

#### Issue 1: Pods Stuck in Pending State
```bash
# Check pod events
kubectl describe pod <pod-name>

# Check node labels
kubectl get nodes --show-labels

# Check if nodes match affinity rules
kubectl get nodes -l accelerator-type=gpu
```

#### Issue 2: Unexpected Pod Placement
```bash
# Verify node affinity rules
kubectl get pod <pod-name> -o yaml | grep -A 20 affinity

# Check node selector terms
kubectl get pod <pod-name> -o jsonpath='{.spec.affinity.nodeAffinity}'

# Validate node labels
kubectl get nodes --show-labels | grep <label-key>
```

#### Issue 3: Performance Issues with Complex Rules
```bash
# Check scheduler logs
kubectl logs -n kube-system <scheduler-pod-name>

# Monitor scheduling latency
kubectl get events --sort-by='.lastTimestamp'

# Simplify complex affinity rules
# Break down into multiple simpler rules
```

### Debugging Commands

#### Check Node Labels
```bash
# List all nodes with labels
kubectl get nodes --show-labels

# Filter nodes by specific label
kubectl get nodes -l node-type=high-performance

# Get detailed node information
kubectl describe node <node-name>
```

#### Validate Affinity Rules
```bash
# Test affinity rules with dry-run
kubectl apply -f pod.yaml --dry-run=client

# Check if pod can be scheduled
kubectl get pod <pod-name> -o wide

# View pod events
kubectl get events --field-selector involvedObject.name=<pod-name>
```

#### Monitor Scheduling
```bash
# Watch pod scheduling
kubectl get pods -w

# Check scheduler events
kubectl get events --sort-by='.lastTimestamp' | grep -i scheduler

# Monitor node capacity
kubectl top nodes
```

---

## 7. Comparison with Node Selectors

### Node Selectors vs Node Affinity

| Feature | Node Selector | Node Affinity |
|---------|---------------|---------------|
| **Complexity** | Simple key-value matching | Complex expressions with operators |
| **Flexibility** | Limited to exact matches | Multiple operators and conditions |
| **Soft constraints** | Not supported | Supported with weights |
| **Performance** | Fast and simple | More complex but powerful |
| **Use cases** | Simple requirements | Advanced scheduling needs |

### Migration from Node Selectors
```yaml
# Old node selector approach
spec:
  nodeSelector:
    node-type: high-performance

# New node affinity approach
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: node-type
            operator: In
            values:
            - high-performance
```

### When to Use Each

#### Use Node Selectors When:
- Simple key-value matching is sufficient
- Performance is critical
- Legacy compatibility is needed
- Quick and simple requirements

#### Use Node Affinity When:
- Complex scheduling logic is required
- Soft constraints are needed
- Multiple conditions must be combined
- Advanced operators are required
- Weight-based preferences are needed

---

## Summary

Node Affinity is a powerful Kubernetes feature that provides fine-grained control over pod scheduling. By understanding the different types of affinity, operators, and best practices, you can create sophisticated scheduling strategies that optimize resource utilization and application performance.

### Key Takeaways:
1. **Required affinity** ensures pods only schedule on specific nodes
2. **Preferred affinity** provides scheduling preferences with fallback options
3. **Operators** provide flexibility in matching node labels
4. **Weights** allow prioritization of different preferences
5. **Best practices** ensure maintainable and efficient affinity rules

### Next Steps:
- Practice creating affinity rules for different scenarios
- Monitor pod scheduling behavior in your cluster
- Implement node labeling strategies
- Consider combining with pod affinity/anti-affinity for advanced scheduling 