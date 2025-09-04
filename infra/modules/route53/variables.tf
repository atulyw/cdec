# Route 53 Module Variables

variable "domain_name" {
  description = "The domain name for the hosted zone"
  type        = string
}

variable "create_hosted_zone" {
  description = "Whether to create a new hosted zone or use existing one"
  type        = bool
  default     = true
}

# CloudFront Record Variables
variable "create_cloudfront_record" {
  description = "Whether to create a Route 53 record for CloudFront"
  type        = bool
  default     = false
}

variable "cloudfront_subdomain" {
  description = "Subdomain for CloudFront (e.g., www.example.com)"
  type        = string
  default     = ""
}

variable "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  type        = string
  default     = ""
}

variable "cloudfront_hosted_zone_id" {
  description = "CloudFront hosted zone ID"
  type        = string
  default     = "Z2FDTNDATAQYW2"  # CloudFront's hosted zone ID
}

# ALB Record Variables
variable "create_alb_record" {
  description = "Whether to create a Route 53 record for ALB"
  type        = bool
  default     = false
}

variable "alb_subdomain" {
  description = "Subdomain for ALB (e.g., api.example.com)"
  type        = string
  default     = ""
}

variable "alb_dns_name" {
  description = "ALB DNS name"
  type        = string
  default     = ""
}

variable "alb_zone_id" {
  description = "ALB zone ID"
  type        = string
  default     = ""
}

# CNAME Record Variables
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

variable "cname_ttl" {
  description = "TTL for the CNAME record"
  type        = number
  default     = 300
}

# MX Record Variables
variable "mx_records" {
  description = "List of MX records"
  type        = list(string)
  default     = []
}

variable "mx_ttl" {
  description = "TTL for MX records"
  type        = number
  default     = 300
}

# TXT Record Variables
variable "txt_records" {
  description = "List of TXT records"
  type        = list(string)
  default     = []
}

variable "txt_name" {
  description = "Name for the TXT record"
  type        = string
  default     = ""
}

variable "txt_ttl" {
  description = "TTL for TXT records"
  type        = number
  default     = 300
}

variable "tags" {
  description = "A map of tags to assign to the resources"
  type        = map(string)
  default     = {}
}
