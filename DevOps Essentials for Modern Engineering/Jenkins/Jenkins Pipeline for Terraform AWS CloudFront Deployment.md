# Jenkins Pipeline for Terraform AWS CloudFront Deployment

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Terraform Configuration](#terraform-configuration)
5. [Jenkins Pipeline](#jenkins-pipeline)
6. [AWS Resources Setup](#aws-resources-setup)
7. [SSL Certificate Management](#ssl-certificate-management)
8. [Route 53 Configuration](#route-53-configuration)
9. [CloudFront Distribution](#cloudfront-distribution)
10. [Deployment Strategies](#deployment-strategies)
11. [Monitoring and Troubleshooting](#monitoring-and-troubleshooting)
12. [Best Practices](#best-practices)

## Overview

This guide covers deploying a complete frontend infrastructure on AWS using:
- **CloudFront**: Global CDN for content delivery
- **Route 53**: DNS management and health checks
- **ACM**: SSL/TLS certificate management
- **S3**: Origin storage for static content
- **Terraform**: Infrastructure as Code
- **Jenkins**: CI/CD pipeline automation

## Architecture

```
Internet → Route 53 → CloudFront → S3 Origin
    ↓           ↓         ↓
  SSL Cert   DNS      CDN Edge
  (ACM)    Records   Locations
```

### Components
- **Route 53**: DNS resolution and health checks
- **ACM**: SSL certificate for HTTPS
- **CloudFront**: Global CDN with edge locations
- **S3**: Origin bucket for static files
- **IAM**: Permissions and roles
- **VPC**: Network isolation (if needed)

## Prerequisites

### 1. AWS Setup
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS credentials
aws configure
# Enter: Access Key ID, Secret Access Key, Default region, Default output format
```

### 2. Terraform Installation
```bash
# Install Terraform
curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs)"
sudo apt-get update && sudo apt-get install terraform

# Verify installation
terraform version
```

### 3. Jenkins Setup
- Jenkins with Terraform plugin
- AWS credentials configured
- Git access to repository
- Docker support (optional)

## Terraform Configuration

### 1. Main Configuration (`main.tf`)
```hcl
# Configure AWS Provider
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "your-terraform-state-bucket"
    key    = "cloudfront-frontend/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Environment = var.environment
      Project     = var.project_name
      ManagedBy   = "Terraform"
    }
  }
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}
data "aws_availability_zones" "available" {}

# Local values
locals {
  common_tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "Terraform"
    Owner       = "DevOps Team"
  }
}
```

### 2. Variables (`variables.tf`)
```hcl
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "frontend-app"
}

variable "domain_name" {
  description = "Primary domain name"
  type        = string
  default     = "example.com"
}

variable "subdomain" {
  description = "Subdomain for the application"
  type        = string
  default     = "app"
}

variable "certificate_arn" {
  description = "ACM certificate ARN"
  type        = string
  default     = ""
}

variable "create_certificate" {
  description = "Whether to create a new certificate"
  type        = bool
  default     = true
}

variable "cloudfront_price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100"
}

variable "minimum_protocol_version" {
  description = "Minimum TLS protocol version"
  type        = string
  default     = "TLSv1.2_2021"
}
```

### 3. S3 Origin Bucket (`s3.tf`)
```hcl
# S3 bucket for static content
resource "aws_s3_bucket" "origin" {
  bucket = "${var.project_name}-${var.environment}-origin-${random_string.bucket_suffix.result}"
  
  tags = local.common_tags
}

# Random string for unique bucket names
resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
}

# S3 bucket versioning
resource "aws_s3_bucket_versioning" "origin" {
  bucket = aws_s3_bucket.origin.id
  versioning_configuration {
    status = "Enabled"
  }
}

# S3 bucket public access block
resource "aws_s3_bucket_public_access_block" "origin" {
  bucket = aws_s3_bucket.origin.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 bucket policy
resource "aws_s3_bucket_policy" "origin" {
  bucket = aws_s3_bucket.origin.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontServicePrincipal"
        Effect    = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.origin.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.frontend.arn
          }
        }
      }
    ]
  })
}

# S3 bucket CORS configuration
resource "aws_s3_bucket_cors_configuration" "origin" {
  bucket = aws_s3_bucket.origin.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}
```

### 4. SSL Certificate (`acm.tf`)
```hcl
# ACM certificate for the domain
resource "aws_acm_certificate" "main" {
  count = var.create_certificate ? 1 : 0
  
  domain_name               = var.domain_name
  subject_alternative_names = ["*.${var.domain_name}", "${var.subdomain}.${var.domain_name}"]
  validation_method         = "DNS"
  
  lifecycle {
    create_before_destroy = true
  }
  
  tags = local.common_tags
}

# Certificate validation
resource "aws_acm_certificate_validation" "main" {
  count = var.create_certificate ? 1 : 0
  
  certificate_arn         = aws_acm_certificate.main[0].arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

# Local value for certificate ARN
locals {
  certificate_arn = var.create_certificate ? aws_acm_certificate.main[0].arn : var.certificate_arn
}
```

### 5. Route 53 Configuration (`route53.tf`)
```hcl
# Route 53 hosted zone
data "aws_route53_zone" "main" {
  name = var.domain_name
}

# Certificate validation records
resource "aws_route53_record" "cert_validation" {
  count = var.create_certificate ? length(aws_acm_certificate.main[0].domain_validation_options) : 0
  
  zone_id = data.aws_route53_zone.main.zone_id
  name    = aws_acm_certificate.main[0].domain_validation_options[count.index].resource_record_name
  type    = aws_acm_certificate.main[0].domain_validation_options[count.index].resource_record_type
  records = [aws_acm_certificate.main[0].domain_validation_options[count.index].resource_record_value]
  ttl     = 60
}

# A record for the subdomain
resource "aws_route53_record" "app" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "${var.subdomain}.${var.domain_name}"
  type    = "A"
  
  alias {
    name                   = aws_cloudfront_distribution.frontend.domain_name
    zone_id                = aws_cloudfront_distribution.frontend.hosted_zone_id
    evaluate_target_health = false
  }
}

# A record for the root domain (optional)
resource "aws_route53_record" "root" {
  count = var.domain_name != var.subdomain ? 1 : 0
  
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"
  
  alias {
    name                   = aws_cloudfront_distribution.frontend.domain_name
    zone_id                = aws_cloudfront_distribution.frontend.hosted_zone_id
    evaluate_target_health = false
  }
}
```

### 6. CloudFront Distribution (`cloudfront.tf`)
```hcl
# CloudFront distribution
resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  is_ipv6_enabled    = true
  price_class         = var.cloudfront_price_class
  aliases             = ["${var.subdomain}.${var.domain_name}", var.domain_name]
  
  origin {
    domain_name              = aws_s3_bucket.origin.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
    origin_id                = "S3-${aws_s3_bucket.origin.id}"
  }
  
  default_root_object = "index.html"
  
  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.origin.id}"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
    
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
    
    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400
  }
  
  # Handle SPA routing
  custom_error_response {
    error_code         = 404
    response_code      = "200"
    response_page_path = "/index.html"
  }
  
  # Handle 403 errors
  custom_error_response {
    error_code         = 403
    response_code      = "200"
    response_page_path = "/index.html"
  }
  
  # Viewer certificate
  viewer_certificate {
    acm_certificate_arn      = local.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = var.minimum_protocol_version
  }
  
  # Geo restrictions (optional)
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  tags = local.common_tags
}

# CloudFront origin access control
resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "OAC-${var.project_name}-${var.environment}"
  description                       = "Origin Access Control for S3 bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}
```

### 7. Outputs (`outputs.tf`)
```hcl
output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.frontend.id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "s3_bucket_name" {
  description = "S3 origin bucket name"
  value       = aws_s3_bucket.origin.bucket
}

output "s3_bucket_arn" {
  description = "S3 origin bucket ARN"
  value       = aws_s3_bucket.origin.arn
}

output "certificate_arn" {
  description = "ACM certificate ARN"
  value       = local.certificate_arn
}

output "app_url" {
  description = "Application URL"
  value       = "https://${var.subdomain}.${var.domain_name}"
}

output "route53_zone_id" {
  description = "Route 53 hosted zone ID"
  value       = data.aws_route53_zone.main.zone_id
}
```

## Jenkins Pipeline

### 1. Basic Pipeline (`Jenkinsfile`)
```groovy
pipeline {
    agent any
    
    environment {
        AWS_REGION = 'us-east-1'
        TERRAFORM_VERSION = '1.5.0'
        PROJECT_NAME = 'frontend-app'
        ENVIRONMENT = 'production'
    }
    
    tools {
        terraform 'Terraform'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Terraform Init') {
            steps {
                dir('terraform') {
                    sh 'terraform init'
                }
            }
        }
        
        stage('Terraform Plan') {
            steps {
                dir('terraform') {
                    sh 'terraform plan -out=tfplan'
                }
            }
        }
        
        stage('Terraform Apply') {
            when {
                branch 'main'
            }
            steps {
                dir('terraform') {
                    sh 'terraform apply -auto-approve tfplan'
                }
            }
        }
        
        stage('Upload Frontend') {
            when {
                branch 'main'
            }
            steps {
                script {
                    def bucketName = sh(
                        script: 'cd terraform && terraform output -raw s3_bucket_name',
                        returnStdout: true
                    ).trim()
                    
                    sh "aws s3 sync dist/ s3://${bucketName} --delete"
                }
            }
        }
        
        stage('Invalidate CloudFront') {
            when {
                branch 'main'
            }
            steps {
                script {
                    def distributionId = sh(
                        script: 'cd terraform && terraform output -raw cloudfront_distribution_id',
                        returnStdout: true
                    ).trim()
                    
                    sh "aws cloudfront create-invalidation --distribution-id ${distributionId} --paths '/*'"
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo "Infrastructure deployment successful!"
        }
        failure {
            echo "Infrastructure deployment failed!"
        }
    }
}
```

### 2. Advanced Pipeline with Validation (`Jenkinsfile-advanced`)
```groovy
pipeline {
    agent any
    
    environment {
        AWS_REGION = 'us-east-1'
        TERRAFORM_VERSION = '1.5.0'
        PROJECT_NAME = 'frontend-app'
        ENVIRONMENT = 'production'
        DOMAIN_NAME = 'example.com'
        SUBDOMAIN = 'app'
    }
    
    tools {
        terraform 'Terraform'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Validate Terraform') {
            steps {
                dir('terraform') {
                    sh 'terraform validate'
                    sh 'terraform fmt -check'
                }
            }
        }
        
        stage('Security Scan') {
            parallel {
                stage('Terraform Security') {
                    steps {
                        sh 'terraform -v'
                        // Add tfsec or checkov scanning
                        echo "Running Terraform security scan..."
                    }
                }
                
                stage('Dependency Check') {
                    steps {
                        sh 'terraform -v'
                        echo "Checking Terraform dependencies..."
                    }
                }
            }
        }
        
        stage('Terraform Init') {
            steps {
                dir('terraform') {
                    sh 'terraform init -backend-config="key=${PROJECT_NAME}/${ENVIRONMENT}/terraform.tfstate"'
                }
            }
        }
        
        stage('Terraform Plan') {
            steps {
                dir('terraform') {
                    sh '''
                        terraform plan \
                            -var="environment=${ENVIRONMENT}" \
                            -var="project_name=${PROJECT_NAME}" \
                            -var="domain_name=${DOMAIN_NAME}" \
                            -var="subdomain=${SUBDOMAIN}" \
                            -out=tfplan
                    '''
                }
            }
        }
        
        stage('Manual Approval') {
            when {
                branch 'main'
            }
            steps {
                input message: 'Deploy to production?', ok: 'Deploy'
            }
        }
        
        stage('Terraform Apply') {
            when {
                branch 'main'
            }
            steps {
                dir('terraform') {
                    sh 'terraform apply -auto-approve tfplan'
                }
            }
        }
        
        stage('Wait for Certificate') {
            when {
                branch 'main'
            }
            steps {
                script {
                    def certificateArn = sh(
                        script: 'cd terraform && terraform output -raw certificate_arn',
                        returnStdout: true
                    ).trim()
                    
                    echo "Waiting for certificate validation: ${certificateArn}"
                    
                    // Wait for certificate validation
                    sh '''
                        aws acm wait certificate-validated \
                            --certificate-arn ${certificateArn} \
                            --region ${AWS_REGION}
                    '''
                }
            }
        }
        
        stage('Upload Frontend') {
            when {
                branch 'main'
            }
            steps {
                script {
                    def bucketName = sh(
                        script: 'cd terraform && terraform output -raw s3_bucket_name',
                        returnStdout: true
                    ).trim()
                    
                    // Build frontend (if needed)
                    sh 'npm run build'
                    
                    // Upload to S3
                    sh "aws s3 sync dist/ s3://${bucketName} --delete --cache-control 'max-age=31536000'"
                    
                    // Upload index.html with no-cache
                    sh "aws s3 cp dist/index.html s3://${bucketName}/index.html --cache-control 'no-cache'"
                }
            }
        }
        
        stage('Invalidate CloudFront') {
            when {
                branch 'main'
            }
            steps {
                script {
                    def distributionId = sh(
                        script: 'cd terraform && terraform output -raw cloudfront_distribution_id',
                        returnStdout: true
                    ).trim()
                    
                    echo "Creating CloudFront invalidation for distribution: ${distributionId}"
                    
                    def invalidationId = sh(
                        script: "aws cloudfront create-invalidation --distribution-id ${distributionId} --paths '/*' --query 'Invalidation.Id' --output text",
                        returnStdout: true
                    ).trim()
                    
                    echo "Waiting for invalidation to complete: ${invalidationId}"
                    
                    sh "aws cloudfront wait invalidation-completed --distribution-id ${distributionId} --id ${invalidationId}"
                }
            }
        }
        
        stage('Health Check') {
            when {
                branch 'main'
            }
            steps {
                script {
                    def appUrl = sh(
                        script: 'cd terraform && terraform output -raw app_url',
                        returnStdout: true
                    ).trim()
                    
                    echo "Performing health check on: ${appUrl}"
                    
                    // Wait for CloudFront to be ready
                    sh 'sleep 60'
                    
                    // Health check
                    sh "curl -f -s -o /dev/null -w '%{http_code}' ${appUrl} | grep -q '200'"
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            script {
                if (env.BRANCH_NAME == 'main') {
                    def appUrl = sh(
                        script: 'cd terraform && terraform output -raw app_url',
                        returnStdout: true
                    ).trim()
                    
                    emailext (
                        subject: "Frontend Deployment Successful - ${env.BUILD_NUMBER}",
                        body: """
                        Frontend deployment completed successfully!
                        
                        Build: ${env.BUILD_NUMBER}
                        Environment: ${ENVIRONMENT}
                        Application URL: ${appUrl}
                        CloudFront Distribution: ${sh(script: 'cd terraform && terraform output -raw cloudfront_distribution_id', returnStdout: true).trim()}
                        
                        Deployment completed at: ${new Date().format("yyyy-MM-dd HH:mm:ss")}
                        """,
                        to: "devops@company.com, developers@company.com"
                    )
                }
            }
        }
        failure {
            emailext (
                subject: "Frontend Deployment Failed - ${env.BRANCH_NAME} #${env.BUILD_NUMBER}",
                body: """
                Frontend deployment failed!
                
                Build: ${env.BUILD_NUMBER}
                Branch: ${env.BRANCH_NAME}
                Environment: ${ENVIRONMENT}
                
                Check Jenkins console for details: ${env.BUILD_URL}
                """,
                to: "devops@company.com"
            )
        }
    }
}
```

## AWS Resources Setup

### 1. IAM User for Jenkins
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:*",
                "cloudfront:*",
                "route53:*",
                "acm:*",
                "iam:GetUser",
                "iam:GetRole"
            ],
            "Resource": "*"
        }
    ]
}
```

### 2. S3 Backend for Terraform State
```hcl
# Create S3 backend bucket
resource "aws_s3_bucket" "terraform_state" {
  bucket = "your-terraform-state-bucket"
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
```

## SSL Certificate Management

### 1. Certificate Validation
```bash
# Check certificate status
aws acm describe-certificate --certificate-arn arn:aws:acm:us-east-1:123456789012:certificate/xxxxx

# List certificates
aws acm list-certificates --region us-east-1

# Delete certificate (if needed)
aws acm delete-certificate --certificate-arn arn:aws:acm:us-east-1:123456789012:certificate/xxxxx
```

### 2. Certificate Renewal
```hcl
# Auto-renewal is enabled by default
# Certificates are valid for 13 months
# AWS automatically renews 60 days before expiration
```

## Route 53 Configuration

### 1. Health Checks
```hcl
# Route 53 health check
resource "aws_route53_health_check" "app" {
  fqdn              = "${var.subdomain}.${var.domain_name}"
  port              = 443
  type              = "HTTPS"
  resource_path     = "/"
  failure_threshold = "3"
  request_interval  = "30"
  
  tags = local.common_tags
}

# Failover routing (optional)
resource "aws_route53_record" "app_failover" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "${var.subdomain}.${var.domain_name}"
  type    = "A"
  
  failover_routing_policy {
    type = "PRIMARY"
  }
  
  set_identifier = "primary"
  
  alias {
    name                   = aws_cloudfront_distribution.frontend.domain_name
    zone_id                = aws_cloudfront_distribution.frontend.hosted_zone_id
    evaluate_target_health = false
  }
  
  health_check_id = aws_route53_health_check.app.id
}
```

## CloudFront Distribution

### 1. Cache Behaviors
```hcl
# Custom cache behavior for API calls
resource "aws_cloudfront_cache_policy" "api_cache" {
  name        = "API-Cache-Policy"
  comment     = "Cache policy for API calls"
  default_ttl = 0
  max_ttl     = 0
  min_ttl     = 0
  
  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }
    headers_config {
      header_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "all"
    }
  }
}

# Custom cache behavior for static assets
resource "aws_cloudfront_cache_policy" "static_cache" {
  name        = "Static-Assets-Cache-Policy"
  comment     = "Cache policy for static assets"
  default_ttl = 31536000
  max_ttl     = 31536000
  min_ttl     = 0
  
  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }
    headers_config {
      header_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "none"
    }
  }
}
```

### 2. Lambda@Edge Functions
```hcl
# Lambda@Edge for custom headers
resource "aws_lambda_function" "custom_headers" {
  filename         = "lambda/custom-headers.zip"
  function_name    = "custom-headers-${var.environment}"
  role            = aws_iam_role.lambda_edge.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  publish         = true
  
  tags = local.common_tags
}

# Lambda@Edge association
resource "aws_cloudfront_distribution" "frontend" {
  # ... existing configuration ...
  
  default_cache_behavior {
    # ... existing configuration ...
    
    lambda_function_association {
      event_type   = "origin-response"
      lambda_arn   = "${aws_lambda_function.custom_headers.arn}:${aws_lambda_function.custom_headers.version}"
    }
  }
}
```

## Deployment Strategies

### 1. Blue-Green Deployment
```hcl
# Create two distributions
resource "aws_cloudfront_distribution" "frontend_blue" {
  # ... configuration for blue environment
}

resource "aws_cloudfront_distribution" "frontend_green" {
  # ... configuration for green environment
}

# Route 53 weighted routing
resource "aws_route53_record" "app_weighted" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "${var.subdomain}.${var.domain_name}"
  type    = "A"
  
  weighted_routing_policy {
    weight = 100
  }
  
  set_identifier = "blue"
  
  alias {
    name                   = aws_cloudfront_distribution.frontend_blue.domain_name
    zone_id                = aws_cloudfront_distribution.frontend_blue.hosted_zone_id
    evaluate_target_health = false
  }
}
```

### 2. Canary Deployment
```hcl
# Canary distribution with lower weight
resource "aws_route53_record" "app_canary" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "${var.subdomain}.${var.domain_name}"
  type    = "A"
  
  weighted_routing_policy {
    weight = 10
  }
  
  set_identifier = "canary"
  
  alias {
    name                   = aws_cloudfront_distribution.frontend_canary.domain_name
    zone_id                = aws_cloudfront_distribution.frontend_canary.hosted_zone_id
    evaluate_target_health = false
  }
}
```

## Monitoring and Troubleshooting

### 1. CloudWatch Metrics
```hcl
# CloudWatch alarms
resource "aws_cloudwatch_metric_alarm" "cloudfront_errors" {
  alarm_name          = "cloudfront-errors-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "ErrorRate"
  namespace           = "AWS/CloudFront"
  period              = "300"
  statistic           = "Average"
  threshold           = "5"
  
  dimensions = {
    DistributionId = aws_cloudfront_distribution.frontend.id
    Region         = "Global"
  }
  
  alarm_description = "CloudFront error rate is too high"
  alarm_actions    = [aws_sns_topic.alerts.arn]
}
```

### 2. Logging
```hcl
# S3 bucket for CloudFront logs
resource "aws_s3_bucket" "cloudfront_logs" {
  bucket = "${var.project_name}-${var.environment}-cloudfront-logs-${random_string.bucket_suffix.result}"
  
  tags = local.common_tags
}

# CloudFront logging configuration
resource "aws_cloudfront_distribution" "frontend" {
  # ... existing configuration ...
  
  logging_config {
    include_cookies = false
    bucket          = aws_s3_bucket.cloudfront_logs.bucket_domain_name
    prefix          = "cloudfront-logs/"
  }
}
```

### 3. Troubleshooting Commands
```bash
# Check CloudFront distribution status
aws cloudfront get-distribution --id E1234567890123

# Check S3 bucket contents
aws s3 ls s3://your-bucket-name/

# Test CloudFront endpoint
curl -I https://your-domain.com

# Check Route 53 records
aws route53 list-resource-record-sets --hosted-zone-id Z1234567890123

# Check ACM certificate
aws acm describe-certificate --certificate-arn arn:aws:acm:us-east-1:123456789012:certificate/xxxxx

# CloudFront invalidation status
aws cloudfront get-invalidation --distribution-id E1234567890123 --id I1234567890123
```

## Best Practices

### 1. Security
- Use HTTPS only (redirect HTTP to HTTPS)
- Implement proper IAM roles and policies
- Enable CloudTrail for audit logging
- Use WAF for additional protection

### 2. Performance
- Set appropriate cache TTL values
- Use compression for text-based assets
- Implement proper cache headers
- Use CloudFront edge locations strategically

### 3. Cost Optimization
- Choose appropriate CloudFront price class
- Monitor data transfer costs
- Use S3 lifecycle policies for logs
- Implement proper cache strategies

### 4. Monitoring
- Set up CloudWatch alarms
- Monitor CloudFront metrics
- Track S3 usage and costs
- Implement proper logging

### 5. Backup and Recovery
- Version S3 bucket contents
- Backup Route 53 configurations
- Document deployment procedures
- Test recovery procedures

## Conclusion

This comprehensive setup provides a production-ready frontend infrastructure with:
- **Global CDN** via CloudFront
- **Secure HTTPS** with ACM certificates
- **Reliable DNS** with Route 53
- **Scalable storage** with S3
- **Automated deployment** via Jenkins
- **Infrastructure as Code** with Terraform

The combination ensures high availability, security, and performance for your frontend applications while maintaining cost-effectiveness and operational efficiency.



