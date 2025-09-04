# CloudFront Module Outputs

output "distribution_id" {
  description = "The identifier for the distribution"
  value       = aws_cloudfront_distribution.main.id
}

output "distribution_arn" {
  description = "The ARN (Amazon Resource Name) for the distribution"
  value       = aws_cloudfront_distribution.main.arn
}

output "distribution_domain_name" {
  description = "The domain name corresponding to the distribution"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "distribution_hosted_zone_id" {
  description = "The CloudFront Route 53 zone ID"
  value       = aws_cloudfront_distribution.main.hosted_zone_id
}

output "distribution_status" {
  description = "The current status of the distribution"
  value       = aws_cloudfront_distribution.main.status
}

output "distribution_etag" {
  description = "The current version of the distribution's configuration"
  value       = aws_cloudfront_distribution.main.etag
}

output "origin_access_control_id" {
  description = "The ID of the origin access control"
  value       = aws_cloudfront_origin_access_control.s3_oac.id
}
