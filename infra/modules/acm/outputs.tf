# ACM Module Outputs

output "cloudfront_certificate_arn" {
  description = "The ARN of the CloudFront certificate"
  value       = var.create_cloudfront_certificate ? aws_acm_certificate.cloudfront[0].arn : null
}

output "cloudfront_certificate_domain_name" {
  description = "The domain name of the CloudFront certificate"
  value       = var.create_cloudfront_certificate ? aws_acm_certificate.cloudfront[0].domain_name : null
}

output "cloudfront_certificate_status" {
  description = "The status of the CloudFront certificate"
  value       = var.create_cloudfront_certificate ? aws_acm_certificate.cloudfront[0].status : null
}

output "cloudfront_certificate_validation_status" {
  description = "The validation status of the CloudFront certificate"
  value       = var.create_cloudfront_certificate && var.create_validation_records ? aws_acm_certificate_validation.cloudfront[0].id : null
}

output "alb_certificate_arn" {
  description = "The ARN of the ALB certificate"
  value       = var.create_alb_certificate ? aws_acm_certificate.alb[0].arn : null
}

output "alb_certificate_domain_name" {
  description = "The domain name of the ALB certificate"
  value       = var.create_alb_certificate ? aws_acm_certificate.alb[0].domain_name : null
}

output "alb_certificate_status" {
  description = "The status of the ALB certificate"
  value       = var.create_alb_certificate ? aws_acm_certificate.alb[0].status : null
}

output "alb_certificate_validation_status" {
  description = "The validation status of the ALB certificate"
  value       = var.create_alb_certificate && var.create_validation_records ? aws_acm_certificate_validation.alb[0].id : null
}
