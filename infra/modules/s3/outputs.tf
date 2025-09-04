# S3 Module Outputs

output "bucket_id" {
  description = "The name of the S3 bucket"
  value       = aws_s3_bucket.website.id
}

output "bucket_arn" {
  description = "The ARN of the S3 bucket"
  value       = aws_s3_bucket.website.arn
}

output "bucket_domain_name" {
  description = "The bucket domain name"
  value       = aws_s3_bucket.website.bucket_domain_name
}

output "bucket_regional_domain_name" {
  description = "The bucket region-specific domain name"
  value       = aws_s3_bucket.website.bucket_regional_domain_name
}

output "website_endpoint" {
  description = "The website endpoint"
  value       = aws_s3_bucket_website_configuration.website.website_endpoint
}

output "website_domain" {
  description = "The website domain"
  value       = aws_s3_bucket_website_configuration.website.website_domain
}
