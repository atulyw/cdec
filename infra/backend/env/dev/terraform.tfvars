# Backend Infrastructure - Development Environment Configuration

aws_region = "eu-north-1"
vpc_name   = "backend-dev-vpc"
vpc_cidr   = "10.2.0.0/16"

# Public subnets for load balancers
public_subnet_cidrs = {
  "eu-north-1a" = "10.2.1.0/24"
  "eu-north-1b" = "10.2.2.0/24"
  "eu-north-1c" = "10.2.3.0/24"
}

# Private subnets for worker nodes
private_subnet_cidrs = {
  "eu-north-1a" = "10.2.10.0/24"
  "eu-north-1b" = "10.2.20.0/24"
  "eu-north-1c" = "10.2.30.0/24"
}

cluster_name    = "backend-dev-cluster"
cluster_version = "1.28"

# EKS cluster endpoint access configuration
cluster_endpoint_public_access_cidrs = ["0.0.0.0/0"]  # Restrict this in production
log_retention_days                   = 7

# Node groups configuration
node_groups = {
  main = {
    instance_types = ["t3.medium"]
    ami_type       = "AL2_x86_64"
    capacity_type  = "ON_DEMAND"
    scaling_config = {
      desired_size = 2
      max_size     = 4
      min_size     = 1
    }
    update_config = {
      max_unavailable_percentage = 25
    }
    tags = {
      NodeGroup = "main"
      Component = "backend"
    }
  }
}

tags = {
  Environment = "dev"
  Project     = "backend-infrastructure"
  ManagedBy   = "terraform"
  Component   = "backend"
  Owner       = "devops-team"
}
