# Infrastructure as Code (IaC) and Terraform Notes

## Table of Contents
1. [Introduction to Infrastructure as Code](#introduction-to-infrastructure-as-code)
2. [Why We Need IaC](#why-we-need-iac)
3. [Shell Script vs Ansible vs IaC Tools](#shell-script-vs-ansible-vs-iac-tools)
4. [Introduction to Terraform](#introduction-to-terraform)
5. [Terraform Language (Basic Syntax)](#terraform-language-basic-syntax)
6. [Terraform Providers and Requirements](#terraform-providers-and-requirements)
7. [Terraform Language Blocks](#terraform-language-blocks)
8. [Best Practices](#best-practices)
9. [Conclusion](#conclusion)

---

## Introduction to Infrastructure as Code

### What is Infrastructure as Code (IaC)?

Infrastructure as Code (IaC) is a practice that allows you to manage and provision computing infrastructure through machine-readable definition files rather than physical hardware configuration or interactive configuration tools.

### Key Concepts:

- **Declarative Approach**: Define what you want, not how to achieve it
- **Version Control**: Infrastructure code can be versioned, reviewed, and tracked
- **Automation**: Eliminates manual configuration and reduces human error
- **Consistency**: Ensures identical environments across different stages
- **Scalability**: Easy to replicate and scale infrastructure

### Benefits of IaC:

1. **Speed and Simplicity**: Faster deployment and configuration
2. **Consistency**: Eliminates configuration drift
3. **Risk Mitigation**: Reduces human error and improves reliability
4. **Cost Optimization**: Better resource management and utilization
5. **Compliance**: Audit trails and policy enforcement
6. **Disaster Recovery**: Quick infrastructure restoration

---

## Why We Need IaC

### Traditional Infrastructure Management Problems:

1. **Manual Configuration**: Time-consuming and error-prone
2. **Environment Drift**: Different environments become inconsistent
3. **Lack of Documentation**: No clear record of infrastructure setup
4. **Slow Recovery**: Manual restoration takes too long
5. **Limited Scalability**: Difficult to replicate environments
6. **Security Issues**: Inconsistent security configurations

### IaC Solutions:

1. **Automation**: Automated provisioning and configuration
2. **Consistency**: Identical environments across all stages
3. **Documentation**: Code serves as living documentation
4. **Fast Recovery**: Infrastructure can be recreated quickly
5. **Scalability**: Easy replication and scaling
6. **Security**: Consistent security policies and configurations

---

## Shell Script vs Ansible vs IaC Tools

| Aspect | Shell Scripts | Ansible | IaC Tools (Terraform, CloudFormation) |
|--------|---------------|---------|----------------------------------------|
| **Approach** | Imperative (step-by-step) | Declarative | Declarative |
| **Language** | Bash/PowerShell | YAML | HCL (Terraform), JSON/YAML (CloudFormation) |
| **State Management** | ❌ No built-in state | ❌ No built-in state | ✅ Built-in state tracking |
| **Idempotency** | ❌ Manual implementation | ✅ Built-in idempotency | ✅ Built-in idempotency |
| **Cross-Platform** | ❌ Platform-specific | ✅ Multi-platform | ✅ Multi-cloud |
| **Learning Curve** | 🟡 Moderate | 🟢 Easy | 🔴 Steep |
| **Agent Required** | ❌ No agent | ❌ Agentless (SSH) | ❌ No agent |
| **Error Handling** | 🟡 Basic | 🟢 Advanced | 🟢 Advanced |
| **Rollback Capability** | ❌ Manual | 🟡 Limited | ✅ Built-in |
| **Version Control** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Dependency Management** | ❌ Manual | 🟡 Basic | ✅ Advanced |
| **Community Support** | 🟢 Large | 🟢 Very Large | 🟢 Large |
| **Documentation** | 🟡 Code comments | 🟢 Excellent | 🟢 Excellent |

### **Use Cases Comparison**

| Use Case | Shell Scripts | Ansible | IaC Tools |
|----------|---------------|---------|-----------|
| **Simple Automation** | ✅ Excellent | ✅ Good | ❌ Overkill |
| **Configuration Management** | 🟡 Limited | ✅ Excellent | 🟡 Limited |
| **Application Deployment** | 🟡 Basic | ✅ Excellent | 🟡 Limited |
| **Infrastructure Provisioning** | ❌ Not suitable | 🟡 Limited | ✅ Excellent |
| **Multi-Server Orchestration** | ❌ Complex | ✅ Excellent | 🟡 Limited |
| **Multi-Cloud Deployment** | ❌ Not suitable | 🟡 Limited | ✅ Excellent |
| **Environment Replication** | ❌ Manual | 🟡 Limited | ✅ Excellent |
| **One-time Setup** | ✅ Good | 🟡 Overkill | 🟡 Overkill |
| **Complex Infrastructure** | ❌ Not suitable | 🟡 Limited | ✅ Excellent |

### **Advantages & Limitations**

#### **Shell Scripts**
**✅ Advantages:**
- Fast execution for simple tasks
- No additional dependencies
- Direct system access
- Good for one-time operations
- Platform-specific optimizations

**❌ Limitations:**
- No idempotency (risky to run multiple times)
- Limited error handling and rollback
- Platform-specific (not portable)
- Difficult to maintain complex scripts
- No state management
- Security concerns with hardcoded credentials

#### **Ansible**
**✅ Advantages:**
- Easy to learn and use
- Agentless architecture
- Large module ecosystem
- Excellent for configuration management
- Supports both imperative and declarative approaches
- Great for existing infrastructure
- Built-in idempotency
- YAML-based (human-readable)

**❌ Limitations:**
- Limited infrastructure provisioning capabilities
- No built-in state management
- Performance issues with large-scale deployments
- SSH dependency for agentless operation
- Limited multi-cloud support
- Not ideal for complex infrastructure

#### **IaC Tools (Terraform, CloudFormation)**
**✅ Advantages:**
- True infrastructure as code
- Built-in state management
- Advanced dependency resolution
- Multi-cloud support
- Excellent for greenfield projects
- Version control integration
- Audit trails and compliance
- Infrastructure visualization
- Plan and apply workflow

**❌ Limitations:**
- Steeper learning curve
- Requires infrastructure knowledge
- Limited configuration management capabilities
- State file management complexity
- Provider-specific limitations
- Cost of learning and implementation

### **When to Use Each Tool**

#### **Choose Shell Scripts When:**
- Simple, one-time automation tasks
- Platform-specific operations
- Quick prototyping
- System administration tasks
- No complex dependencies

#### **Choose Ansible When:**
- Configuration management
- Application deployment
- Multi-server orchestration
- Existing infrastructure management
- Team prefers YAML syntax
- Need for both imperative and declarative approaches

#### **Choose IaC Tools When:**
- Infrastructure provisioning
- Multi-cloud deployments
- Complex infrastructure management
- Greenfield projects
- Need for state management
- Compliance and audit requirements
- Environment replication
- Infrastructure versioning

---

## Introduction to Terraform

### What is Terraform?

Terraform is an open-source Infrastructure as Code tool created by HashiCorp. It allows you to define and provision data center infrastructure using a declarative configuration language.

### Key Features:

1. **Declarative Configuration**: Define desired state, Terraform figures out how to achieve it
2. **State Management**: Tracks the current state of your infrastructure
3. **Provider Ecosystem**: Supports 100+ providers (AWS, Azure, GCP, etc.)
4. **Plan and Apply**: Preview changes before applying them
5. **Dependency Management**: Automatically handles resource dependencies
6. **Version Control**: Infrastructure code can be versioned

### Terraform Workflow:

1. **Write**: Define infrastructure in `.tf` files
2. **Plan**: Preview changes with `terraform plan`
3. **Apply**: Apply changes with `terraform apply`
4. **Destroy**: Clean up resources with `terraform destroy`

### Core Concepts:

- **Providers**: Plugins that interact with cloud providers
- **Resources**: Infrastructure objects (EC2 instances, S3 buckets, etc.)
- **Data Sources**: Read-only information about existing resources
- **Variables**: Input parameters for your configuration
- **Outputs**: Exported values from your configuration
- **State**: Current state of your infrastructure

---

## Terraform Language (Basic Syntax)

### File Structure

Terraform uses `.tf` files with HashiCorp Configuration Language (HCL):

```hcl
# main.tf - Main configuration file
# variables.tf - Variable definitions
# outputs.tf - Output definitions
# providers.tf - Provider configurations
```

### Basic Syntax Rules:

1. **Blocks**: Defined with curly braces `{}`
2. **Arguments**: Key-value pairs using `=`
3. **Comments**: `#` for single-line, `/* */` for multi-line
4. **Strings**: Can be quoted or unquoted
5. **Lists**: `["item1", "item2"]`
6. **Maps**: `{key1 = "value1", key2 = "value2"}`

### Example Configuration:

```hcl
# Provider configuration
provider "aws" {
  region = "us-west-2"
}

# Variable definition
variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

# Resource definition
resource "aws_instance" "example" {
  ami           = "ami-12345678"
  instance_type = var.instance_type
  
  tags = {
    Name = "Example Instance"
  }
}

# Output definition
output "instance_id" {
  value = aws_instance.example.id
}
```

### Data Types:

- **String**: `"hello"`
- **Number**: `42`
- **Bool**: `true` or `false`
- **List**: `["a", "b", "c"]`
- **Map**: `{key = "value"}`
- **Object**: `{name = "John", age = 30}`
- **Tuple**: `["string", 1, true]`

---

## Terraform Providers and Requirements

### What are Providers?

Providers are plugins that Terraform uses to interact with cloud providers, SaaS providers, and other APIs. They define and manage resources.

### Popular Providers:

1. **AWS Provider**: `hashicorp/aws`
2. **Azure Provider**: `hashicorp/azurerm`
3. **Google Cloud Provider**: `hashicorp/google`
4. **Docker Provider**: `hashicorp/docker`
5. **Kubernetes Provider**: `hashicorp/kubernetes`
6. **GitHub Provider**: `integrations/github`

### Provider Source Addresses

#### Official HashiCorp Providers
```hcl
# AWS Provider
hashicorp/aws

# Azure Provider
hashicorp/azurerm

# Google Cloud Provider
hashicorp/google

# Docker Provider
hashicorp/docker

# Kubernetes Provider
hashicorp/kubernetes
```

#### Third-Party Providers
```hcl
# GitHub Provider
integrations/github

# Datadog Provider
datadog/datadog

# Vault Provider
hashicorp/vault
```

### Provider Requirements

#### What are Provider Requirements?

Provider requirements are declarations that specify which providers your Terraform configuration depends on, including their source addresses and version constraints. These requirements help Terraform understand which providers to download and use.

#### Basic Provider Requirements Syntax

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 2.0, < 3.0"
    }
  }
}
```

### Version Constraints

#### Version Constraint Syntax

| Constraint | Meaning | Example |
|------------|---------|---------|
| `= 1.0.0` | Exact version | `version = "= 1.0.0"` |
| `!= 1.0.0` | Not equal to version | `version = "!= 1.0.0"` |
| `> 1.0.0` | Greater than version | `version = "> 1.0.0"` |
| `>= 1.0.0` | Greater than or equal to | `version = ">= 1.0.0"` |
| `< 1.0.0` | Less than version | `version = "< 1.0.0"` |
| `<= 1.0.0` | Less than or equal to | `version = "<= 1.0.0"` |
| `~> 1.0` | Allows patch-level changes | `version = "~> 1.0"` |
| `~> 1.0.0` | Allows patch-level changes | `version = "~> 1.0.0"` |
| `>= 1.0.0, < 2.0.0` | Version range | `version = ">= 1.0.0, < 2.0.0"` |

#### Common Version Constraint Patterns

```hcl
# Allow any 4.x version
version = "~> 4.0"

# Allow any 4.16.x version
version = "~> 4.16"

# Allow versions 2.0.0 and above, but below 3.0.0
version = ">= 2.0.0, < 3.0.0"

# Allow any version 1.0.0 or higher
version = ">= 1.0.0"

# Exact version (not recommended for production)
version = "= 4.16.0"
```

### Provider Configuration Examples

#### Single Provider
```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = "us-west-2"
}
```

#### Multiple Providers
```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}
```

#### Provider with Aliases
```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
      configuration_aliases = [aws.us_west_2, aws.us_east_1]
    }
  }
}

provider "aws" {
  alias  = "us_west_2"
  region = "us-west-2"
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

# Using provider aliases in resources
resource "aws_instance" "primary" {
  provider = aws.us_west_2
  # ... other configuration
}

resource "aws_instance" "secondary" {
  provider = aws.us_east_1
  # ... other configuration
}
```

### Provider Configuration

#### Basic Provider Configuration
```hcl
# AWS Provider
provider "aws" {
  region = "us-west-2"
  profile = "default"
}

# Azure Provider
provider "azurerm" {
  features {}
  subscription_id = "your-subscription-id"
  tenant_id       = "your-tenant-id"
}

# Google Cloud Provider
provider "google" {
  project = "your-project-id"
  region  = "us-central1"
}
```

#### Advanced Provider Configuration
```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
```

### Provider Installation and Management

#### Automatic Provider Installation
Terraform automatically downloads required providers when you run:
```bash
terraform init
```

#### Provider Cache Location
- **Linux/macOS**: `~/.terraform.d/plugin-cache`
- **Windows**: `%APPDATA%\terraform.d\plugin-cache`

#### Provider Lock File
Terraform creates a `.terraform.lock.hcl` file that locks provider versions:

```hcl
# .terraform.lock.hcl
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "4.16.0"
    }
  }
}
```

### Provider Requirements Best Practices

#### 1. Version Constraints
```hcl
# ✅ Good: Use tilde (~>) for minor version updates
version = "~> 4.0"

# ✅ Good: Specify version ranges for major updates
version = ">= 4.0.0, < 5.0.0"

# ❌ Avoid: Exact versions (hard to maintain)
version = "= 4.16.0"

# ❌ Avoid: No version constraint (unpredictable)
version = ">= 0"
```

#### 2. Provider Organization
```hcl
# ✅ Good: Group related providers
terraform {
  required_providers {
    # Cloud providers
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    
    # Infrastructure tools
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.0"
    }
  }
}
```

#### 3. Module Provider Requirements
```hcl
# In a module (modules/vpc/main.tf)
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

# In the root module
module "vpc" {
  source = "./modules/vpc"
  
  providers = {
    aws = aws
  }
}
```

### Troubleshooting Provider Issues

#### Common Issues and Solutions

1. **Provider Not Found**
```bash
# Error: Could not find provider "hashicorp/aws"
# Solution: Check source address and run terraform init
terraform init
```

2. **Version Conflicts**
```bash
# Error: Provider version constraint conflicts
# Solution: Update version constraints in required_providers
terraform init -upgrade
```

3. **Provider Configuration Errors**
```bash
# Error: Provider configuration not found
# Solution: Ensure provider is configured in your Terraform files
```

#### Provider Validation Commands
```bash
# Validate configuration
terraform validate

# Check provider versions
terraform version

# Upgrade providers
terraform init -upgrade

# Clean provider cache
rm -rf .terraform
terraform init
```

### Provider Features:

- **Authentication**: Multiple authentication methods
- **Region Support**: Multi-region deployments
- **Resource Types**: Comprehensive resource coverage
- **Data Sources**: Read existing infrastructure
- **Customization**: Provider-specific configuration options

---

## Terraform Language Blocks

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

### 2. Provider Block

**Purpose**: Configure provider settings

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

### 3. Resource Block

**Purpose**: Define infrastructure resources

```hcl
resource "aws_instance" "web_server" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  
  vpc_security_group_ids = [aws_security_group.web.id]
  subnet_id              = aws_subnet.public.id
  
  user_data = templatefile("${path.module}/user_data.sh", {
    server_name = "Web Server"
  })
  
  tags = {
    Name = "Web Server"
    Environment = var.environment
  }
  
  lifecycle {
    create_before_destroy = true
  }
}
```

### 4. Data Source Block

**Purpose**: Fetch information about existing resources

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

### 5. Variable Block

**Purpose**: Define input variables

```hcl
variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
  
  validation {
    condition     = contains(["t2.micro", "t2.small", "t2.medium"], var.instance_type)
    error_message = "Instance type must be t2.micro, t2.small, or t2.medium."
  }
}

variable "environment" {
  description = "Environment name"
  type        = string
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}
```

### 6. Output Block

**Purpose**: Export values from configuration

```hcl
output "instance_id" {
  description = "ID of the created instance"
  value       = aws_instance.web_server.id
}

output "public_ip" {
  description = "Public IP address of the instance"
  value       = aws_instance.web_server.public_ip
  sensitive   = false
}
```

### 7. Local Values Block

**Purpose**: Define local variables for reuse

```hcl
locals {
  common_tags = {
    Environment = var.environment
    ManagedBy   = "Terraform"
    Project     = "Web Application"
  }
  
  instance_name = "${var.environment}-web-server"
}
```

### 8. Module Block

**Purpose**: Reuse and organize code

```hcl
module "vpc" {
  source = "./modules/vpc"
  
  vpc_cidr = "10.0.0.0/16"
  environment = var.environment
  
  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnets = ["10.0.3.0/24", "10.0.4.0/24"]
}
```

### 9. Data Source Block (Advanced)

**Purpose**: Fetch complex data structures

```hcl
data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

data "aws_availability_zones" "available" {
  state = "available"
}
```

### 10. Moved Block (Terraform 1.1+)

**Purpose**: Handle resource renames and moves

```hcl
moved {
  from = aws_instance.old_name
  to   = aws_instance.new_name
}
```

---

## Best Practices

### 1. File Organization
- Separate concerns into different files
- Use consistent naming conventions
- Group related resources together

### 2. State Management
- Use remote state storage
- Implement state locking
- Separate state files for different environments

### 3. Security
- Never commit sensitive data
- Use variables for secrets
- Implement least privilege access

### 4. Version Control
- Use semantic versioning
- Tag releases
- Implement branching strategies

### 5. Documentation
- Document all variables and outputs
- Include usage examples
- Maintain README files

### 6. Provider Management
- Use version constraints for all providers
- Regularly update provider versions
- Test provider updates in non-production environments
- Use provider aliases for multi-region deployments

### 7. Code Quality
- Use consistent formatting with `terraform fmt`
- Validate configurations with `terraform validate`
- Use meaningful resource names and tags
- Implement proper error handling and validation

---

## Conclusion

Infrastructure as Code with Terraform provides a powerful, flexible, and scalable way to manage infrastructure. By understanding these concepts and following best practices, you can create maintainable, reliable, and efficient infrastructure configurations.

### Key Takeaways:

1. **IaC** provides consistency, automation, and version control for infrastructure
2. **Terraform** is a powerful, declarative IaC tool with extensive provider support
3. **Proper organization** and **best practices** are crucial for maintainable code
4. **State management** is essential for tracking infrastructure changes
5. **Security** should always be a priority when managing infrastructure
6. **Provider requirements** ensure consistent and reliable infrastructure deployments
7. **Version constraints** help maintain stability and predictability

---

*This document provides a comprehensive overview of Infrastructure as Code and Terraform fundamentals. For more advanced topics, refer to the official Terraform documentation and community resources.*