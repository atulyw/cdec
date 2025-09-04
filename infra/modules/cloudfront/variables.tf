# CloudFront Module Variables

variable "distribution_name" {
  description = "Name of the CloudFront distribution"
  type        = string
}

variable "s3_bucket_name" {
  description = "Name of the S3 bucket"
  type        = string
}

variable "s3_bucket_regional_domain_name" {
  description = "Regional domain name of the S3 bucket"
  type        = string
}

variable "comment" {
  description = "Comment for the CloudFront distribution"
  type        = string
  default     = "CloudFront distribution for static website"
}

variable "default_root_object" {
  description = "The object that you want CloudFront to return when an end user requests the root URL"
  type        = string
  default     = "index.html"
}

variable "price_class" {
  description = "The price class for this distribution"
  type        = string
  default     = "PriceClass_100"
  validation {
    condition = contains([
      "PriceClass_All",
      "PriceClass_200", 
      "PriceClass_100"
    ], var.price_class)
    error_message = "Price class must be one of: PriceClass_All, PriceClass_200, PriceClass_100."
  }
}

variable "tags" {
  description = "A map of tags to assign to the resources"
  type        = map(string)
  default     = {}
}
