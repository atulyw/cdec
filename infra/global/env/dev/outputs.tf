# Global Infrastructure Outputs - Development Environment

# Route 53 Outputs
output "hosted_zone_id" {
  description = "The hosted zone ID"
  value       = module.route53.hosted_zone_id
}

output "hosted_zone_name_servers" {
  description = "The hosted zone name servers"
  value       = module.route53.hosted_zone_name_servers
}

output "domain_name" {
  description = "The domain name"
  value       = module.route53.domain_name
}

# ACM Certificate Outputs
output "cloudfront_certificate_arn" {
  description = "The ARN of the CloudFront certificate"
  value       = module.acm.cloudfront_certificate_arn
}

output "cloudfront_certificate_domain_name" {
  description = "The domain name of the CloudFront certificate"
  value       = module.acm.cloudfront_certificate_domain_name
}

output "alb_certificate_arn" {
  description = "The ARN of the ALB certificate"
  value       = module.acm.alb_certificate_arn
}

output "alb_certificate_domain_name" {
  description = "The domain name of the ALB certificate"
  value       = module.acm.alb_certificate_domain_name
}
