# EKS Module Outputs

output "cluster_id" {
  description = "The ID of the EKS cluster"
  value       = aws_eks_cluster.main.id
}

output "cluster_arn" {
  description = "The Amazon Resource Name (ARN) of the cluster"
  value       = aws_eks_cluster.main.arn
}

output "cluster_name" {
  description = "The name of the EKS cluster"
  value       = aws_eks_cluster.main.name
}

output "cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = aws_eks_cluster.main.endpoint
}

output "cluster_certificate_authority_data" {
  description = "Base64 encoded certificate data required to communicate with the cluster"
  value       = aws_eks_cluster.main.certificate_authority[0].data
}

output "cluster_security_group_id" {
  description = "Security group ID attached to the EKS cluster"
  value       = aws_eks_cluster.main.vpc_config[0].cluster_security_group_id
}

output "cluster_iam_role_name" {
  description = "IAM role name associated with EKS cluster"
  value       = aws_iam_role.cluster.name
}

output "cluster_iam_role_arn" {
  description = "IAM role ARN associated with EKS cluster"
  value       = aws_iam_role.cluster.arn
}

output "node_groups" {
  description = "Map of EKS node groups"
  value = {
    for k, v in aws_eks_node_group.main : k => {
      arn         = v.arn
      name        = v.node_group_name
      status      = v.status
      capacity_type = v.capacity_type
      instance_types = v.instance_types
      scaling_config = v.scaling_config
    }
  }
}

output "node_group_names" {
  description = "List of EKS node group names"
  value       = [for k, v in aws_eks_node_group.main : v.node_group_name]
}

output "node_group_iam_role_name" {
  description = "IAM role name associated with EKS node groups"
  value       = aws_iam_role.node_group.name
}

output "node_group_iam_role_arn" {
  description = "IAM role ARN associated with EKS node groups"
  value       = aws_iam_role.node_group.arn
}

output "oidc_provider_arn" {
  description = "The ARN of the OIDC Provider if one was created"
  value       = aws_eks_cluster.main.identity[0].oidc[0].issuer
}

output "cluster_platform_version" {
  description = "Platform version for the EKS cluster"
  value       = aws_eks_cluster.main.platform_version
}

output "cluster_version" {
  description = "Kubernetes version for the EKS cluster"
  value       = aws_eks_cluster.main.version
}
