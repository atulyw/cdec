# Frontend Infrastructure Outputs - Development Environment

# S3 Outputs
output "s3_bucket_name" {
  description = "Name of the S3 bucket"
  value       = module.s3.bucket_id
}

output "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = module.s3.bucket_arn
}

output "s3_website_endpoint" {
  description = "Website endpoint of the S3 bucket"
  value       = module.s3.website_endpoint
}

# CloudFront Outputs (conditional)
output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = var.enable_cloudfront ? module.cloudfront[0].distribution_id : null
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = var.enable_cloudfront ? module.cloudfront[0].distribution_domain_name : null
}

output "cloudfront_distribution_arn" {
  description = "ARN of the CloudFront distribution"
  value       = var.enable_cloudfront ? module.cloudfront[0].distribution_arn : null
}
