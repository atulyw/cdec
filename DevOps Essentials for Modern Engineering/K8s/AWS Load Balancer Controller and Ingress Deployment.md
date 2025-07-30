# AWS Load Balancer Controller and Ingress Deployment Guide

## Overview

This guide covers the complete setup of AWS Load Balancer Controller (AWS ALB Ingress Controller) on an EKS cluster and how to configure Ingress resources to expose applications through Application Load Balancers (ALB).

## Prerequisites

- EKS cluster running in AWS
- `kubectl` configured to communicate with your cluster
- `aws-cli` configured with appropriate permissions
- `eksctl` installed
- `helm` installed

## Step 1: Download IAM Policy

First, download the required IAM policy for the AWS Load Balancer Controller:

```bash
curl -O https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.13.3/docs/install/iam_policy.json
```

**What this does:**
- Downloads the IAM policy document that defines the permissions needed for the AWS Load Balancer Controller
- This policy allows the controller to create and manage AWS Application Load Balancers, Target Groups, and Security Groups

## Step 2: Create IAM Policy

Create the IAM policy in AWS:

```bash
aws iam create-policy \
    --policy-name AWSLoadBalancerControllerIAMPolicy \
    --policy-document file://iam_policy.json
```

**What this does:**
- Creates an IAM policy named `AWSLoadBalancerControllerIAMPolicy`
- Uses the downloaded policy document to define the permissions
- This policy will be attached to a service account that the controller will use

## Step 3: Associate IAM OIDC Provider

Associate the IAM OIDC provider with your EKS cluster:

```bash
eksctl utils associate-iam-oidc-provider --region=eu-west-1 --cluster=basic-cluster --approve
```

**What this does:**
- Creates an IAM OIDC identity provider for your EKS cluster
- Enables the cluster to use IAM roles for service accounts (IRSA)
- This allows Kubernetes service accounts to assume IAM roles with specific permissions

## Step 4: Create IAM Service Account

Create a Kubernetes service account with the necessary IAM role:

```bash
eksctl create iamserviceaccount \
    --cluster=basic-cluster \
    --namespace=kube-system \
    --name=aws-load-balancer-controller \
    --attach-policy-arn=arn:aws:iam::752566893920:policy/AWSLoadBalancerControllerIAMPolicy \
    --override-existing-serviceaccounts \
    --region eu-west-1 \
    --approve
```

**What this does:**
- Creates a Kubernetes service account named `aws-load-balancer-controller` in the `kube-system` namespace
- Attaches the IAM policy to this service account
- Enables the controller to assume the IAM role and access AWS resources
- The `--override-existing-serviceaccounts` flag replaces any existing service account with the same name

## Step 5: Install Helm (if not already installed)

Install Helm using snap:

```bash
snap install helm
```

Verify Helm installation and list repositories:

```bash
helm repo list
```

## Step 6: Add EKS Helm Repository

Add the AWS EKS Helm repository to access the AWS Load Balancer Controller chart:

```bash
helm repo add eks https://aws.github.io/eks-charts
```

**What this does:**
- Adds the official AWS EKS Helm repository to your local Helm configuration
- This repository contains AWS-specific Helm charts including the AWS Load Balancer Controller
- Required before installing the controller via Helm

## Step 7: Install AWS Load Balancer Controller via Helm

Install the AWS Load Balancer Controller using Helm:

```bash
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=basic-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller \
  --version 1.13.0
```

**What this does:**
- Installs the AWS Load Balancer Controller in the `kube-system` namespace
- Sets the cluster name to `basic-cluster`
- Uses the existing service account we created (doesn't create a new one)
- Specifies the service account name to use
- Uses version 1.13.0 of the controller

## Step 8: Apply Custom Resource Definitions (CRDs)

Download and apply the required CRDs:

```bash
wget https://raw.githubusercontent.com/aws/eks-charts/master/stable/aws-load-balancer-controller/crds/crds.yaml
kubectl apply -f crds.yaml
```

**What this does:**
- Downloads the Custom Resource Definitions for the AWS Load Balancer Controller
- These CRDs define the schema for AWS-specific Kubernetes resources
- Enables the controller to understand and process AWS-specific annotations

## Step 9: Verify Deployment

Check if the controller is running properly:

```bash
kubectl get deployment -n kube-system aws-load-balancer-controller
```

**Expected Output:**
```
NAME                           READY   UP-TO-DATE   AVAILABLE   AGE
aws-load-balancer-controller   2/2     2            2           84s
```

## Step 10: Monitor Controller Logs

To monitor the controller logs for troubleshooting:

```bash
# First, get the pod name
kubectl get pods -n kube-system | grep aws-load-balancer-controller

# Then view the logs
kubectl logs -f <aws-load-balancer-controller pod name> -n kube-system
```

## Step 11: Deploy Sample Application

Before creating the Ingress, you need a service to expose. Here's a sample nginx deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  namespace: dev
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
---
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
  namespace: dev
spec:
  selector:
    app: nginx
  ports:
  - port: 8080
    targetPort: 80
    protocol: TCP
  type: ClusterIP
```

## Step 12: Create Ingress Resource

Create an Ingress resource to expose your application:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nginx-ingress
  namespace: dev
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
spec:
  rules:
  - http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: nginx-service
            port:
              number: 8080
```

## Ingress Configuration Explained

### Annotations

1. **`kubernetes.io/ingress.class: alb`**
   - Specifies that this Ingress should be handled by the AWS Load Balancer Controller
   - Creates an Application Load Balancer instead of a Network Load Balancer

2. **`alb.ingress.kubernetes.io/scheme: internet-facing`**
   - Makes the ALB accessible from the internet
   - Alternative: `internal` for internal-only access

3. **`alb.ingress.kubernetes.io/target-type: ip`**
   - Routes traffic directly to pod IPs
   - Alternative: `instance` to route to node ports

### Spec Configuration

- **`rules`**: Define routing rules for the ALB
- **`path: /`**: Matches all paths (root and subpaths)
- **`pathType: Prefix`**: Matches paths that start with the specified path
- **`backend`**: Specifies the service to route traffic to

## Additional Useful Annotations

```yaml
annotations:
  # Security groups
  alb.ingress.kubernetes.io/security-groups: sg-12345678,sg-87654321
  
  # SSL certificate
  alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:region:account:certificate/cert-id
  
  # Health check settings
  alb.ingress.kubernetes.io/healthcheck-path: /health
  alb.ingress.kubernetes.io/healthcheck-port: '8080'
  
  # Load balancer attributes
  alb.ingress.kubernetes.io/load-balancer-attributes: idle_timeout.timeout_seconds=60
  
  # Target group attributes
  alb.ingress.kubernetes.io/target-group-attributes: deregistration_delay.timeout_seconds=30
```

## Verification Commands

```bash
# Check Ingress status
kubectl get ingress -n dev

# Describe Ingress for detailed information
kubectl describe ingress nginx-ingress -n dev

# Check ALB events
kubectl get events -n dev --sort-by='.lastTimestamp'

# Verify service is running
kubectl get svc -n dev

# Check pod status
kubectl get pods -n dev
```

## Troubleshooting

### Common Issues

1. **Controller not starting:**
   - Check IAM permissions
   - Verify service account exists
   - Check controller logs

2. **ALB not created:**
   - Verify annotations are correct
   - Check if controller is running
   - Ensure service exists and is accessible

3. **Health check failures:**
   - Verify target port matches container port
   - Check if application is responding on health check path
   - Ensure security groups allow traffic

### Debug Commands

```bash
# Check controller logs
kubectl logs -n kube-system deployment/aws-load-balancer-controller

# Check service endpoints
kubectl get endpoints -n dev

# Test service connectivity
kubectl run test-pod --image=busybox --rm -it --restart=Never -- wget -O- nginx-service:8080
```

## Security Considerations

1. **Network Security:**
   - Use security groups to restrict access
   - Consider using internal ALBs for private services
   - Implement proper SSL/TLS termination

2. **IAM Permissions:**
   - Follow principle of least privilege
   - Regularly review and update IAM policies
   - Use specific ARNs instead of wildcards where possible

3. **Monitoring:**
   - Set up CloudWatch alarms for ALB metrics
   - Monitor controller logs for errors
   - Track resource usage and costs

## Cost Optimization

1. **ALB Configuration:**
   - Use internal ALBs when possible
   - Implement proper health checks to avoid unnecessary traffic
   - Consider using ALB target group stickiness for session-based applications

2. **Resource Management:**
   - Delete unused Ingress resources
   - Monitor and clean up orphaned ALBs
   - Use appropriate instance types for your workload

## Best Practices

1. **Naming Conventions:**
   - Use descriptive names for Ingress resources
   - Include environment information in resource names
   - Follow consistent tagging strategies

2. **Configuration Management:**
   - Use GitOps for Ingress configuration
   - Implement proper version control
   - Use Helm charts for complex deployments

3. **Monitoring and Alerting:**
   - Set up comprehensive monitoring
   - Create alerts for critical failures
   - Implement proper logging strategies

## Next Steps

After successful deployment:

1. **SSL/TLS Configuration:**
   - Configure SSL certificates for HTTPS
   - Implement proper redirects from HTTP to HTTPS

2. **Advanced Routing:**
   - Implement path-based routing
   - Configure multiple services on the same ALB
   - Set up custom domain names

3. **Monitoring Setup:**
   - Configure CloudWatch dashboards
   - Set up alerting for ALB metrics
   - Implement application-level monitoring

This setup provides a robust foundation for exposing Kubernetes applications through AWS Application Load Balancers with proper security, monitoring, and cost optimization considerations. 