# Infrastructure Deployment Guide

This guide explains how to deploy the complete infrastructure stack using Jenkins pipelines in the correct order.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Global Infra  │    │  Backend Infra  │    │ Frontend Infra  │
│                 │    │                 │    │                 │
│ • Route 53      │───▶│ • VPC           │───▶│ • S3            │
│ • ACM Certs     │    │ • EKS           │    │ • CloudFront    │
│ • DNS           │    │ • ALB           │    │ • Static Assets │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

### 1. AWS Setup
- AWS CLI configured with appropriate permissions
- AWS credentials configured in Jenkins
- Domain registered and accessible

### 2. Jenkins Setup
- Jenkins server with AWS credentials plugin
- Terraform plugin installed
- Email notification configured

### 3. Terraform Backend
- S3 bucket for state storage
- DynamoDB table for state locking

## Deployment Order

**⚠️ IMPORTANT: Deploy in this exact order to avoid dependency issues.**

### Step 1: Deploy Terraform Backend Infrastructure

**Purpose**: Create S3 bucket and DynamoDB table for Terraform state storage.

```bash
# Manual deployment (one-time setup)
cd infra/terraform-backend
terraform init
terraform plan
terraform apply
```

**Resources Created**:
- S3 bucket: `terraform-state-bucket`
- DynamoDB table: `terraform-state-lock`

### Step 2: Deploy Global Infrastructure

**Purpose**: Create Route 53 hosted zone and ACM certificates.

**Jenkins Pipeline**: `infra/global/Jenkinsfile`

**Parameters**:
- `ENVIRONMENT`: dev/stage/prod
- `AUTO_APPROVE`: false (recommended)
- `TERRAFORM_VERSION`: 1.5.0

**Deployment**:
1. Create Jenkins job for Global Infrastructure
2. Configure build parameters
3. Run the pipeline
4. Approve terraform apply when prompted

**Resources Created**:
- Route 53 hosted zone
- ACM certificates (CloudFront & ALB)
- DNS validation records

**State File**: `global/{environment}/terraform.tfstate`

### Step 3: Update Domain Name Servers

**Purpose**: Point your domain to AWS Route 53.

1. **Get Name Servers**:
   ```bash
   # From Jenkins build output or AWS Console
   aws route53 get-hosted-zone --id /hostedzone/YOUR_ZONE_ID
   ```

2. **Update Domain Registrar**:
   - Go to your domain registrar (GoDaddy, Namecheap, etc.)
   - Update name servers to the ones from Route 53
   - Wait for DNS propagation (up to 48 hours)

### Step 4: Deploy Backend Infrastructure

**Purpose**: Create VPC, EKS cluster, and ALB.

**Jenkins Pipeline**: `infra/backend/Jenkinsfile`

**Dependencies**: Global infrastructure must be deployed first

**Parameters**:
- `ENVIRONMENT`: dev/stage/prod
- `AUTO_APPROVE`: false (recommended)
- `TERRAFORM_VERSION`: 1.5.0
- `SKIP_GLOBAL_CHECK`: false

**Deployment**:
1. Create Jenkins job for Backend Infrastructure
2. Configure build parameters
3. Run the pipeline
4. Pipeline will verify global infrastructure exists
5. Approve terraform apply when prompted

**Resources Created**:
- VPC with public/private subnets
- EKS cluster with managed node groups
- Application Load Balancer
- Security groups and IAM roles

**State File**: `backend/{environment}/terraform.tfstate`

### Step 5: Deploy Frontend Infrastructure

**Purpose**: Create S3 bucket, CloudFront distribution, and deploy static assets.

**Jenkins Pipeline**: `infra/frontend/Jenkinsfile`

**Dependencies**: Backend infrastructure must be deployed first

**Parameters**:
- `ENVIRONMENT`: dev/stage/prod
- `AUTO_APPROVE`: false (recommended)
- `TERRAFORM_VERSION`: 1.5.0
- `SKIP_BACKEND_CHECK`: false
- `DEPLOY_FRONTEND_ASSETS`: true
- `FRONTEND_BUILD_PATH`: app/frontend/dist

**Deployment**:
1. Create Jenkins job for Frontend Infrastructure
2. Configure build parameters
3. Ensure frontend build exists in `app/frontend/dist`
4. Run the pipeline
5. Pipeline will verify backend infrastructure exists
6. Approve terraform apply when prompted

**Resources Created**:
- S3 bucket for static website hosting
- CloudFront distribution with SSL
- Route 53 records for frontend domain
- Frontend assets deployed to S3

**State File**: `frontend/{environment}/terraform.tfstate`

## Jenkins Job Configuration

### Prerequisites for Jenkins Setup

1. **Jenkins Plugins Required**:
   - Git Plugin
   - Pipeline Plugin
   - AWS Credentials Plugin
   - Email Extension Plugin

2. **AWS Credentials Setup**:
   - Add AWS credentials in Jenkins Credentials Store
   - Use AWS Access Key ID and Secret Access Key
   - Credential ID: `aws-credentials`

3. **Repository Access**:
   - Ensure Jenkins has access to the GitHub repository
   - Configure SSH keys or HTTPS authentication

### Creating Jenkins Jobs

For each job, follow these steps:

1. **Create New Item** → **Pipeline**
2. **Configure Pipeline**:
   - Select "Pipeline script from SCM"
   - SCM: Git
   - Repository URL: `https://github.com/atulyw/cdec.git`
   - Branch Specifier: `cdec-devops-project`
   - Script Path: `infra/{component}/Jenkinsfile`

3. **Configure Build Parameters** (as specified below)
4. **Save** the job configuration

### 1. Global Infrastructure Job

**Job Name**: `infra-global-deploy`

**Pipeline Configuration**:
- **Pipeline script from SCM**
- **SCM**: Git
- **Repository URL**: `https://github.com/atulyw/cdec.git`
- **Branch Specifier**: `cdec-devops-project`
- **Script Path**: `infra/global/Jenkinsfile`

**Build Parameters**:
- `ENVIRONMENT` (Choice): dev, stage, prod
- `AUTO_APPROVE` (Boolean): false
- `TERRAFORM_VERSION` (String): 1.5.0

### 2. Backend Infrastructure Job

**Job Name**: `infra-backend-deploy`

**Pipeline Configuration**:
- **Pipeline script from SCM**
- **SCM**: Git
- **Repository URL**: `https://github.com/atulyw/cdec.git`
- **Branch Specifier**: `cdec-devops-project`
- **Script Path**: `infra/backend/Jenkinsfile`

**Build Parameters**:
- `ENVIRONMENT` (Choice): dev, stage, prod
- `AUTO_APPROVE` (Boolean): false
- `TERRAFORM_VERSION` (String): 1.5.0
- `SKIP_GLOBAL_CHECK` (Boolean): false

### 3. Frontend Infrastructure Job

**Job Name**: `infra-frontend-deploy`

**Pipeline Configuration**:
- **Pipeline script from SCM**
- **SCM**: Git
- **Repository URL**: `https://github.com/atulyw/cdec.git`
- **Branch Specifier**: `cdec-devops-project`
- **Script Path**: `infra/frontend/Jenkinsfile`

**Build Parameters**:
- `ENVIRONMENT` (Choice): dev, stage, prod
- `AUTO_APPROVE` (Boolean): false
- `TERRAFORM_VERSION` (String): 1.5.0
- `SKIP_BACKEND_CHECK` (Boolean): false
- `DEPLOY_FRONTEND_ASSETS` (Boolean): true
- `FRONTEND_BUILD_PATH` (String): app/frontend/dist

## Environment-Specific Configurations

### Development Environment
- **Domain**: `dev.example.com`
- **Instance Types**: t3.small (cost-optimized)
- **Node Count**: 1-3 nodes
- **Price Class**: PriceClass_100

### Staging Environment
- **Domain**: `stage.example.com`
- **Instance Types**: t3.medium
- **Node Count**: 2-4 nodes
- **Price Class**: PriceClass_200

### Production Environment
- **Domain**: `example.com`
- **Instance Types**: t3.large
- **Node Count**: 3-6 nodes
- **Price Class**: PriceClass_All

## Verification Steps

### After Global Deployment
```bash
# Check Route 53 hosted zone
aws route53 get-hosted-zone --id /hostedzone/YOUR_ZONE_ID

# Check ACM certificates
aws acm list-certificates --region us-east-1
aws acm list-certificates --region us-west-2
```

### After Backend Deployment
```bash
# Check EKS cluster
aws eks describe-cluster --name backend-dev-cluster --region us-west-2

# Check VPC
aws ec2 describe-vpcs --filters "Name=tag:Name,Values=backend-dev-vpc"
```

### After Frontend Deployment
```bash
# Check S3 bucket
aws s3 ls s3://frontend-dev-website

# Check CloudFront distribution
aws cloudfront get-distribution --id YOUR_DISTRIBUTION_ID

# Test website
curl -I https://www.dev.example.com
```

## Troubleshooting

### Common Issues

1. **Dependency Check Failed**
   - Ensure previous infrastructure is deployed
   - Check state files exist in S3
   - Verify terraform outputs are available

2. **Terraform Init Failed**
   - Check AWS credentials in Jenkins
   - Verify S3 bucket and DynamoDB table exist
   - Check network connectivity

3. **Certificate Validation Failed**
   - Ensure domain name servers are updated
   - Wait for DNS propagation
   - Check Route 53 validation records

4. **EKS Cluster Not Accessible**
   - Verify IAM roles and policies
   - Check security group configurations
   - Ensure node groups are healthy

### Useful Commands

```bash
# Check Terraform state
aws s3 ls s3://terraform-state-bucket/global/dev/
aws s3 ls s3://terraform-state-bucket/backend/dev/
aws s3 ls s3://terraform-state-bucket/frontend/dev/

# Check DynamoDB locks
aws dynamodb scan --table-name terraform-state-lock

# View Jenkins logs
# Check Jenkins console output for detailed error messages
```

## Security Considerations

1. **State Files**: Encrypted in S3 with versioning enabled
2. **Access Control**: IAM roles with least privilege
3. **Network Security**: Private subnets for worker nodes
4. **SSL/TLS**: ACM certificates for all endpoints
5. **Secrets Management**: Use AWS Secrets Manager for sensitive data

## Cost Optimization

1. **Development**: Use smaller instance types and fewer nodes
2. **Staging**: Moderate resources for testing
3. **Production**: Right-size based on actual usage
4. **CloudFront**: Use appropriate price classes
5. **S3**: Enable lifecycle policies for cost optimization

## Monitoring and Maintenance

1. **CloudWatch**: Monitor resource usage and costs
2. **Terraform State**: Regular backups and validation
3. **Security Updates**: Keep AMIs and node groups updated
4. **Certificate Renewal**: ACM certificates auto-renew
5. **DNS Health**: Monitor Route 53 health checks

## Support

For issues or questions:
- Check Jenkins build logs
- Review Terraform state files
- Consult AWS documentation
- Contact DevOps team

---

**Last Updated**: $(date)
**Version**: 1.0
