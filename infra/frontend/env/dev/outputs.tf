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

# CloudFront Outputs
output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = module.cloudfront.distribution_id
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = module.cloudfront.distribution_domain_name
}

output "cloudfront_distribution_arn" {
  description = "ARN of the CloudFront distribution"
  value       = module.cloudfront.distribution_arn
}
