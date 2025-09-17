# Frontend Deployment - Jenkins Pipeline Setup Guide

This guide will help you set up a Jenkins pipeline to deploy your React frontend to AWS CloudFront.

## Prerequisites

Before setting up the Jenkins pipeline, make sure you have:

1. **AWS Account** with the following resources:
   - S3 bucket for hosting static files
   - CloudFront distribution
   - IAM user with proper permissions

2. **Jenkins Server** with:
   - AWS CLI plugin (optional)
   - Node.js plugin (optional)

## Step 1: AWS Setup

### 1.1 Create S3 Bucket
```bash
# Create S3 bucket for hosting
aws s3 mb s3://cloudblitz-frontend-bucket --region us-east-1

# Enable static website hosting
aws s3 website s3://cloudblitz-frontend-bucket --index-document index.html --error-document index.html
```

### 1.2 Create CloudFront Distribution
1. Go to AWS CloudFront console
2. Create a new distribution
3. Set origin to your S3 bucket
4. Set default root object to `index.html`
5. Note down the Distribution ID (starts with `E`)

### 1.3 Create IAM User
Create an IAM user with these policies:
- `AmazonS3FullAccess` (or custom policy for your bucket)
- `CloudFrontFullAccess` (or custom policy for your distribution)

## Step 2: Jenkins Configuration

### 2.1 Install Required Plugins
In Jenkins, install these plugins:
- **AWS Steps** (for AWS CLI integration)
- **NodeJS** (for Node.js support)
- **Pipeline** (usually pre-installed)

### 2.2 Configure AWS Credentials
1. Go to Jenkins → Manage Jenkins → Credentials
2. Add new credentials:
   - Type: AWS Credentials
   - ID: `aws-credentials`
   - Access Key ID: Your IAM user access key
   - Secret Access Key: Your IAM user secret key

### 2.3 Configure Node.js
1. Go to Jenkins → Manage Jenkins → Global Tool Configuration
2. Add NodeJS installation:
   - Name: `NodeJS-20`
   - Version: `20.x`

## Step 3: Update Environment Variables

Edit the Jenkinsfile and update these variables:

```groovy
environment {
    AWS_REGION = 'us-east-1'                    // Your AWS region
    S3_BUCKET = 'cloudblitz-frontend-bucket'    // Your S3 bucket name
    CLOUDFRONT_DISTRIBUTION_ID = 'E1234567890ABC' // Your CloudFront distribution ID
}
```

## Step 4: Create Jenkins Job

### 4.1 Create New Pipeline Job
1. Go to Jenkins → New Item
2. Enter job name: `cloudblitz-frontend-deploy`
3. Select "Pipeline" type
4. Click OK

### 4.2 Configure Pipeline
1. In the job configuration:
   - Pipeline script from SCM
   - SCM: Git
   - Repository URL: Your Git repository URL
   - Script Path: `frontend/Jenkinsfile`

### 4.3 Run the Pipeline
1. Click "Build Now"
2. Monitor the build progress
3. Check the console output for any errors

## Step 5: Troubleshooting

### Common Issues and Solutions

#### 1. AWS CLI Not Found
**Error**: `aws: command not found`
**Solution**: The pipeline will automatically install AWS CLI, but you can also install it manually in Jenkins.

#### 2. S3 Upload Permission Denied
**Error**: `Access Denied` when uploading to S3
**Solution**: Check IAM user permissions and S3 bucket policy.

#### 3. CloudFront Invalidation Failed
**Error**: `Invalid distribution ID`
**Solution**: Verify the CloudFront distribution ID is correct.

#### 4. Build Failed
**Error**: `npm run build` fails
**Solution**: Check for TypeScript errors or missing dependencies.

#### 5. Website Not Accessible
**Issue**: Website shows old content after deployment
**Solution**: CloudFront cache invalidation takes 5-15 minutes. Wait and check again.

## Step 6: Monitoring and Maintenance

### 6.1 Check Deployment Status
```bash
# Check S3 bucket contents
aws s3 ls s3://cloudblitz-frontend-bucket/

# Check CloudFront distribution status
aws cloudfront get-distribution --id YOUR_DISTRIBUTION_ID
```

### 6.2 View Website
- Production URL: `https://www.junioraicoders.com`
- Check if changes are visible (may take 5-15 minutes)

### 6.3 Jenkins Build History
- Monitor build success/failure rates
- Check build logs for any issues
- Set up email notifications for build failures

## Step 7: Advanced Configuration

### 7.1 Environment-Specific Deployments
You can create separate pipelines for different environments:

```groovy
// For staging
environment {
    S3_BUCKET = 'cloudblitz-frontend-staging'
    CLOUDFRONT_DISTRIBUTION_ID = 'E1234567890STAGING'
}

// For production
environment {
    S3_BUCKET = 'cloudblitz-frontend-prod'
    CLOUDFRONT_DISTRIBUTION_ID = 'E1234567890PROD'
}
```

### 7.2 Automated Testing
Add testing stages to your pipeline:

```groovy
stage('Run Tests') {
    steps {
        sh '''
            cd frontend
            npm test -- --coverage --watchAll=false
        '''
    }
}
```

### 7.3 Security Best Practices
- Use IAM roles instead of access keys when possible
- Limit S3 bucket permissions to specific paths
- Use CloudFront signed URLs for private content
- Enable CloudFront access logs

## Quick Start Checklist

- [ ] S3 bucket created and configured
- [ ] CloudFront distribution created
- [ ] IAM user with proper permissions
- [ ] Jenkins server with required plugins
- [ ] AWS credentials configured in Jenkins
- [ ] Environment variables updated in Jenkinsfile
- [ ] Pipeline job created and configured
- [ ] First deployment successful
- [ ] Website accessible at production URL

## Support

If you encounter issues:
1. Check Jenkins build logs
2. Verify AWS permissions
3. Test AWS CLI commands manually
4. Check CloudFront distribution status
5. Verify S3 bucket contents

Remember: CloudFront cache invalidation can take 5-15 minutes, so be patient after deployment!

