# Frontend Infrastructure - Development Environment Configuration

aws_region = "eu-west-1"

# S3 Configuration
s3_bucket_name     = "frontend-dev-website"
s3_enable_versioning = true

# CloudFront Configuration
cloudfront_distribution_name = "frontend-dev-distribution"
cloudfront_comment          = "CloudFront distribution for frontend dev environment"
cloudfront_price_class      = "PriceClass_100"  # Use PriceClass_All for production

tags = {
  Environment = "dev"
  Project     = "frontend-infrastructure"
  ManagedBy   = "terraform"
  Component   = "frontend"
  Owner       = "devops-team"
}
