# Route 53 and ACM Integration Guide

This guide explains how to integrate CloudFront and ALB with Route 53 and ACM certificates for a complete domain setup.

## Architecture Overview

```
Internet → Route 53 → CloudFront (Frontend) / ALB (Backend) → EKS
                ↓
            ACM Certificates (SSL/TLS)
```

## Prerequisites

1. **Domain Ownership**: You must own the domain you want to use
2. **Global Infrastructure Deployed**: Route 53 hosted zone and ACM certificates
3. **Frontend/Backend Infrastructure**: CloudFront and ALB deployed

## Step 1: Deploy Global Infrastructure

```bash
cd infra/global/env/dev
terraform init
terraform plan
terraform apply
```

After deployment, note these outputs:
- `hosted_zone_id`: Route 53 hosted zone ID
- `cloudfront_certificate_arn`: ACM certificate ARN for CloudFront
- `alb_certificate_arn`: ACM certificate ARN for ALB

## Step 2: Update Domain Name Servers

1. **Get Name Servers**:
   ```bash
   terraform output hosted_zone_name_servers
   ```

2. **Update Domain Registrar**: 
   - Go to your domain registrar (GoDaddy, Namecheap, etc.)
   - Update the name servers to the ones from the output
   - Wait for DNS propagation (can take up to 48 hours)

## Step 3: Integrate CloudFront with Route 53

### Update CloudFront Module

Modify your CloudFront distribution to use the ACM certificate:

```hcl
# In infra/modules/cloudfront/main.tf
resource "aws_cloudfront_distribution" "main" {
  # ... existing configuration ...

  viewer_certificate {
    acm_certificate_arn      = var.acm_certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}
```

### Update CloudFront Variables

```hcl
# In infra/modules/cloudfront/variables.tf
variable "acm_certificate_arn" {
  description = "ACM certificate ARN for CloudFront"
  type        = string
  default     = ""
}
```

### Update Frontend Environment

```hcl
# In infra/frontend/env/dev/main.tf
module "cloudfront" {
  source = "../../../modules/cloudfront"

  # ... existing configuration ...
  acm_certificate_arn = var.cloudfront_certificate_arn
}

# Add data source to get global outputs
data "terraform_remote_state" "global" {
  backend = "s3"  # or your preferred backend
  config = {
    bucket = "your-terraform-state-bucket"
    key    = "global/dev/terraform.tfstate"
    region = "us-west-2"
  }
}
```

### Create CloudFront Route 53 Record

```hcl
# In infra/frontend/env/dev/main.tf
module "route53_cloudfront" {
  source = "../../../modules/route53"

  domain_name         = var.domain_name
  create_hosted_zone  = false  # Use existing hosted zone

  create_cloudfront_record = true
  cloudfront_subdomain     = "www"
  cloudfront_domain_name   = module.cloudfront.distribution_domain_name
  cloudfront_hosted_zone_id = "Z2FDTNDATAQYW2"  # CloudFront's hosted zone ID
}
```

## Step 4: Integrate ALB with Route 53

### Update ALB Module (if you have one)

```hcl
# In your ALB module
resource "aws_lb" "main" {
  # ... existing configuration ...

  # Add HTTPS listener
  listener {
    port            = "443"
    protocol        = "HTTPS"
    ssl_policy      = "ELBSecurityPolicy-TLS-1-2-2017-01"
    certificate_arn = var.acm_certificate_arn

    default_action {
      type             = "forward"
      target_group_arn = aws_lb_target_group.main.arn
    }
  }
}
```

### Create ALB Route 53 Record

```hcl
# In infra/backend/env/dev/main.tf
module "route53_alb" {
  source = "../../../modules/route53"

  domain_name        = var.domain_name
  create_hosted_zone = false  # Use existing hosted zone

  create_alb_record = true
  alb_subdomain     = "api"
  alb_dns_name      = module.alb.dns_name
  alb_zone_id       = module.alb.zone_id
}
```

## Step 5: Complete Integration Example

### Frontend Environment (infra/frontend/env/dev/main.tf)

```hcl
# Get global infrastructure outputs
data "terraform_remote_state" "global" {
  backend = "s3"
  config = {
    bucket = "your-terraform-state-bucket"
    key    = "global/dev/terraform.tfstate"
    region = "us-west-2"
  }
}

# S3 Bucket
module "s3" {
  source = "../../../modules/s3"
  # ... existing configuration ...
}

# CloudFront with SSL certificate
module "cloudfront" {
  source = "../../../modules/cloudfront"

  distribution_name                    = var.cloudfront_distribution_name
  s3_bucket_name                      = module.s3.bucket_id
  s3_bucket_regional_domain_name      = module.s3.bucket_regional_domain_name
  acm_certificate_arn                 = data.terraform_remote_state.global.outputs.cloudfront_certificate_arn

  tags = var.tags
}

# Route 53 record for CloudFront
module "route53_cloudfront" {
  source = "../../../modules/route53"

  domain_name         = data.terraform_remote_state.global.outputs.domain_name
  create_hosted_zone  = false

  create_cloudfront_record = true
  cloudfront_subdomain     = "www"
  cloudfront_domain_name   = module.cloudfront.distribution_domain_name
  cloudfront_hosted_zone_id = "Z2FDTNDATAQYW2"
}
```

### Backend Environment (infra/backend/env/dev/main.tf)

```hcl
# Get global infrastructure outputs
data "terraform_remote_state" "global" {
  backend = "s3"
  config = {
    bucket = "your-terraform-state-bucket"
    key    = "global/dev/terraform.tfstate"
    region = "us-west-2"
  }
}

# VPC and EKS
module "vpc" {
  source = "../../../modules/vpc"
  # ... existing configuration ...
}

module "eks" {
  source = "../../../modules/eks"
  # ... existing configuration ...
}

# ALB with SSL certificate
module "alb" {
  source = "../../../modules/alb"

  vpc_id              = module.vpc.vpc_id
  subnet_ids          = module.vpc.public_subnet_ids
  acm_certificate_arn = data.terraform_remote_state.global.outputs.alb_certificate_arn

  tags = var.tags
}

# Route 53 record for ALB
module "route53_alb" {
  source = "../../../modules/route53"

  domain_name        = data.terraform_remote_state.global.outputs.domain_name
  create_hosted_zone = false

  create_alb_record = true
  alb_subdomain     = "api"
  alb_dns_name      = module.alb.dns_name
  alb_zone_id       = module.alb.zone_id
}
```

## Step 6: Deployment Order

1. **Deploy Global Infrastructure**:
   ```bash
   cd infra/global/env/dev
   terraform apply
   ```

2. **Update Domain Name Servers** (in your domain registrar)

3. **Deploy Frontend Infrastructure**:
   ```bash
   cd infra/frontend/env/dev
   terraform apply
   ```

4. **Deploy Backend Infrastructure**:
   ```bash
   cd infra/backend/env/dev
   terraform apply
   ```

## Step 7: Verify Setup

### Check DNS Resolution

```bash
# Check CloudFront domain
nslookup www.example.com

# Check ALB domain
nslookup api.example.com
```

### Test HTTPS

```bash
# Test CloudFront
curl -I https://www.example.com

# Test ALB
curl -I https://api.example.com
```

## Domain Structure

After complete integration, you'll have:

- **www.example.com** → CloudFront → S3 (Frontend)
- **api.example.com** → ALB → EKS (Backend)
- **example.com** → Redirects to www.example.com

## Important Notes

1. **Certificate Regions**: CloudFront certificates must be in us-east-1
2. **DNS Propagation**: Can take up to 48 hours for full propagation
3. **Certificate Validation**: ACM certificates are automatically validated via Route 53
4. **Cost Optimization**: Use appropriate CloudFront price classes
5. **Security**: Always use HTTPS redirects and proper SSL policies

## Troubleshooting

### Common Issues:

1. **Certificate Not Found**: Ensure CloudFront certificate is in us-east-1
2. **DNS Not Resolving**: Check name servers are updated at domain registrar
3. **SSL Certificate Errors**: Verify certificate is validated and attached
4. **CloudFront Not Updating**: Clear CloudFront cache after changes

### Useful Commands:

```bash
# Check certificate status
aws acm describe-certificate --certificate-arn YOUR_CERT_ARN

# Check Route 53 records
aws route53 list-resource-record-sets --hosted-zone-id YOUR_ZONE_ID

# Test DNS resolution
dig www.example.com
dig api.example.com
```
