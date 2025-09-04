# Terraform Backend Infrastructure Configuration

aws_region = "us-west-2"
state_bucket_name = "terraform-state-bucket"
dynamodb_table_name = "terraform-state-lock"

tags = {
  Project     = "terraform-backend"
  ManagedBy   = "terraform"
  Environment = "shared"
  Owner       = "devops-team"
}
