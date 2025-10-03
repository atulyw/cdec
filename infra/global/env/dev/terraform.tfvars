# Global Infrastructure - Development Environment Configuration

aws_region = "eu-north-1"

# Domain Configuration
domain_name = "chinmayeee.com"  # Replace with your actual domain
create_hosted_zone = true

# CloudFront Configuration
cloudfront_subdomain = "www"  # Will create www.myapp-dev.com

# ALB Configuration
alb_subdomain = "api"  # Will create api.myapp-dev.com

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


tags = {
  Environment = "dev"
  Project     = "global-infrastructure"
  ManagedBy   = "terraform"
  Component   = "global"
  Owner       = "devops-team"
}
