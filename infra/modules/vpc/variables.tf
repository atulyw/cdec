# VPC Module Variables

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "vpc_name" {
  description = "Name prefix for VPC resources"
  type        = string
}

variable "public_subnet_cidrs" {
  description = "Map of availability zones to public subnet CIDR blocks"
  type        = map(string)
  default = {
    "us-west-2a" = "10.0.1.0/24"
    "us-west-2b" = "10.0.2.0/24"
  }
}

variable "private_subnet_cidrs" {
  description = "Map of availability zones to private subnet CIDR blocks"
  type        = map(string)
  default = {
    "us-west-2a" = "10.0.10.0/24"
    "us-west-2b" = "10.0.20.0/24"
  }
}

variable "availability_zones" {
  description = "List of availability zones to use"
  type        = list(string)
  default     = ["us-west-2a", "us-west-2b"]
}

variable "tags" {
  description = "A map of tags to assign to the resources"
  type        = map(string)
  default     = {}
}
