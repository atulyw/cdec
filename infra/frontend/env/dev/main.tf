# Frontend Infrastructure - Development Environment
# This module deploys frontend-specific infrastructure for the dev environment

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# S3 Bucket for Static Website Hosting
module "s3" {
  source = "../../../modules/s3"

  bucket_name                    = var.s3_bucket_name
  enable_versioning              = var.s3_enable_versioning
  cloudfront_distribution_arn    = var.enable_cloudfront ? module.cloudfront[0].distribution_arn : null

  tags = merge(
    var.tags,
    {
      Environment = "dev"
      Component   = "frontend"
      Purpose     = "static-website"
    }
  )
}

# CloudFront Distribution (conditional)
module "cloudfront" {
  count  = var.enable_cloudfront ? 1 : 0
  source = "../../../modules/cloudfront"

  distribution_name                    = var.cloudfront_distribution_name
  s3_bucket_name                      = module.s3.bucket_id
  s3_bucket_regional_domain_name      = module.s3.bucket_regional_domain_name
  comment                             = var.cloudfront_comment
  price_class                         = var.cloudfront_price_class

  tags = merge(
    var.tags,
    {
      Environment = "dev"
      Component   = "frontend"
      Purpose     = "cdn"
    }
  )
}
