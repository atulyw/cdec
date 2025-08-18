# Terraform AWS VPC Functions and Constructs - Complete Reference

## Table of Contents
1. [Terraform Configuration Blocks](#terraform-configuration-blocks)
2. [Provider Configuration](#provider-configuration)
3. [Resource Blocks](#resource-blocks)
4. [Data Sources](#data-sources)
5. [Variable Blocks](#variable-blocks)
6. [Output Blocks](#output-blocks)
7. [Local Values](#local-values)
8. [Module Blocks](#module-blocks)
9. [Built-in Functions](#built-in-functions)
10. [Advanced Constructs](#advanced-constructs)
11. [Best Practices](#best-practices)

---

## Terraform Configuration Blocks

### 1. Terraform Block
**Purpose**: Configure Terraform behavior and requirements

```hcl
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
  
  backend "s3" {
    bucket = "my-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-west-2"
  }
}
```

**Key Functions**:
- `required_version`: Specifies minimum Terraform version
- `required_providers`: Declares provider dependencies
- `backend`: Configures state storage backend

---

## Provider Configuration

### 2. Provider Block
**Purpose**: Configure provider settings and authentication

```hcl
provider "aws" {
  region = "us-west-2"
  profile = "default"
  
  default_tags {
    tags = {
      Environment = "Production"
      ManagedBy   = "Terraform"
    }
  }
}
```

**Key Functions**:
- `region`: Specifies AWS region
- `profile`: Uses named AWS profile
- `default_tags`: Sets default tags for all resources

---

## Resource Blocks

### 3. VPC Resources

#### aws_vpc
```hcl
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "Main VPC"
  }
}
```

#### aws_subnet
```hcl
resource "aws_subnet" "public" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-west-2a"
  
  map_public_ip_on_launch = true
  
  tags = {
    Name = "Public Subnet"
  }
}
```

#### aws_internet_gateway
```hcl
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  
  tags = {
    Name = "Main IGW"
  }
}
```

#### aws_route_table
```hcl
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  
  tags = {
    Name = "Public Route Table"
  }
}
```

#### aws_route_table_association
```hcl
resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}
```

#### aws_security_group
```hcl
resource "aws_security_group" "web" {
  name        = "web-sg"
  description = "Security group for web servers"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "Web Security Group"
  }
}
```

#### aws_nat_gateway
```hcl
resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public.id
  
  tags = {
    Name = "Main NAT Gateway"
  }
}
```

#### aws_eip
```hcl
resource "aws_eip" "nat" {
  domain = "vpc"
  
  tags = {
    Name = "NAT Gateway EIP"
  }
}
```

---

## Data Sources

### 4. AWS Data Sources

#### aws_availability_zones
```hcl
data "aws_availability_zones" "available" {
  state = "available"
}
```

#### aws_caller_identity
```hcl
data "aws_caller_identity" "current" {}
```

#### aws_region
```hcl
data "aws_region" "current" {}
```

#### aws_ami
```hcl
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical
  
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }
  
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}
```

---

## Variable Blocks

### 5. Variable Definitions

#### Basic Variables
```hcl
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "environment" {
  description = "Environment name"
  type        = string
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
  
  validation {
    condition     = contains(["t2.micro", "t2.small", "t2.medium"], var.instance_type)
    error_message = "Instance type must be t2.micro, t2.small, or t2.medium."
  }
}
```

#### Complex Variables
```hcl
variable "public_subnets" {
  description = "List of public subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
```

---

## Output Blocks

### 6. Output Definitions

#### Basic Outputs
```hcl
output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr_block" {
  description = "CIDR block of the VPC"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = aws_subnet.public[*].id
}
```

#### Complex Outputs
```hcl
output "vpc_info" {
  description = "Complete VPC information"
  value = {
    id          = aws_vpc.main.id
    cidr_block  = aws_vpc.main.cidr_block
    arn         = aws_vpc.main.arn
    owner_id    = aws_vpc.main.owner_id
  }
}
```

---

## Local Values

### 7. Local Variables

```hcl
locals {
  common_tags = {
    Environment = var.environment
    ManagedBy   = "Terraform"
    Project     = "VPC Infrastructure"
  }
  
  vpc_name = "${var.environment}-vpc"
  
  public_subnet_names = [
    for i, cidr in var.public_subnets : "${var.environment}-public-${i + 1}"
  ]
}
```

---

## Module Blocks

### 8. Module Usage

```hcl
module "vpc" {
  source = "./modules/vpc"
  
  vpc_cidr = "10.0.0.0/16"
  environment = var.environment
  
  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnets = ["10.0.3.0/24", "10.0.4.0/24"]
  
  providers = {
    aws = aws
  }
}
```

---

## Built-in Functions

### 9. String Functions

#### concat
```hcl
locals {
  all_subnets = concat(var.public_subnets, var.private_subnets)
}
```

#### format
```hcl
locals {
  subnet_name = format("%s-subnet-%d", var.environment, count.index)
}
```

#### replace
```hcl
locals {
  clean_name = replace(var.name, "/[^a-zA-Z0-9-]/", "-")
}
```

### 10. Collection Functions

#### length
```hcl
locals {
  subnet_count = length(var.public_subnets)
}
```

#### element
```hcl
locals {
  first_subnet = element(var.public_subnets, 0)
}
```

#### for_each
```hcl
resource "aws_subnet" "public" {
  for_each = toset(var.public_subnets)
  
  vpc_id     = aws_vpc.main.id
  cidr_block = each.value
  
  tags = {
    Name = "Public Subnet ${each.key}"
  }
}
```

### 11. Type Conversion Functions

#### toset
```hcl
locals {
  unique_zones = toset(data.aws_availability_zones.available.names)
}
```

#### tolist
```hcl
locals {
  subnet_list = tolist(aws_subnet.public[*].id)
}
```

### 12. File Functions

#### file
```hcl
locals {
  user_data = file("${path.module}/user_data.sh")
}
```

#### templatefile
```hcl
locals {
  user_data = templatefile("${path.module}/user_data.sh", {
    server_name = "Web Server"
    environment = var.environment
  })
}
```

### 13. Math Functions

#### cidrhost
```hcl
locals {
  first_ip = cidrhost(var.vpc_cidr, 10)
}
```

#### cidrsubnet
```hcl
locals {
  subnet_cidr = cidrsubnet(var.vpc_cidr, 8, 1)
}
```

---

## Advanced Constructs

### 14. Lifecycle Blocks

```hcl
resource "aws_instance" "web" {
  # ... configuration ...
  
  lifecycle {
    create_before_destroy = true
    prevent_destroy       = false
    ignore_changes        = [tags]
  }
}
```

### 15. Dynamic Blocks

```hcl
resource "aws_security_group" "web" {
  # ... configuration ...
  
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

### 16. Conditional Expressions

```hcl
resource "aws_instance" "web" {
  # ... configuration ...
  
  count = var.create_instance ? 1 : 0
  
  tags = merge(
    var.common_tags,
    var.environment == "prod" ? { Backup = "true" } : {}
  )
}
```

### 17. Data Source Dependencies

```hcl
data "aws_availability_zones" "available" {
  state = "available"
}

resource "aws_subnet" "public" {
  count = length(data.aws_availability_zones.available.names)
  
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone = data.aws_availability_zones.available.names[count.index]
}
```

---

## Best Practices

### 18. Code Organization

#### File Structure
```
vpc/
├── main.tf          # Main VPC resources
├── variables.tf     # Variable definitions
├── outputs.tf       # Output definitions
├── providers.tf     # Provider configuration
├── security.tf      # Security groups
├── routing.tf       # Route tables and routes
└── terraform.tfvars # Variable values
```

#### Naming Conventions
```hcl
# Use descriptive names
resource "aws_vpc" "main" {
  # ...
}

# Use consistent tagging
tags = {
  Name        = "Main VPC"
  Environment = var.environment
  ManagedBy   = "Terraform"
  Project     = "Infrastructure"
}
```

### 19. Security Best Practices

#### Security Groups
```hcl
resource "aws_security_group" "web" {
  # Principle of least privilege
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # Always include egress rule
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

### 20. State Management

#### Backend Configuration
```hcl
terraform {
  backend "s3" {
    bucket = "my-terraform-state"
    key    = "vpc/terraform.tfstate"
    region = "us-west-2"
    
    # Enable state locking
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }
}
```

### 21. Error Handling

#### Variable Validation
```hcl
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  
  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))
    error_message = "Must be a valid CIDR block."
  }
}
```

---

## Summary

This reference covers the essential Terraform functions, blocks, and constructs used in AWS VPC configurations:

### Key Blocks:
- **terraform**: Configuration and requirements
- **provider**: Provider settings
- **resource**: Infrastructure resources
- **data**: Read-only data sources
- **variable**: Input parameters
- **output**: Exported values
- **locals**: Local variables
- **module**: Code reuse

### Key Functions:
- **String**: concat, format, replace
- **Collection**: length, element, for_each
- **Type Conversion**: toset, tolist
- **File**: file, templatefile
- **Math**: cidrhost, cidrsubnet

### Advanced Features:
- **Lifecycle**: Resource lifecycle management
- **Dynamic Blocks**: Dynamic configuration
- **Conditionals**: Conditional resource creation
- **Validation**: Input validation

This comprehensive reference provides the foundation for building robust, maintainable AWS VPC infrastructure using Terraform.
