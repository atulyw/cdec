# Backend Infrastructure - Development Environment
# This module deploys backend-specific infrastructure for the dev environment

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC Module
module "vpc" {
  source = "../../../modules/vpc"

  vpc_name = var.vpc_name
  vpc_cidr = var.vpc_cidr

  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs

  tags = merge(
    var.tags,
    {
      Environment = "dev"
      Component   = "backend"
    }
  )
}

# EKS Cluster for Backend
module "eks" {
  source = "../../../modules/eks"

  cluster_name        = var.cluster_name
  kubernetes_version  = var.cluster_version
  vpc_id              = module.vpc.vpc_id
  subnet_ids          = module.vpc.private_subnet_ids

  cluster_endpoint_public_access_cidrs = var.cluster_endpoint_public_access_cidrs
  log_retention_days                   = var.log_retention_days

  node_groups = var.node_groups

  tags = merge(
    var.tags,
    {
      Environment = "dev"
      Component   = "backend"
    }
  )
}
