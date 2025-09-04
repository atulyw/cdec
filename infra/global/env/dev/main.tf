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

