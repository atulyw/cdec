# Route 53 Module Outputs

output "hosted_zone_id" {
  description = "The hosted zone ID"
  value       = var.create_hosted_zone ? aws_route53_zone.main[0].zone_id : data.aws_route53_zone.existing[0].zone_id
}

output "hosted_zone_name_servers" {
  description = "The hosted zone name servers"
  value       = var.create_hosted_zone ? aws_route53_zone.main[0].name_servers : data.aws_route53_zone.existing[0].name_servers
}

output "hosted_zone_arn" {
  description = "The hosted zone ARN"
  value       = var.create_hosted_zone ? aws_route53_zone.main[0].arn : data.aws_route53_zone.existing[0].arn
}

output "domain_name" {
  description = "The domain name"
  value       = var.domain_name
}

output "cloudfront_record_name" {
  description = "The CloudFront record name"
  value       = var.create_cloudfront_record ? aws_route53_record.cloudfront[0].name : null
}

output "alb_record_name" {
  description = "The ALB record name"
  value       = var.create_alb_record ? aws_route53_record.alb[0].name : null
}

output "cname_record_name" {
  description = "The CNAME record name"
  value       = var.create_cname_record ? aws_route53_record.cname[0].name : null
}
