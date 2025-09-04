# Global Infrastructure Variables - Development Environment

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

# Domain Configuration
variable "domain_name" {
  description = "The primary domain name"
  type        = string
}

variable "create_hosted_zone" {
  description = "Whether to create a new hosted zone or use existing one"
  type        = bool
  default     = true
}

# CloudFront Configuration
variable "cloudfront_subdomain" {
  description = "Subdomain for CloudFront (e.g., www.example.com)"
  type        = string
  default     = ""
}

variable "cloudfront_domain_name" {
  description = "CloudFront distribution domain name (will be set later)"
  type        = string
  default     = ""
}


# ALB Configuration
variable "alb_subdomain" {
  description = "Subdomain for ALB (e.g., api.example.com)"
  type        = string
  default     = ""
}

variable "alb_dns_name" {
  description = "ALB DNS name (will be set later)"
  type        = string
  default     = ""
}


# CNAME Configuration
variable "create_cname_record" {
  description = "Whether to create a CNAME record"
  type        = bool
  default     = false
}

variable "cname_name" {
  description = "Name for the CNAME record"
  type        = string
  default     = ""
}

variable "cname_value" {
  description = "Value for the CNAME record"
  type        = string
  default     = ""
}

# MX Records for Email
variable "mx_records" {
  description = "List of MX records for email"
  type        = list(string)
  default     = []
}

# TXT Records for Domain Verification
variable "txt_records" {
  description = "List of TXT records for domain verification"
  type        = list(string)
  default     = []
}

variable "txt_name" {
  description = "Name for the TXT record"
  type        = string
  default     = ""
}


variable "tags" {
  description = "A map of tags to assign to the resources"
  type        = map(string)
  default = {
    Environment = "dev"
    Project     = "global-infrastructure"
    ManagedBy   = "terraform"
    Component   = "global"
  }
}
