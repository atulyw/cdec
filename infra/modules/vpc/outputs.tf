# VPC Module Outputs

output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr_block" {
  description = "CIDR block of the VPC"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "List of IDs of the public subnets"
  value       = [for subnet in aws_subnet.public : subnet.id]
}

output "private_subnet_ids" {
  description = "List of IDs of the private subnets"
  value       = [for subnet in aws_subnet.private : subnet.id]
}

output "public_subnet_cidrs" {
  description = "List of CIDR blocks of the public subnets"
  value       = [for subnet in aws_subnet.public : subnet.cidr_block]
}

output "private_subnet_cidrs" {
  description = "List of CIDR blocks of the private subnets"
  value       = [for subnet in aws_subnet.private : subnet.cidr_block]
}

output "internet_gateway_id" {
  description = "ID of the Internet Gateway"
  value       = aws_internet_gateway.main.id
}

output "nat_gateway_ids" {
  description = "List of IDs of the NAT Gateways"
  value       = [for nat in aws_nat_gateway.main : nat.id]
}

output "public_route_table_id" {
  description = "ID of the public route table"
  value       = aws_route_table.public.id
}

output "private_route_table_ids" {
  description = "List of IDs of the private route tables"
  value       = [for rt in aws_route_table.private : rt.id]
}

output "availability_zones" {
  description = "List of availability zones used"
  value       = keys(var.public_subnet_cidrs)
}
