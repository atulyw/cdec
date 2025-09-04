# Global Infrastructure Outputs - Development Environment

# Route 53 Outputs
output "hosted_zone_id" {
  description = "The hosted zone ID"
  value       = module.route53.hosted_zone_id
}

output "hosted_zone_name_servers" {
  description = "The hosted zone name servers"
  value       = module.route53.hosted_zone_name_servers
}

output "domain_name" {
  description = "The domain name"
  value       = module.route53.domain_name
}

