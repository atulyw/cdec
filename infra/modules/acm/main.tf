# ACM Module - SSL Certificate Management

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
      configuration_aliases = [aws.us_east_1]
    }
  }
}

# ACM Certificate for CloudFront (must be in us-east-1)
resource "aws_acm_certificate" "cloudfront" {
  count = var.create_cloudfront_certificate ? 1 : 0

  provider = aws.us_east_1

  domain_name               = var.domain_name
  subject_alternative_names = var.cloudfront_subject_alternative_names
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.domain_name}-cloudfront"
      Type = "cloudfront-certificate"
    }
  )
}

# ACM Certificate for ALB (can be in any region)
resource "aws_acm_certificate" "alb" {
  count = var.create_alb_certificate ? 1 : 0

  domain_name               = var.domain_name
  subject_alternative_names = var.alb_subject_alternative_names
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.domain_name}-alb"
      Type = "alb-certificate"
    }
  )
}

# Route 53 validation records for CloudFront certificate
resource "aws_route53_record" "cloudfront_validation" {
  for_each = var.create_cloudfront_certificate && var.create_validation_records ? {
    for dvo in aws_acm_certificate.cloudfront[0].domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  } : {}

  provider = aws.us_east_1

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = var.hosted_zone_id
}

# Route 53 validation records for ALB certificate
resource "aws_route53_record" "alb_validation" {
  for_each = var.create_alb_certificate && var.create_validation_records ? {
    for dvo in aws_acm_certificate.alb[0].domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  } : {}

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = var.hosted_zone_id
}

# Certificate validation for CloudFront
resource "aws_acm_certificate_validation" "cloudfront" {
  count = var.create_cloudfront_certificate && var.create_validation_records ? 1 : 0

  provider = aws.us_east_1

  certificate_arn         = aws_acm_certificate.cloudfront[0].arn
  validation_record_fqdns = [for record in aws_route53_record.cloudfront_validation : record.fqdn]

  timeouts {
    create = "10m"
  }
}

# Certificate validation for ALB
resource "aws_acm_certificate_validation" "alb" {
  count = var.create_alb_certificate && var.create_validation_records ? 1 : 0

  certificate_arn         = aws_acm_certificate.alb[0].arn
  validation_record_fqdns = [for record in aws_route53_record.alb_validation : record.fqdn]

  timeouts {
    create = "10m"
  }
}
