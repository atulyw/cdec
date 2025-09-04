# Frontend Deployment Guide

This guide explains how to deploy your frontend application to the S3 + CloudFront infrastructure.

## Prerequisites

1. **Terraform Infrastructure Deployed**: Ensure the S3 and CloudFront infrastructure is deployed
2. **AWS CLI Configured**: Make sure AWS CLI is configured with appropriate permissions
3. **Frontend Build Ready**: Have your built frontend application (React, Angular, Vue, etc.)

## Infrastructure Deployment

First, deploy the infrastructure:

```bash
cd infra/frontend/env/dev
terraform init
terraform plan
terraform apply
```

After deployment, note the outputs:
- `s3_bucket_name`: The S3 bucket name for uploading files
- `cloudfront_domain_name`: The CloudFront domain for accessing your app

## Frontend Application Deployment

### Method 1: AWS CLI (Recommended)

1. **Build your frontend application**:
   ```bash
   # For React
   npm run build
   
   # For Angular
   ng build --prod
   
   # For Vue
   npm run build
   ```

2. **Upload to S3**:
   ```bash
   # Get the bucket name from Terraform output
   BUCKET_NAME=$(terraform output -raw s3_bucket_name)
   
   # Upload all files from build directory
   aws s3 sync ./dist s3://$BUCKET_NAME --delete
   
   # Or upload specific build directory
   aws s3 sync ./build s3://$BUCKET_NAME --delete
   ```

3. **Invalidate CloudFront cache** (optional but recommended):
   ```bash
   # Get the distribution ID from Terraform output
   DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id)
   
   # Create invalidation
   aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
   ```

### Method 2: Terraform with Local Files

Add this to your `main.tf` to automatically upload files:

```hcl
# Upload frontend build files to S3
resource "aws_s3_object" "website_files" {
  for_each = fileset("${path.module}/../../../../app/frontend/dist", "**/*")
  
  bucket = module.s3.bucket_id
  key    = each.value
  source = "${path.module}/../../../../app/frontend/dist/${each.value}"
  etag   = filemd5("${path.module}/../../../../app/frontend/dist/${each.value}")
  
  content_type = lookup({
    "html" = "text/html"
    "css"  = "text/css"
    "js"   = "application/javascript"
    "json" = "application/json"
    "png"  = "image/png"
    "jpg"  = "image/jpeg"
    "gif"  = "image/gif"
    "ico"  = "image/x-icon"
  }, split(".", each.value)[length(split(".", each.value)) - 1], "application/octet-stream")
}
```

### Method 3: CI/CD Pipeline

Example GitHub Actions workflow:

```yaml
name: Deploy Frontend
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Build application
        run: npm run build
        
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-west-2
          
      - name: Deploy to S3
        run: |
          aws s3 sync ./dist s3://${{ secrets.S3_BUCKET_NAME }} --delete
          
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
```

## Accessing Your Application

After deployment, access your application via:

1. **CloudFront URL** (recommended):
   ```
   https://d1234567890abc.cloudfront.net
   ```

2. **S3 Website Endpoint** (direct access):
   ```
   http://frontend-dev-website.s3-website-us-west-2.amazonaws.com
   ```

## File Structure

Your S3 bucket should contain:
```
s3://your-bucket-name/
├── index.html
├── static/
│   ├── css/
│   │   └── main.css
│   └── js/
│       └── main.js
├── assets/
│   ├── images/
│   └── icons/
└── favicon.ico
```

## Important Notes

1. **HTTPS Only**: CloudFront automatically redirects HTTP to HTTPS
2. **SPA Support**: Custom error pages redirect 404/403 to index.html for Single Page Applications
3. **Caching**: Static assets are cached for 1 year, HTML files for 1 hour
4. **Versioning**: S3 bucket has versioning enabled for rollback capability
5. **Security**: S3 bucket is private, only accessible via CloudFront

## Troubleshooting

### Common Issues:

1. **403 Forbidden**: Check S3 bucket policy and CloudFront OAC configuration
2. **404 Not Found**: Ensure index.html exists and CloudFront error pages are configured
3. **CORS Issues**: CORS is configured for all origins, but check your application's CORS settings
4. **Cache Issues**: Use CloudFront invalidation to clear cache after updates

### Useful Commands:

```bash
# Check S3 bucket contents
aws s3 ls s3://your-bucket-name --recursive

# Check CloudFront distribution status
aws cloudfront get-distribution --id YOUR_DISTRIBUTION_ID

# List CloudFront invalidations
aws cloudfront list-invalidations --distribution-id YOUR_DISTRIBUTION_ID
```

## Cost Optimization

1. **Price Class**: Using `PriceClass_100` for dev (cheapest)
2. **Compression**: CloudFront automatically compresses content
3. **Caching**: Proper cache headers reduce origin requests
4. **S3 Storage Class**: Consider using S3 Standard-IA for infrequently accessed files
