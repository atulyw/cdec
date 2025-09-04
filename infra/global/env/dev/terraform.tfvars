# Global Infrastructure - Development Environment Configuration

aws_region = "us-west-2"

# Domain Configuration
domain_name = "example.com"  # Replace with your actual domain
create_hosted_zone = true

# CloudFront Configuration
cloudfront_subdomain = "www"  # Will create www.example.com
create_cloudfront_certificate = true
cloudfront_subject_alternative_names = ["example.com", "www.example.com"]

# ALB Configuration
alb_subdomain = "api"  # Will create api.example.com
create_alb_certificate = true
alb_subject_alternative_names = ["api.example.com"]

# CNAME Configuration (optional)
create_cname_record = false
# cname_name = "blog"
# cname_value = "ghs.googlehosted.com"

# MX Records for Email (optional)
mx_records = []
# mx_records = ["10 mail.example.com"]

# TXT Records for Domain Verification (optional)
txt_records = []
txt_name = ""

# Certificate Validation
create_validation_records = true

tags = {
  Environment = "dev"
  Project     = "global-infrastructure"
  ManagedBy   = "terraform"
  Component   = "global"
  Owner       = "devops-team"
}
