# ACM Module Variables

variable "domain_name" {
  description = "The primary domain name for the certificate"
  type        = string
}

variable "hosted_zone_id" {
  description = "The Route 53 hosted zone ID for DNS validation"
  type        = string
}

variable "create_cloudfront_certificate" {
  description = "Whether to create an ACM certificate for CloudFront (must be in us-east-1)"
  type        = bool
  default     = false
}

variable "create_alb_certificate" {
  description = "Whether to create an ACM certificate for ALB"
  type        = bool
  default     = false
}

variable "create_validation_records" {
  description = "Whether to create Route 53 validation records"
  type        = bool
  default     = true
}

variable "cloudfront_subject_alternative_names" {
  description = "List of subject alternative names for CloudFront certificate"
  type        = list(string)
  default     = []
}

variable "alb_subject_alternative_names" {
  description = "List of subject alternative names for ALB certificate"
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "A map of tags to assign to the resources"
  type        = map(string)
  default     = {}
}
