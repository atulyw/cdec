# Terraform Backend Infrastructure

This directory contains the Terraform configuration to create the S3 bucket and DynamoDB table required for remote state storage and locking.

## Prerequisites

- AWS CLI configured with appropriate permissions
- Terraform >= 1.0 installed

## Resources Created

- **S3 Bucket**: `terraform-state-bucket` for storing Terraform state files
- **DynamoDB Table**: `terraform-state-lock` for state locking
- **Encryption**: S3 bucket with AES256 encryption
- **Versioning**: S3 bucket versioning enabled
- **Security**: Public access blocked

## Deployment

```bash
cd infra/terraform-backend
terraform init
terraform plan
terraform apply
```

## State File Structure

After deployment, the S3 bucket will store state files in the following structure:

```
terraform-state-bucket/
├── global/
│   ├── dev/terraform.tfstate
│   ├── stage/terraform.tfstate
│   └── prod/terraform.tfstate
├── backend/
│   ├── dev/terraform.tfstate
│   ├── stage/terraform.tfstate
│   └── prod/terraform.tfstate
└── frontend/
    ├── dev/terraform.tfstate
    ├── stage/terraform.tfstate
    └── prod/terraform.tfstate
```

## Jenkins Integration

The Jenkins pipelines are configured to use this backend with the following environment variables:

- `TF_STATE_BUCKET`: `terraform-state-bucket`
- `TF_STATE_KEY`: `{component}/{environment}/terraform.tfstate`
- `TF_STATE_REGION`: `us-west-2`

## Security

- S3 bucket is private with public access blocked
- State files are encrypted at rest
- DynamoDB table provides state locking
- Versioning enabled for state file history

## Cost Optimization

- DynamoDB uses pay-per-request billing
- S3 lifecycle policies can be added for cost optimization
- Consider using S3 Intelligent Tiering for long-term storage
