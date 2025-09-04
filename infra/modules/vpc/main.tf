# VPC Module - Production-ready VPC for EKS deployment
# This module creates a VPC with public and private subnets across multiple AZs

# Data source for availability zones
data "aws_availability_zones" "available" {
  state = "available"
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(
    var.tags,
    {
      Name = "${var.vpc_name}-vpc"
    }
  )
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = merge(
    var.tags,
    {
      Name = "${var.vpc_name}-igw"
    }
  )
}

# Public Subnets
resource "aws_subnet" "public" {
  for_each = var.public_subnet_cidrs

  vpc_id                  = aws_vpc.main.id
  cidr_block              = each.value
  availability_zone       = each.key
  map_public_ip_on_launch = true

  tags = merge(
    var.tags,
    {
      Name = "${var.vpc_name}-public-${each.key}"
      Type = "public"
      "kubernetes.io/role/elb" = "1"
    }
  )
}

# Private Subnets
resource "aws_subnet" "private" {
  for_each = var.private_subnet_cidrs

  vpc_id            = aws_vpc.main.id
  cidr_block        = each.value
  availability_zone = each.key

  tags = merge(
    var.tags,
    {
      Name = "${var.vpc_name}-private-${each.key}"
      Type = "private"
      "kubernetes.io/role/internal-elb" = "1"
    }
  )
}

# Elastic IPs for NAT Gateways
resource "aws_eip" "nat" {
  for_each = var.public_subnet_cidrs

  domain = "vpc"
  depends_on = [aws_internet_gateway.main]

  tags = merge(
    var.tags,
    {
      Name = "${var.vpc_name}-nat-eip-${each.key}"
    }
  )
}

# NAT Gateways (one per AZ)
resource "aws_nat_gateway" "main" {
  for_each = var.public_subnet_cidrs

  allocation_id = aws_eip.nat[each.key].id
  subnet_id     = aws_subnet.public[each.key].id

  tags = merge(
    var.tags,
    {
      Name = "${var.vpc_name}-nat-${each.key}"
    }
  )

  depends_on = [aws_internet_gateway.main]
}

# Public Route Table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.vpc_name}-public-rt"
    }
  )
}

# Private Route Tables (one per AZ)
resource "aws_route_table" "private" {
  for_each = var.private_subnet_cidrs

  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[each.key].id
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.vpc_name}-private-rt-${each.key}"
    }
  )
}

# Public Route Table Associations
resource "aws_route_table_association" "public" {
  for_each = var.public_subnet_cidrs

  subnet_id      = aws_subnet.public[each.key].id
  route_table_id = aws_route_table.public.id
}

# Private Route Table Associations
resource "aws_route_table_association" "private" {
  for_each = var.private_subnet_cidrs

  subnet_id      = aws_subnet.private[each.key].id
  route_table_id = aws_route_table.private[each.key].id
}
