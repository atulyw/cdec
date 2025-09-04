# Terraform Backend Infrastructure Variables

variable "aws_region" {
  description = "AWS region for the backend infrastructure"
  type        = string
  default     = "us-west-2"
}

variable "state_bucket_name" {
  description = "Name of the S3 bucket for Terraform state"
  type        = string
  default     = "terraform-state-bucket"
}

variable "dynamodb_table_name" {
  description = "Name of the DynamoDB table for state locking"
  type        = string
  default     = "terraform-state-lock"
}

variable "tags" {
  description = "A map of tags to assign to the resources"
  type        = map(string)
  default = {
    Project     = "terraform-backend"
    ManagedBy   = "terraform"
    Environment = "shared"
  }
}
