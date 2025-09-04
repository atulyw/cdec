# Route 53 Module - DNS Management

# Hosted Zone
resource "aws_route53_zone" "main" {
  count = var.create_hosted_zone ? 1 : 0
  
  name = var.domain_name

  tags = merge(
    var.tags,
    {
      Name = var.domain_name
      Type = "hosted-zone"
    }
  )
}

# Data source for existing hosted zone
data "aws_route53_zone" "existing" {
  count = var.create_hosted_zone ? 0 : 1
  name  = var.domain_name
}

# A Record for CloudFront Distribution
resource "aws_route53_record" "cloudfront" {
  count = var.create_cloudfront_record ? 1 : 0

  zone_id = var.create_hosted_zone ? aws_route53_zone.main[0].zone_id : data.aws_route53_zone.existing[0].zone_id
  name    = var.cloudfront_subdomain
  type    = "A"

  alias {
    name                   = var.cloudfront_domain_name
    zone_id                = var.cloudfront_hosted_zone_id
    evaluate_target_health = false
  }
}

# A Record for ALB
resource "aws_route53_record" "alb" {
  count = var.create_alb_record ? 1 : 0

  zone_id = var.create_hosted_zone ? aws_route53_zone.main[0].zone_id : data.aws_route53_zone.existing[0].zone_id
  name    = var.alb_subdomain
  type    = "A"

  alias {
    name                   = var.alb_dns_name
    zone_id                = var.alb_zone_id
    evaluate_target_health = true
  }
}

# CNAME Record (alternative to A record)
resource "aws_route53_record" "cname" {
  count = var.create_cname_record ? 1 : 0

  zone_id = var.create_hosted_zone ? aws_route53_zone.main[0].zone_id : data.aws_route53_zone.existing[0].zone_id
  name    = var.cname_name
  type    = "CNAME"
  ttl     = var.cname_ttl
  records = [var.cname_value]
}

# MX Record for email
resource "aws_route53_record" "mx" {
  count = length(var.mx_records) > 0 ? 1 : 0

  zone_id = var.create_hosted_zone ? aws_route53_zone.main[0].zone_id : data.aws_route53_zone.existing[0].zone_id
  name    = var.domain_name
  type    = "MX"
  ttl     = var.mx_ttl
  records = var.mx_records
}

# TXT Record (for domain verification, SPF, etc.)
resource "aws_route53_record" "txt" {
  count = length(var.txt_records) > 0 ? 1 : 0

  zone_id = var.create_hosted_zone ? aws_route53_zone.main[0].zone_id : data.aws_route53_zone.existing[0].zone_id
  name    = var.txt_name
  type    = "TXT"
  ttl     = var.txt_ttl
  records = var.txt_records
}
