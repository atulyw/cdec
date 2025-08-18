# Terraform Modules Complete Guide

This guide covers Terraform modules with practical examples, best practices, and function usage within modules.

## What are Terraform Modules?

Terraform modules are reusable, self-contained packages of Terraform configurations that manage a specific set of resources. They allow you to:
- **Reuse code** across different projects
- **Standardize infrastructure** patterns
- **Maintain consistency** across environments
- **Reduce duplication** and improve maintainability

## Module Structure

A typical Terraform module has the following structure:

```
module-name/
├── main.tf          # Main resource definitions
├── variables.tf     # Input variables
├── outputs.tf       # Output values
├── versions.tf      # Provider and Terraform version constraints
├── README.md        # Documentation
└── examples/        # Usage examples
    └── basic/
        └── main.tf
```

## VPC Module Example

Let's create a comprehensive VPC module that demonstrates various Terraform functions and best practices.

### 1. Module Directory Structure

```
vpc-module/
├── main.tf
├── variables.tf
├── outputs.tf
├── versions.tf
├── locals.tf
├── data.tf
├── README.md
└── examples/
    ├── basic/
    │   └── main.tf
    └── multi-az/
        └── main.tf
```

### 2. variables.tf - Input Variables

```hcl
# vpc-module/variables.tf

variable "project_name" {
  description = "Name of the project"
  type        = string
  validation {
    condition     = length(var.project_name) >= 3
    error_message = "Project name must be at least 3 characters long."
  }
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))
    error_message = "Must be a valid CIDR block."
  }
}

variable "azs" {
  description = "Availability zones"
  type        = list(string)
  default     = ["us-west-2a", "us-west-2b", "us-west-2c"]
}

variable "public_subnets" {
  description = "Public subnet CIDR blocks"
  type        = list(string)
  default     = []
}

variable "private_subnets" {
  description = "Private subnet CIDR blocks"
  type        = list(string)
  default     = []
}

variable "enable_nat_gateway" {
  description = "Enable NAT Gateway for private subnets"
  type        = bool
  default     = true
}

variable "enable_vpn_gateway" {
  description = "Enable VPN Gateway"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Additional tags for all resources"
  type        = map(string)
  default     = {}
}

variable "enable_flow_log" {
  description = "Enable VPC Flow Logs"
  type        = bool
  default     = false
}

variable "flow_log_retention_days" {
  description = "VPC Flow Log retention in days"
  type        = number
  default     = 7
  validation {
    condition     = var.flow_log_retention_days >= 1 && var.flow_log_retention_days <= 365
    error_message = "Flow log retention must be between 1 and 365 days."
  }
}
```

### 3. locals.tf - Local Values with Functions

```hcl
# vpc-module/locals.tf

locals {
  # Using format() function for consistent naming
  name_prefix = format("%s-%s", var.project_name, var.environment)
  
  # Using lower() function for normalized names
  normalized_name = lower(local.name_prefix)
  
  # Using replace() function to clean names for AWS resources
  clean_name = replace(local.normalized_name, "/[^a-zA-Z0-9-]/", "-")
  
  # Using timestamp() and formatdate() functions for deployment tracking
  deployment_time = timestamp()
  deployment_date = formatdate("YYYY-MM-DD", local.deployment_time)
  
  # Using coalesce() function for fallback values
  default_public_subnets = coalescelist(
    var.public_subnets,
    [
      cidrsubnet(var.vpc_cidr, 8, 1),
      cidrsubnet(var.vpc_cidr, 8, 2),
      cidrsubnet(var.vpc_cidr, 8, 3)
    ]
  )
  
  default_private_subnets = coalescelist(
    var.private_subnets,
    [
      cidrsubnet(var.vpc_cidr, 8, 10),
      cidrsubnet(var.vpc_cidr, 8, 11),
      cidrsubnet(var.vpc_cidr, 8, 12)
    ]
  )
  
  # Using length() function to determine subnet count
  public_subnet_count  = length(local.default_public_subnets)
  private_subnet_count = length(local.default_private_subnets)
  
  # Using min() function to limit NAT Gateway count
  nat_gateway_count = min(local.public_subnet_count, 3)
  
  # Using zipmap() function to create AZ to subnet mapping
  az_to_public_subnet = zipmap(
    slice(var.azs, 0, local.public_subnet_count),
    local.default_public_subnets
  )
  
  az_to_private_subnet = zipmap(
    slice(var.azs, 0, local.private_subnet_count),
    local.default_private_subnets
  )
  
  # Using merge() function to combine tags
  common_tags = merge(
    var.tags,
    {
      Name        = local.clean_name
      Environment = var.environment
      Project     = var.project_name
      ManagedBy   = "terraform"
      DeployedAt  = local.deployment_date
    }
  )
  
  # Using distinct() function to get unique AZs
  unique_azs = distinct(var.azs)
  
  # Using sort() function for consistent ordering
  sorted_azs = sort(local.unique_azs)
  
  # Using concat() function to combine all subnets
  all_subnets = concat(local.default_public_subnets, local.default_private_subnets)
  
  # Using flatten() function for nested lists
  subnet_configs = flatten([
    for az in local.sorted_azs : [
      for i, subnet in local.default_public_subnets : {
        az    = az
        cidr  = subnet
        type  = "public"
        index = i
      } if i < length(local.sorted_azs)
    ]
  ])
  
  # Using lookup() function for environment-specific configurations
  env_configs = {
    dev = {
      instance_type = "t3.micro"
      max_size      = 2
    }
    staging = {
      instance_type = "t3.small"
      max_size      = 3
    }
    prod = {
      instance_type = "t3.medium"
      max_size      = 5
    }
  }
  
  current_env_config = lookup(local.env_configs, var.environment, local.env_configs.dev)
}
```

### 4. main.tf - Main Resources

```hcl
# vpc-module/main.tf

# VPC Resource
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = merge(local.common_tags, {
    Name = format("%s-vpc", local.clean_name)
  })
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  
  tags = merge(local.common_tags, {
    Name = format("%s-igw", local.clean_name)
  })
}

# Public Subnets using for_each with functions
resource "aws_subnet" "public" {
  for_each = local.az_to_public_subnet
  
  vpc_id                  = aws_vpc.main.id
  cidr_block              = each.value
  availability_zone       = each.key
  map_public_ip_on_launch = true
  
  tags = merge(local.common_tags, {
    Name = format("%s-public-%s", local.clean_name, substr(each.key, -1, 1))
    Type = "public"
  })
}

# Private Subnets
resource "aws_subnet" "private" {
  for_each = local.az_to_private_subnet
  
  vpc_id            = aws_vpc.main.id
  cidr_block        = each.value
  availability_zone = each.key
  
  tags = merge(local.common_tags, {
    Name = format("%s-private-%s", local.clean_name, substr(each.key, -1, 1))
    Type = "private"
  })
}

# Route Table for Public Subnets
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  
  tags = merge(local.common_tags, {
    Name = format("%s-public-rt", local.clean_name)
  })
}

# Route Table Association for Public Subnets
resource "aws_route_table_association" "public" {
  for_each = aws_subnet.public
  
  subnet_id      = each.value.id
  route_table_id = aws_route_table.public.id
}

# Elastic IPs for NAT Gateways
resource "aws_eip" "nat" {
  count = var.enable_nat_gateway ? local.nat_gateway_count : 0
  
  domain = "vpc"
  
  tags = merge(local.common_tags, {
    Name = format("%s-nat-eip-%d", local.clean_name, count.index + 1)
  })
}

# NAT Gateways
resource "aws_nat_gateway" "main" {
  count = var.enable_nat_gateway ? local.nat_gateway_count : 0
  
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = values(aws_subnet.public)[count.index].id
  
  tags = merge(local.common_tags, {
    Name = format("%s-nat-%d", local.clean_name, count.index + 1)
  })
  
  depends_on = [aws_internet_gateway.main]
}

# Route Table for Private Subnets
resource "aws_route_table" "private" {
  count = var.enable_nat_gateway ? 1 : 0
  
  vpc_id = aws_vpc.main.id
  
  dynamic "route" {
    for_each = aws_nat_gateway.main
    content {
      cidr_block     = "0.0.0.0/0"
      nat_gateway_id = route.value.id
    }
  }
  
  tags = merge(local.common_tags, {
    Name = format("%s-private-rt", local.clean_name)
  })
}

# Route Table Association for Private Subnets
resource "aws_route_table_association" "private" {
  count = var.enable_nat_gateway ? length(aws_subnet.private) : 0
  
  subnet_id      = values(aws_subnet.private)[count.index].id
  route_table_id = aws_route_table.private[0].id
}

# VPC Flow Logs (Conditional)
resource "aws_flow_log" "main" {
  count = var.enable_flow_log ? 1 : 0
  
  vpc_id = aws_vpc.main.id
  
  log_destination_type = "cloud-watch-logs"
  log_group_name       = format("/aws/vpc/%s", local.clean_name)
  
  traffic_type = "ALL"
  
  tags = merge(local.common_tags, {
    Name = format("%s-flow-log", local.clean_name)
  })
}

# CloudWatch Log Group for Flow Logs
resource "aws_cloudwatch_log_group" "flow_log" {
  count = var.enable_flow_log ? 1 : 0
  
  name              = format("/aws/vpc/%s", local.clean_name)
  retention_in_days = var.flow_log_retention_days
  
  tags = merge(local.common_tags, {
    Name = format("%s-flow-log-group", local.clean_name)
  })
}

# IAM Role for Flow Logs
resource "aws_iam_role" "flow_log" {
  count = var.enable_flow_log ? 1 : 0
  
  name = format("%s-flow-log-role", local.clean_name)
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "vpc-flow-logs.amazonaws.com"
        }
      }
    ]
  })
  
  tags = local.common_tags
}

# IAM Role Policy for Flow Logs
resource "aws_iam_role_policy" "flow_log" {
  count = var.enable_flow_log ? 1 : 0
  
  name = format("%s-flow-log-policy", local.clean_name)
  role = aws_iam_role.flow_log[0].id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams"
        ]
        Resource = "*"
      }
    ]
  })
}
```

### 5. outputs.tf - Output Values

```hcl
# vpc-module/outputs.tf

output "vpc_id" {
  description = "The ID of the VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr_block" {
  description = "The CIDR block of the VPC"
  value       = aws_vpc.main.cidr_block
}

output "vpc_arn" {
  description = "The ARN of the VPC"
  value       = aws_vpc.main.arn
}

output "public_subnet_ids" {
  description = "List of IDs of public subnets"
  value       = values(aws_subnet.public)[*].id
}

output "private_subnet_ids" {
  description = "List of IDs of private subnets"
  value       = values(aws_subnet.private)[*].id
}

output "public_subnet_cidrs" {
  description = "List of CIDR blocks of public subnets"
  value       = values(aws_subnet.public)[*].cidr_block
}

output "private_subnet_cidrs" {
  description = "List of CIDR blocks of private subnets"
  value       = values(aws_subnet.private)[*].cidr_block
}

output "public_route_table_id" {
  description = "ID of public route table"
  value       = aws_route_table.public.id
}

output "private_route_table_ids" {
  description = "List of IDs of private route tables"
  value       = var.enable_nat_gateway ? [aws_route_table.private[0].id] : []
}

output "nat_gateway_ids" {
  description = "List of NAT Gateway IDs"
  value       = var.enable_nat_gateway ? aws_nat_gateway.main[*].id : []
}

output "nat_gateway_public_ips" {
  description = "List of public IPs of NAT Gateways"
  value       = var.enable_nat_gateway ? aws_eip.nat[*].public_ip : []
}

output "internet_gateway_id" {
  description = "ID of Internet Gateway"
  value       = aws_internet_gateway.main.id
}

output "availability_zones" {
  description = "List of availability zones used"
  value       = local.sorted_azs
}

output "subnet_az_mapping" {
  description = "Mapping of subnets to availability zones"
  value = {
    public = local.az_to_public_subnet
    private = local.az_to_private_subnet
  }
}

output "tags" {
  description = "Common tags applied to all resources"
  value       = local.common_tags
}

output "flow_log_group_name" {
  description = "Name of the CloudWatch Log Group for VPC Flow Logs"
  value       = var.enable_flow_log ? aws_cloudwatch_log_group.flow_log[0].name : null
}

output "flow_log_role_arn" {
  description = "ARN of the IAM role for VPC Flow Logs"
  value       = var.enable_flow_log ? aws_iam_role.flow_log[0].arn : null
}
```

### 6. versions.tf - Version Constraints

```hcl
# vpc-module/versions.tf

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
```

### 7. data.tf - Data Sources

```hcl
# vpc-module/data.tf

# Get current AWS region
data "aws_region" "current" {}

# Get current AWS account ID
data "aws_caller_identity" "current" {}

# Get default VPC (for reference)
data "aws_vpc" "default" {
  default = true
}

# Get available availability zones
data "aws_availability_zones" "available" {
  state = "available"
  
  # Using filter() function to exclude certain AZs if needed
  filter {
    name   = "opt-in-status"
    values = ["opt-in-not-required"]
  }
}
```

## Module Usage Examples

### Basic Usage Example

```hcl
# examples/basic/main.tf

module "vpc" {
  source = "../../"
  
  project_name = "my-web-app"
  environment  = "dev"
  vpc_cidr     = "10.0.0.0/16"
  
  azs = ["us-west-2a", "us-west-2b"]
  
  enable_nat_gateway = true
  enable_flow_log    = true
  
  tags = {
    Owner       = "DevOps Team"
    CostCenter  = "IT-001"
    Application = "Web Application"
  }
}

# Output the VPC ID
output "vpc_id" {
  value = module.vpc.vpc_id
}

# Output public subnet IDs
output "public_subnet_ids" {
  value = module.vpc.public_subnet_ids
}
```

### Multi-AZ Production Example

```hcl
# examples/multi-az/main.tf

module "vpc" {
  source = "../../"
  
  project_name = "production-app"
  environment  = "prod"
  vpc_cidr     = "172.16.0.0/16"
  
  # Using all available AZs
  azs = ["us-west-2a", "us-west-2b", "us-west-2c"]
  
  # Custom subnet CIDRs
  public_subnets = [
    "172.16.1.0/24",
    "172.16.2.0/24",
    "172.16.3.0/24"
  ]
  
  private_subnets = [
    "172.16.10.0/24",
    "172.16.11.0/24",
    "172.16.12.0/24"
  ]
  
  enable_nat_gateway = true
  enable_vpn_gateway = true
  enable_flow_log    = true
  
  flow_log_retention_days = 30
  
  tags = {
    Environment = "production"
    Owner       = "Platform Team"
    CostCenter  = "IT-002"
    Application = "Production Application"
    Backup      = "true"
  }
}

# EC2 Instance in public subnet
resource "aws_instance" "web" {
  ami           = "ami-12345678"
  instance_type = "t3.micro"
  subnet_id     = module.vpc.public_subnet_ids[0]
  
  tags = merge(module.vpc.tags, {
    Name = "web-server"
  })
}

# RDS Instance in private subnet
resource "aws_db_instance" "main" {
  allocated_storage = 20
  engine            = "postgres"
  instance_class    = "db.t3.micro"
  subnet_group_name = aws_db_subnet_group.main.name
  
  tags = module.vpc.tags
}

# DB Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "main"
  subnet_ids = module.vpc.private_subnet_ids
  
  tags = module.vpc.tags
}
```

## Module Best Practices

### 1. Variable Validation
```hcl
variable "instance_count" {
  description = "Number of instances"
  type        = number
  default     = 1
  
  validation {
    condition     = var.instance_count > 0 && var.instance_count <= 10
    error_message = "Instance count must be between 1 and 10."
  }
}
```

### 2. Conditional Resources
```hcl
resource "aws_nat_gateway" "main" {
  count = var.enable_nat_gateway ? 1 : 0
  
  allocation_id = aws_eip.nat[0].id
  subnet_id     = aws_subnet.public[0].id
}
```

### 3. Dynamic Blocks
```hcl
resource "aws_security_group" "main" {
  name = "main"
  
  dynamic "ingress" {
    for_each = var.allowed_ports
    content {
      from_port   = ingress.value
      to_port     = ingress.value
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }
}
```

### 4. Data Source Usage
```hcl
data "aws_ami" "latest" {
  most_recent = true
  owners      = ["amazon"]
  
  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}
```

### 5. Output Filtering
```hcl
output "public_subnet_ids" {
  description = "List of public subnet IDs"
  value       = aws_subnet.public[*].id
  sensitive   = false
}
```

## Advanced Function Usage in Modules

### 1. Complex Data Transformation
```hcl
locals {
  # Using flatten() and for expressions
  subnet_configs = flatten([
    for az in var.availability_zones : [
      for i, cidr in var.subnet_cidrs : {
        az    = az
        cidr  = cidr
        name  = format("%s-subnet-%s-%d", var.name, az, i)
      }
    ]
  ])
  
  # Using merge() with dynamic content
  all_tags = merge(
    var.tags,
    {
      Module    = "vpc"
      Version   = "1.0.0"
      Timestamp = timestamp()
    }
  )
}
```

### 2. Conditional Logic with Functions
```hcl
locals {
  # Using coalesce() for fallback values
  final_subnet_count = coalesce(var.subnet_count, length(var.availability_zones))
  
  # Using lookup() for environment-specific values
  env_configs = {
    dev = { instance_type = "t3.micro", max_size = 2 }
    prod = { instance_type = "t3.large", max_size = 10 }
  }
  
  current_config = lookup(local.env_configs, var.environment, local.env_configs.dev)
}
```

### 3. String Manipulation
```hcl
locals {
  # Using format() for consistent naming
  resource_name = format("%s-%s-%s", var.project, var.environment, var.name)
  
  # Using replace() for AWS-compatible names
  aws_name = replace(local.resource_name, "/[^a-zA-Z0-9-]/", "-")
  
  # Using substr() for short names
  short_name = substr(local.aws_name, 0, 32)
}
```

## Module Testing and Validation

### 1. Input Validation
```hcl
variable "cidr_block" {
  description = "CIDR block for VPC"
  type        = string
  
  validation {
    condition     = can(cidrhost(var.cidr_block, 0))
    error_message = "Must be a valid CIDR block."
  }
}
```

### 2. Output Validation
```hcl
output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
  
  # Post-condition validation
  precondition {
    condition     = can(regex("^vpc-", aws_vpc.main.id))
    error_message = "VPC ID must start with 'vpc-'."
  }
}
```

## Module Documentation

### README.md Template
```markdown
# VPC Module

This module creates a VPC with public and private subnets, NAT Gateway, and optional VPN Gateway.

## Usage

```hcl
module "vpc" {
  source = "./modules/vpc"
  
  project_name = "my-app"
  environment  = "prod"
  vpc_cidr     = "10.0.0.0/16"
}
```

## Requirements

| Name | Version |
|------|---------|
| terraform | >= 1.0 |
| aws | ~> 5.0 |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| project_name | Name of the project | `string` | n/a | yes |
| environment | Environment name | `string` | `"dev"` | no |
| vpc_cidr | CIDR block for VPC | `string` | `"10.0.0.0/16"` | no |

## Outputs

| Name | Description |
|------|-------------|
| vpc_id | The ID of the VPC |
| public_subnet_ids | List of public subnet IDs |
| private_subnet_ids | List of private subnet IDs |
```

This comprehensive guide demonstrates how to create robust, reusable Terraform modules with proper function usage, validation, and documentation.
