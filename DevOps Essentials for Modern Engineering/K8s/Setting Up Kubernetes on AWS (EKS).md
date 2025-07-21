# EKS Cluster Creation with eksctl Configuration File

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [eksctl Installation](#eksctl-installation)
3. [Configuration File Structure](#configuration-file-structure)
4. [Basic Cluster Configuration](#basic-cluster-configuration)
5. [Advanced Cluster Configurations](#advanced-cluster-configurations)
6. [Node Group Configurations](#node-group-configurations)
7. [Networking Configurations](#networking-configurations)
8. [Security Configurations](#security-configurations)
9. [IAM and Service Accounts](#iam-and-service-accounts)
10. [Monitoring and Logging](#monitoring-and-logging)
11. [Best Practices](#best-practices)
12. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### AWS Requirements
- **AWS CLI** installed and configured
- **AWS IAM User** with appropriate permissions
- **AWS Region** selected and configured
- **VPC** (optional, eksctl can create one)

### Required IAM Permissions
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "eks:*",
                "ec2:*",
                "iam:*",
                "cloudformation:*",
                "autoscaling:*",
                "elasticloadbalancing:*"
            ],
            "Resource": "*"
        }
    ]
}
```

### Local Requirements
- **kubectl** installed
- **eksctl** installed
- **AWS credentials** configured

---

## eksctl Installation

### macOS (using Homebrew)
```bash
brew tap weaveworks/tap
brew install weaveworks/tap/eksctl
```

### Linux
```bash
# Download and install eksctl
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin
eksctl version
```

### Windows
```powershell
# Using Chocolatey
choco install eksctl

# Or download from GitHub releases
# https://github.com/weaveworks/eksctl/releases
```

---

## Configuration File Structure

### Basic YAML Structure
```yaml
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: my-cluster
  region: us-west-2
  version: "1.28"

vpc:
  # VPC configuration

nodeGroups:
  # Node group configurations

iam:
  # IAM configurations

addons:
  # Addon configurations
```

### Key Sections
- **metadata**: Cluster name, region, version
- **vpc**: Network configuration
- **nodeGroups**: Worker node configurations
- **iam**: Identity and access management
- **addons**: Kubernetes add-ons
- **managedNodeGroups**: AWS managed node groups
- **fargate**: Serverless compute

---

## Basic Cluster Configuration

### Minimal Cluster Configuration
```yaml
# basic-cluster.yaml
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: basic-cluster
  region: us-west-2
  version: "1.28"

nodeGroups:
  - name: ng-1
    instanceType: t3.medium
    desiredCapacity: 2
    minSize: 1
    maxSize: 3
    volumeSize: 20
    privateNetworking: true
    ssh:
      allow: false
```

### Creating the Cluster
```bash
# Create cluster with configuration file
eksctl create cluster -f basic-cluster.yaml

# Verify cluster creation
eksctl get cluster
kubectl get nodes
```

### Cluster with Custom VPC
```yaml
# custom-vpc-cluster.yaml
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: custom-vpc-cluster
  region: us-west-2
  version: "1.28"

vpc:
  id: vpc-12345678
  subnets:
    private:
      us-west-2a:
        id: subnet-12345678
      us-west-2b:
        id: subnet-87654321
    public:
      us-west-2a:
        id: subnet-11111111
      us-west-2b:
        id: subnet-22222222

nodeGroups:
  - name: ng-1
    instanceType: t3.medium
    desiredCapacity: 2
    privateNetworking: true
```

---

## Best Practices

### Production-Ready Cluster Configuration
```yaml
# production-cluster.yaml
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: production-cluster
  region: us-west-2
  version: "1.28"
  tags:
    Environment: production
    Owner: devops-team
    Project: myapp

vpc:
  cidr: "10.0.0.0/16"
  nat:
    gateway: HighlyAvailable
  clusterEndpoints:
    publicAccess: true
    privateAccess: true

secretsEncryption:
  keyARN: arn:aws:kms:us-west-2:123456789012:key/production-cluster-key

iam:
  withOIDC: true
  serviceAccounts:
    - metadata:
        name: cluster-autoscaler
        namespace: kube-system
      wellKnownPolicies:
        autoScaler: true
    - metadata:
        name: aws-load-balancer-controller
        namespace: kube-system
      wellKnownPolicies:
        awsLoadBalancerController: true

managedNodeGroups:
  - name: managed-ng-1
    instanceType: t3.medium
    desiredCapacity: 3
    minSize: 2
    maxSize: 10
    volumeSize: 50
    privateNetworking: true
    ssh:
      allow: false
    tags:
      Environment: production
    labels:
      role: general
    taints: []
    updateConfig:
      maxUnavailable: 1
    iam:
      withAddonPolicies:
        autoScaler: true
        awsLoadBalancerController: true
        ebs: true

addons:
  - name: vpc-cni
    version: latest
    resolveConflicts: overwrite
  - name: coredns
    version: latest
    resolveConflicts: overwrite
  - name: kube-proxy
    version: latest
    resolveConflicts: overwrite
  - name: aws-ebs-csi-driver
    version: latest
    resolveConflicts: overwrite

cloudWatch:
  clusterLogging:
    enableTypes: ["api", "audit", "authenticator", "controllerManager", "scheduler"]
    logRetentionInDays: 30
```

### Configuration Best Practices

#### 1. Resource Naming
- Use descriptive names for clusters and node groups
- Include environment and purpose in names
- Use consistent naming conventions

#### 2. Security
- Enable private networking for node groups
- Use IAM roles for service accounts
- Enable secrets encryption
- Restrict SSH access in production

#### 3. Networking
- Use multiple availability zones
- Configure NAT gateways for high availability
- Use private subnets for worker nodes
- Configure security groups appropriately

#### 4. Scaling
- Set appropriate min/max sizes for node groups
- Use managed node groups for easier management
- Configure auto-scaling policies
- Use spot instances for cost optimization

#### 5. Monitoring
- Enable CloudWatch logging
- Configure appropriate log retention
- Set up monitoring and alerting
- Use tags for resource organization

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Cluster Creation Fails
```bash
# Check eksctl version
eksctl version

# Verify AWS credentials
aws sts get-caller-identity

# Check IAM permissions
aws iam get-user

# Enable debug logging
eksctl create cluster -f cluster.yaml --verbose=4
```

#### 2. Node Group Issues
```bash
# Check node group status
eksctl get nodegroup --cluster my-cluster

# Describe node group
eksctl get nodegroup --cluster my-cluster --name ng-1 -o yaml

# Scale node group
eksctl scale nodegroup --cluster my-cluster --name ng-1 --nodes=3
```

#### 3. Networking Issues
```bash
# Check VPC configuration
aws ec2 describe-vpcs --vpc-ids vpc-12345678

# Verify subnets
aws ec2 describe-subnets --filters "Name=vpc-id,Values=vpc-12345678"

# Check security groups
aws ec2 describe-security-groups --group-ids sg-12345678
```

#### 4. IAM Issues
```bash
# Check OIDC provider
aws iam list-open-id-connect-providers

# Verify service account
kubectl get serviceaccount -n default

# Check IAM roles
aws iam list-roles --path-prefix /aws-service-role/
```

### Useful Commands

#### Cluster Management
```bash
# Create cluster
eksctl create cluster -f cluster.yaml

# Delete cluster
eksctl delete cluster -f cluster.yaml

# Update cluster
eksctl update cluster -f cluster.yaml

# Get cluster info
eksctl get cluster
```

#### Node Group Management
```bash
# Create node group
eksctl create nodegroup -f cluster.yaml

# Delete node group
eksctl delete nodegroup --cluster my-cluster --name ng-1

# Scale node group
eksctl scale nodegroup --cluster my-cluster --name ng-1 --nodes=5
```

#### Add-on Management
```bash
# Create add-on
eksctl create addon -f cluster.yaml

# Delete add-on
eksctl delete addon --cluster my-cluster --name vpc-cni

# Update add-on
eksctl update addon --cluster my-cluster --name vpc-cni --force
```

---

## Conclusion

Using eksctl with configuration files provides a declarative and reproducible way to create EKS clusters. This approach offers several advantages:

### Benefits of Configuration Files
- **Version Control**: Track cluster configurations in Git
- **Reproducibility**: Create identical clusters across environments
- **Documentation**: Self-documenting cluster specifications
- **Review Process**: Enable code review for infrastructure changes
- **Templating**: Use tools like Helm or Kustomize for variations

### Key Considerations
- Always test configurations in non-production environments first
- Use appropriate resource limits and scaling policies
- Implement security best practices from the start
- Monitor cluster health and performance
- Keep configurations updated with EKS versions

### Next Steps
- Set up CI/CD pipelines for cluster management
- Implement monitoring and alerting
- Configure backup and disaster recovery
- Establish operational procedures and runbooks 