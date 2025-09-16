# Terraform Backend Infrastructure Configuration

aws_region = "eu-west-1"
state_bucket_name = "terraform-state-bucket-cdec41"
dynamodb_table_name = "terraform-state-lock"

tags = {
  Project     = "terraform-backend"
  ManagedBy   = "terraform"
  Environment = "shared"
  Owner       = "devops-team"
}
