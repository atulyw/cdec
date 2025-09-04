# Global Infrastructure - Development Environment
# This module deploys global/shared infrastructure for the dev environment

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Default AWS provider
provider "aws" {
  region = var.aws_region
}

# AWS provider for us-east-1 (required for CloudFront certificates)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

# Route 53 Hosted Zone
module "route53" {
  source = "../../../modules/route53"

  domain_name         = var.domain_name
  create_hosted_zone  = var.create_hosted_zone

  # CloudFront DNS records (will be configured later)
  create_cloudfront_record = false
  cloudfront_subdomain     = var.cloudfront_subdomain
  cloudfront_domain_name   = var.cloudfront_domain_name

  # ALB DNS records (will be configured later)
  create_alb_record = false
  alb_subdomain     = var.alb_subdomain
  alb_dns_name      = var.alb_dns_name

  # Additional DNS records
  create_cname_record = var.create_cname_record
  cname_name          = var.cname_name
  cname_value         = var.cname_value

  # MX records for email
  mx_records = var.mx_records

  # TXT records for domain verification
  txt_records = var.txt_records
  txt_name    = var.txt_name

  tags = merge(
    var.tags,
    {
      Environment = "dev"
      Component   = "global"
      Purpose     = "dns"
    }
  )
}

# ACM Certificates
module "acm" {
  source = "../../../modules/acm"

  domain_name     = var.domain_name
  hosted_zone_id  = module.route53.hosted_zone_id

  # CloudFront certificate (must be in us-east-1)
  create_cloudfront_certificate        = var.create_cloudfront_certificate
  cloudfront_subject_alternative_names = var.cloudfront_subject_alternative_names

  # ALB certificate
  create_alb_certificate        = var.create_alb_certificate
  alb_subject_alternative_names = var.alb_subject_alternative_names

  # Validation
  create_validation_records = var.create_validation_records

  tags = merge(
    var.tags,
    {
      Environment = "dev"
      Component   = "global"
      Purpose     = "ssl"
    }
  )
}
