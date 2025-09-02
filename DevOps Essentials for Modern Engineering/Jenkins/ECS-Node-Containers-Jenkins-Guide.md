# 🐳 Jenkins ECS Node Containers Complete Guide

## 📋 Overview
This guide covers the **simple and minimal** setup of Amazon ECS (Elastic Container Service) as Jenkins agents/executors, allowing Jenkins to dynamically provision containers in ECS for build jobs.

> ⚠️ **Important Note**: When creating ECS task definitions for Jenkins agents, **DO NOT** set `JENKINS_SECRET` or `JENKINS_AGENT_NAME` as environment variables. These are automatically provided by the Jenkins ECS plugin and setting them manually will cause the "Cannot provide secret via both named and positional arguments" error.

> 🔌 **Critical Configuration**: **Enable TCP Port 5000** for inbound agents in Jenkins security settings (`Manage Jenkins` → `Configure Global Security` → `Agents` section). This is required for ECS agents to connect to Jenkins.

> 🔒 **Security Group Requirement**: **Jenkins server security group must allow inbound traffic on TCP port 5000** from the VPC CIDR or ECS security groups. ECS agents connect to Jenkins on this port.

> 🎯 **Goal**: This guide focuses on **minimal configuration** using the official [Jenkins inbound-agent Docker image](https://hub.docker.com/r/jenkins/inbound-agent/) without advanced features or custom images.

---

## 🔧 Prerequisites

### 1. AWS Requirements
- AWS Account with appropriate permissions
- VPC and security groups configured
- ECR repository (optional, for custom images)
- **Note**: ECS Cluster and Task Definitions will be created in this guide

### 2. Jenkins Requirements
- Jenkins server with admin access
- Internet connectivity to AWS services
- Java 17+ (for latest Jenkins versions)
- **TCP Port 5000 enabled** for inbound agents in Jenkins security settings
- **Security group allows inbound TCP port 5000** from VPC/ECS subnets

### 3. AWS CLI Setup
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS credentials
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter your default region (e.g., us-east-1)
# Enter your output format (json)
```

### 4. Jenkins Plugin Requirements
1. **Navigate to Jenkins Dashboard**
   - Go to `Manage Jenkins` → `Manage Plugins`

2. **Install the following plugins:**
   - **Amazon ECS Plugin** (Primary plugin)
   - **Pipeline: AWS Steps** (For pipeline integration)
   - **AWS Credentials** (For AWS authentication)
   - **Docker Pipeline** (Optional, for Docker operations)
   - **CloudBees AWS Credentials** (Alternative AWS credentials)

### Manual Plugin Installation
```bash
# Download and install plugins manually if needed
wget https://updates.jenkins.io/download/plugins/amazon-ecs/1.41/amazon-ecs.hpi
# Upload via Jenkins Plugin Manager
```

### 5. Jenkins Server Security Group Configuration
**Critical**: Jenkins server security group must allow inbound connections on TCP port 5000 for ECS agents to connect.

#### **Required Security Group Rule:**
```
Type: Custom TCP
Port: 5000
Source: VPC CIDR (e.g., 10.0.0.0/16) or ECS security group
Description: Allow ECS agents to connect to Jenkins
```

#### **Why This Is Required:**
- ECS agents connect **inbound** to Jenkins server on port 5000
- Jenkins security settings enable the port, but firewall must allow the traffic
- Without this rule, ECS agents will fail to connect with connection refused errors

---

## 🏗️ 0. ECS Infrastructure Setup

### Create ECS Cluster

#### Using AWS CLI
```bash
#!/bin/bash
# Create ECS Cluster for Jenkins
CLUSTER_NAME="jenkins-ecs-cluster"
REGION="us-east-1"

echo "🚀 Creating ECS Cluster: $CLUSTER_NAME"

# Create ECS Cluster
aws ecs create-cluster \
    --cluster-name $CLUSTER_NAME \
    --region $REGION \
    --capacity-providers FARGATE \
    --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1 \
    --settings name=containerInsights,value=enabled

echo "✅ ECS Cluster created successfully!"
echo "Cluster ARN: $(aws ecs describe-clusters --clusters $CLUSTER_NAME --region $REGION --query 'clusters[0].clusterArn' --output text)"
```



### Create IAM Roles for ECS

#### ECS Task Execution Role
```bash
#!/bin/bash
# Create ECS Task Execution Role
ROLE_NAME="ecsTaskExecutionRole"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "🔑 Creating ECS Task Execution Role..."

# Create the role
aws iam create-role \
    --role-name $ROLE_NAME \
    --assume-role-policy-document '{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "Service": "ecs-tasks.amazonaws.com"
                },
                "Action": "sts:AssumeRole"
            }
        ]
    }'

# Attach the AWS managed policy for ECS task execution
aws iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

# Create custom policy for additional permissions
aws iam put-role-policy \
    --role-name $ROLE_NAME \
    --policy-name JenkinsAgentPermissions \
    --policy-document '{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "ecs:RunTask",
                    "ecs:RegisterTaskDefinition",
                    "ecs:DescribeTasks",
                    "ecs:DescribeClusters",
                    "ecs:DescribeServices",
                    "ecs:DescribeTaskDefinition",
                    "ecs:ListClusters",
                    "ecs:ListServices",
                    "ecs:ListTaskDefinitions",
                    "ecs:ListTasks",
                    "ecs:StopTask",
                    "ecs:DescribeContainerInstances",
                    "ecs:ListContainerInstances",
                    "ecr:GetAuthorizationToken",
                    "ecr:BatchCheckLayerAvailability",
                    "ecr:GetDownloadUrlForLayer",
                    "ecr:BatchGetImage",
                    "iam:PassRole"
                ],
                "Resource": "*"
            }
        ]
    }'

echo "✅ ECS Task Execution Role created successfully!"
echo "Role ARN: arn:aws:iam::$ACCOUNT_ID:role/$ROLE_NAME"
```

> **Note**: **ECS Task Role is NOT needed** for basic Jenkins ECS agent functionality. The ECS Task Execution Role provides all necessary permissions for pulling images and writing logs. Only create a Task Role if your Jenkins builds need to access AWS services like S3, DynamoDB, etc.

### Create Security Groups Manually

> **Note**: Security Groups should be created manually in the AWS Console or using your preferred method. The Jenkins ECS plugin handles agent connectivity automatically, so minimal security group configuration is needed.

#### **Required Security Group Configuration:**
1. **Create Security Group** in your VPC
2. **Name**: `jenkins-agent-sg` (or your preferred name)
3. **Description**: "Security group for Jenkins ECS agents"
4. **VPC**: Select your VPC where ECS cluster will run

#### **Inbound Rules** (Minimal):
- **No inbound rules needed** - Jenkins agents don't require incoming connections

#### **Outbound Rules**:
- **All traffic** (0.0.0.0/0) - Allow agents to connect to Jenkins and download dependencies

#### **Why Minimal Configuration:**
- Jenkins agents connect **outbound** to Jenkins server
- No **inbound connections** are required
- ECS handles **internal networking** automatically
- **Jenkins ECS plugin** manages agent connectivity

### Create Task Definition

Here's the properly formatted task definition JSON for Jenkins agents:

```json
{
    "family": "jenkins-agent",
    "containerDefinitions": [
        {
            "cpu": 0,
            "environment": [],
            "essential": true,
            "image": "jenkins/inbound-agent:latest",
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/jenkins-agent",
                    "awslogs-region": "eu-west-1",
                    "awslogs-stream-prefix": "ecs"
                }
            },
            "mountPoints": [],
            "name": "jenkins-agent",
            "portMappings": [],
            "systemControls": [],
            "volumesFrom": []
        }
    ],
    "executionRoleArn": "arn:aws:iam::752566893920:role/ecsTaskExecutionRole",
    "networkMode": "awsvpc",
    "volumes": [],
    "placementConstraints": [],
    "requiresCompatibilities": [
        "FARGATE"
    ],
    "cpu": "512",
    "memory": "1024"
}
```

### **Additional Network Configuration Options**

When running ECS tasks with `awsvpc` network mode, you'll also need to specify these additional parameters:

```json
{
    "subnets": [
        "subnet-12345678",
        "subnet-87654321"
    ],
    "securityGroups": [
        "sg-12345678"
    ],
    "assignPublicIp": "ENABLED"
}
```

### **Complete Task Definition with Network Configuration**

```json
{
    "family": "jenkins-agent",
    "containerDefinitions": [
        {
            "cpu": 0,
            "environment": [],
            "essential": true,
            "image": "jenkins/inbound-agent:latest",
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/jenkins-agent",
                    "awslogs-region": "eu-west-1",
                    "awslogs-stream-prefix": "ecs"
                }
            },
            "mountPoints": [],
            "name": "jenkins-agent",
            "portMappings": [],
            "systemControls": [],
            "volumesFrom": []
        }
    ],
    "executionRoleArn": "arn:aws:iam::752566893920:role/ecsTaskExecutionRole",
    "networkMode": "awsvpc",
    "volumes": [],
    "placementConstraints": [],
    "requiresCompatibilities": [
        "FARGATE"
    ],
    "cpu": "512",
    "memory": "1024",
    "subnets": [
        "subnet-12345678",
        "subnet-87654321"
    ],
    "securityGroups": [
        "sg-12345678"
    ],
    "assignPublicIp": "ENABLED"
}
```

> **Note**: This task definition includes all necessary configurations for Jenkins agents. The complete infrastructure setup script below will create this automatically with proper variable substitution.



---



---









---

## ⚙️ 1. ECS Cloud Configuration

### Configure ECS Cloud in Jenkins
1. **Navigate to Cloud Configuration**
   - `Manage Jenkins` → `Configure System`
   - Scroll to `Cloud` section
   - Click `Add a new cloud` → `Amazon ECS`

2. **Basic Configuration**
   ```
   Name: ECS-Cloud
   AWS Credentials: aws-credentials
   Region: us-east-1 (or your preferred region)
   ```

3. **ECS Cluster Configuration**
   ```
   Cluster: your-ecs-cluster-name
   ```

### Advanced ECS Configuration
```yaml
# Example ECS Cloud Configuration
Name: ECS-Cloud
AWS Credentials: aws-credentials
Region: us-east-1
Cluster: jenkins-ecs-cluster
ECS Service Connect: false
```

---

## 🐳 2. ECS Agent Templates

### Create ECS Agent Template
1. **Add ECS Agent Template**
   - In ECS Cloud configuration, click `Add ECS Agent Template`

2. **Template Configuration**
   ```
   Template Name: jenkins-agent
   Label: ecs-agent
   Task Definition Override: jenkins-agent-task
   ```

### Task Definition Configuration
```json
{
    "family": "jenkins-agent",
    "containerDefinitions": [
        {
            "cpu": 0,
            "environment": [],
            "essential": true,
            "image": "jenkins/inbound-agent:latest",
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/jenkins-agent",
                    "awslogs-region": "eu-west-1",
                    "awslogs-stream-prefix": "ecs"
                }
            },
            "mountPoints": [],
            "name": "jenkins-agent",
            "portMappings": [],
            "systemControls": [],
            "volumesFrom": []
        }
    ],
    "executionRoleArn": "arn:aws:iam::752566893920:role/ecsTaskExecutionRole",
    "networkMode": "awsvpc",
    "volumes": [],
    "placementConstraints": [],
    "requiresCompatibilities": [
        "FARGATE"
    ],
    "cpu": "512",
    "memory": "1024"
    // Note: taskRoleArn is not needed for basic Jenkins agents
}
```

---

## 🔧 3. Jenkins Agent Configuration

### Configure Jenkins Security for ECS Agents
1. **Enable TCP Port for Inbound Agents**
   - Go to `Manage Jenkins` → `Configure Global Security`
   - Or navigate directly to: `http://your-jenkins-url:8080/manage/configureSecurity/`
   - Scroll down to **Agents** section
   - **Enable**: "TCP port for inbound agents"
   - **Fixed**: Set to `5000` (or your preferred port)
   - **Save** the configuration

2. **Agent Configuration**
   ```
   Name: ecs-agent
   Labels: ecs-agent
   Usage: Only build jobs with label expressions matching this node
   ```

3. **Launch Method**
   ```
   Launch method: Launch agents via ECS
   ECS Cloud: ECS-Cloud
   Template: jenkins-agent
   ```

### Agent Environment Variables
```bash
# Required environment variables for Jenkins agent
JENKINS_URL=http://your-jenkins-server:8080
JENKINS_SECRET=your-agent-secret
JENKINS_AGENT_NAME=ecs-agent-${BUILD_NUMBER}
JENKINS_WORKDIR=/home/jenkins/agent
```

---



---

## 📝 4. Pipeline Configuration

### Declarative Pipeline Example
```groovy
pipeline {
    agent {
        label 'ecs-agent'
    }
    
    environment {
        AWS_DEFAULT_REGION = 'us-east-1'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build') {
            steps {
                sh 'echo "Building on ECS agent..."'
                sh 'docker --version'
                sh 'aws --version'
            }
        }
        
        stage('Test') {
            steps {
                sh 'echo "Running tests on ECS agent..."'
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
    }
}
```



---



---



---



---

## 🎯 5. Simple Configuration Best Practices

### Minimal Task Definition
Based on the [official Jenkins inbound-agent Docker image](https://hub.docker.com/r/jenkins/inbound-agent/), keep your task definitions simple:

- **CPU**: Start with 512 (0.5 vCPU) for basic builds
- **Memory**: Start with 1024 MB (1 GB) for basic builds
- **Image**: Use `jenkins/inbound-agent:latest` for most use cases
- **No port mappings**: The agent doesn't need exposed ports
- **No environment variables**: Let Jenkins ECS plugin handle configuration

### When to Scale Up
Only increase resources if you experience:
- Build timeouts due to CPU constraints
- Out of memory errors during builds
- Slow build performance

### Resource Recommendations
| Build Type | CPU | Memory |
|------------|-----|--------|
| **Simple builds** | 512 | 1024 MB |
| **Medium builds** | 1024 | 2048 MB |
| **Heavy builds** | 2048 | 4096 MB |

---





---

## ✅ 6. Verification Checklist

### Pre-Deployment Checklist
- [ ] AWS CLI configured and working
- [ ] ECS cluster created and running
- [ ] IAM roles and policies configured
- [ ] Security groups configured
- [ ] CloudWatch log groups created
- [ ] Task definitions registered
- [ ] Custom Docker images built (if using)
- [ ] Jenkins plugins installed
- [ ] **TCP Port 5000 enabled** for inbound agents in Jenkins security
- [ ] **Jenkins server security group allows inbound TCP port 5000**
- [ ] AWS credentials configured in Jenkins
- [ ] ECS cloud configured in Jenkins
- [ ] Agent templates created

### Post-Deployment Checklist
- [ ] ECS agents can connect to Jenkins
- [ ] Jobs can run on ECS agents
- [ ] Logs are being generated
- [ ] Monitoring is working
- [ ] Costs are within budget
- [ ] Security policies are enforced
- [ ] Backup strategy is in place

### Performance Checklist
- [ ] Agent startup time is acceptable
- [ ] Build times are optimal
- [ ] Resource utilization is efficient
- [ ] Auto-scaling is working
- [ ] Cost monitoring is active

---



---

## 📖 7. Additional Resources

### Official Documentation
- [Jenkins ECS Plugin Documentation](https://plugins.jenkins.io/amazon-ecs/)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Jenkins Pipeline Documentation](https://www.jenkins.io/doc/book/pipeline/)

### Community Resources
- [Jenkins ECS Plugin GitHub](https://github.com/jenkinsci/amazon-ecs-plugin)
- [AWS ECS Best Practices](https://docs.aws.amazon.com/ecs/latest/bestpracticesguide/)
- [Jenkins Community Forums](https://community.jenkins.io/)

### Monitoring Tools
- [AWS CloudWatch](https://aws.amazon.com/cloudwatch/)
- [Jenkins Monitoring](https://plugins.jenkins.io/monitoring/)
- [Prometheus Jenkins Plugin](https://plugins.jenkins.io/prometheus/)

---

## 🎉 8. Conclusion

This guide provides a **simple and minimal** setup for ECS node containers in Jenkins, focusing on the essentials without advanced configurations. The setup provides scalable, cost-effective Jenkins agents using the official [Jenkins inbound-agent Docker image](https://hub.docker.com/r/jenkins/inbound-agent/).

### **Key Principles for Simple Setup:**
1. **Start Minimal**: Begin with 512 CPU and 1024 MB memory
2. **Use Official Image**: `jenkins/inbound-agent:latest` has everything you need
3. **Let Jenkins Handle Configuration**: Don't set secrets or agent names manually
4. **Scale Only When Needed**: Increase resources only if builds fail or are slow

### **What You Get:**
- ✅ **Simple ECS cluster** with FARGATE capacity
- ✅ **Minimal task definition** with essential logging
- ✅ **Automatic agent management** by Jenkins ECS plugin
- ✅ **Cost-effective** resource usage
- ✅ **Easy troubleshooting** with simple configuration

### **Remember:**
- Start with small configuration and scale up only when needed
- Monitor costs and performance regularly
- Keep security best practices in mind
- Test thoroughly before production deployment
- **Keep it simple** - the official image handles most use cases

---

## 🚀 9. Advanced Configuration: Custom Jenkins Agent Images

### **When to Use Custom Images**

Use custom Jenkins agent images when you need:
- **Python** for data science, ML, or Python-based builds
- **Docker** for building and pushing container images
- **Node.js** for JavaScript/TypeScript development
- **Additional tools** not available in the base image
- **Specific versions** of tools for consistency

### **Create Custom Jenkins Agent Dockerfile**

```dockerfile
# Custom Jenkins Agent with Python, Docker, Node.js, and AWS CLI
FROM jenkins/inbound-agent:latest

USER root

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    && rm -rf /var/lib/apt/lists/*

# Install Python 3.11
RUN apt-get update && apt-get install -y \
    python3.11 \
    python3.11-dev \
    python3.11-venv \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Create symlinks for python and pip
RUN ln -sf /usr/bin/python3.11 /usr/bin/python && \
    ln -sf /usr/bin/pip3 /usr/bin/pip

# Install Python packages
RUN pip install --no-cache-dir --break-system-packages \
    boto3 \
    awscli \
    requests \
    pytest \
    black \
    flake8 \
    mypy

# Install Docker (for Debian Bookworm)
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian bookworm stable" > /etc/apt/sources.list.d/docker.list && \
    apt-get update && \
    apt-get install -y docker-ce docker-ce-cli containerd.io && \
    rm -rf /var/lib/apt/lists/*

# Install Node.js 18 LTS
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Install additional tools
RUN apt-get update && apt-get install -y jq && rm -rf /var/lib/apt/lists/*

# Install yq
RUN curl -sSLo /usr/local/bin/yq https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 && \
    chmod +x /usr/local/bin/yq

# Install kubectl (latest stable)
RUN set -eux; \
    KUBECTL_VERSION="$(curl -L -s https://dl.k8s.io/release/stable.txt)"; \
    curl -L -o kubectl "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl"; \
    install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl; \
    rm kubectl

# Install Helm
RUN curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Install Terraform
RUN curl -fsSL https://apt.releases.hashicorp.com/gpg | gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com bookworm main" > /etc/apt/sources.list.d/hashicorp.list && \
    apt-get update && \
    apt-get install -y terraform && \
    rm -rf /var/lib/apt/lists/*

# Install AWS CLI v2
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm -rf awscliv2.zip aws/

# Create jenkins user and add to docker group
RUN usermod -aG docker jenkins

# Switch back to jenkins user
USER jenkins

# Verify installations
RUN python --version && \
    pip --version && \
    docker --version && \
    node --version && \
    npm --version && \
    aws --version && \
    kubectl version --client && \
    helm version && \
    terraform version
```
    pip --version && \
    docker --version && \
    node --version && \
    npm --version && \
    aws --version && \
    kubectl version --client && \
    helm version && \
    terraform version
```

### **Build and Push to ECR**

#### **1. Create ECR Repository**
```bash
#!/bin/bash
# Create ECR repository for custom Jenkins agent
REGION="us-east-1"
REPO_NAME="jenkins-agent-custom"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "🚀 Creating ECR repository: $REPO_NAME"

# Create ECR repository
aws ecr create-repository \
    --repository-name $REPO_NAME \
    --region $REGION \
    --image-scanning-configuration scanOnPush=true \
    --encryption-configuration encryptionType=AES256

echo "✅ ECR repository created successfully!"
echo "Repository URI: $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO_NAME"
```

#### **2. Build and Push Image**
```bash
#!/bin/bash
# Build and push custom Jenkins agent image to ECR
REGION="us-east-1"
REPO_NAME="jenkins-agent-custom"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
IMAGE_TAG="latest"

echo "🔨 Building custom Jenkins agent image..."

# Build Docker image
docker build -t jenkins-agent-custom:$IMAGE_TAG .

echo "📦 Tagging image for ECR..."

# Tag image for ECR
docker tag jenkins-agent-custom:$IMAGE_TAG $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO_NAME:$IMAGE_TAG

echo "🔐 Logging into ECR..."

# Login to ECR
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

echo "🚀 Pushing image to ECR..."

# Push image to ECR
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO_NAME:$IMAGE_TAG

echo "✅ Custom Jenkins agent image pushed successfully!"
echo "Image URI: $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO_NAME:$IMAGE_TAG"
```

### **Update Task Definition for Custom Image**

```json
{
    "family": "jenkins-agent-custom",
    "containerDefinitions": [
        {
            "cpu": 0,
            "environment": [],
            "essential": true,
            "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/jenkins-agent-custom:latest",
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/jenkins-agent-custom",
                    "awslogs-region": "us-east-1",
                    "awslogs-stream-prefix": "ecs"
                }
            },
            "mountPoints": [],
            "name": "jenkins-agent-custom",
            "portMappings": [],
            "systemControls": [],
            "volumesFrom": []
        }
    ],
    "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
    "networkMode": "awsvpc",
    "volumes": [],
    "placementConstraints": [],
    "requiresCompatibilities": [
        "FARGATE"
    ],
    "cpu": "2048",
    "memory": "4096",
    "subnets": [
        "subnet-12345678",
        "subnet-87654321"
    ],
    "securityGroups": [
        "sg-12345678"
    ],
    "assignPublicIp": "ENABLED"
}
```

### **Complete Advanced Setup Script**

```bash
#!/bin/bash
# Complete advanced Jenkins agent setup with custom image
set -e

REGION="us-east-1"
REPO_NAME="jenkins-agent-custom"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
IMAGE_TAG="latest"

echo "🚀 Starting advanced Jenkins agent setup..."

# 1. Create ECR repository
echo "📦 Creating ECR repository..."
aws ecr create-repository \
    --repository-name $REPO_NAME \
    --region $REGION \
    --image-scanning-configuration scanOnPush=true \
    --encryption-configuration encryptionType=AES256 \
    2>/dev/null || echo "Repository already exists"

# 2. Build Docker image
echo "🔨 Building Docker image..."
docker build -t jenkins-agent-custom:$IMAGE_TAG .

# 3. Tag and push to ECR
echo "📤 Tagging and pushing to ECR..."
docker tag jenkins-agent-custom:$IMAGE_TAG $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO_NAME:$IMAGE_TAG

aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO_NAME:$IMAGE_TAG

# 4. Create CloudWatch log group
echo "📊 Creating CloudWatch log group..."
aws logs create-log-group --log-group-name /ecs/jenkins-agent-custom --region $REGION 2>/dev/null || echo "Log group already exists"

# 5. Register task definition
echo "📋 Registering task definition..."
cat > jenkins-agent-custom-task-definition.json << EOF
{
    "family": "jenkins-agent-custom",
    "containerDefinitions": [
        {
            "cpu": 0,
            "environment": [],
            "essential": true,
            "image": "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO_NAME:$IMAGE_TAG",
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/jenkins-agent-custom",
                    "awslogs-region": "$REGION",
                    "awslogs-stream-prefix": "ecs"
                }
            },
            "mountPoints": [],
            "name": "jenkins-agent-custom",
            "portMappings": [],
            "systemControls": [],
            "volumesFrom": []
        }
    ],
    "executionRoleArn": "arn:aws:iam::$ACCOUNT_ID:role/ecsTaskExecutionRole",
    "networkMode": "awsvpc",
    "volumes": [],
    "placementConstraints": [],
    "requiresCompatibilities": [
        "FARGATE"
    ],
    "cpu": "2048",
    "memory": "4096"
}
EOF

aws ecs register-task-definition \
    --cli-input-json file://jenkins-agent-custom-task-definition.json \
    --region $REGION

echo "✅ Advanced Jenkins agent setup completed!"
echo "📊 Summary:"
echo "  - ECR Repository: $REPO_NAME"
echo "  - Image URI: $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO_NAME:$IMAGE_TAG"
echo "  - Task Definition: jenkins-agent-custom"
echo "  - Resources: 2048 CPU, 4096 MB Memory"
echo ""
echo "⚠️  Next Steps:"
echo "   - Update Jenkins ECS agent template to use custom image"
echo "   - Test agent connectivity and tool availability"
echo "   - Monitor resource usage and adjust if needed"
```

### **Advanced Agent Template Configuration**

In your Jenkins ECS agent template, use the custom image:

```yaml
# Jenkins ECS Agent Template Configuration
Template Name: jenkins-agent-custom
Label: custom-agent
Task Definition Override: jenkins-agent-custom

# Advanced Configuration
CPU: 2048
Memory: 4096
Launch Type: FARGATE
Network Mode: awsvpc
```

### **Resource Recommendations for Custom Images**

| Tool Combination | CPU | Memory | Use Case |
|------------------|-----|--------|----------|
| **Python + Docker** | 1024 | 2048 MB | Data science, ML builds |
| **Node.js + Docker** | 1024 | 2048 MB | JavaScript/TypeScript builds |
| **Python + Node.js + Docker** | 2048 | 4096 MB | Full-stack development |
| **All Tools + K8s** | 2048 | 4096 MB | DevOps, infrastructure |

### **Benefits of Custom Images**

✅ **Consistent Environment**: Same tool versions across all builds  
✅ **Faster Builds**: No need to install tools during build time  
✅ **Better Security**: Control over what tools are available  
✅ **Cost Optimization**: Reduced build time = lower ECS costs  
✅ **Reproducibility**: Identical environment for all builds  

### **Maintenance Considerations**

- **Regular Updates**: Update base image and tools monthly
- **Security Patches**: Keep tools updated for security
- **Size Management**: Monitor image size and optimize layers
- **Version Pinning**: Pin specific tool versions for stability
- **Testing**: Test new images before production deployment

### **Test Pipeline: Verify All Custom Agent Features**

Use this comprehensive pipeline to test all tools and features in your custom Jenkins agent:

```groovy
pipeline {
    agent {
        label 'custom-agent'  // Use your custom agent label
    }
    
    environment {
        AWS_DEFAULT_REGION = 'us-east-1'
        PYTHON_VERSION = '3.11'
        NODE_VERSION = '18'
        DOCKER_IMAGE = 'test-app'
        ECR_REPO = '123456789012.dkr.ecr.us-east-1.amazonaws.com/test-repo'
    }
    
    stages {
        stage('Verify System Tools') {
            steps {
                script {
                    echo "🔍 Verifying all installed tools and versions..."
                    
                    // Check Python and packages
                    sh '''
                        echo "=== Python Environment ==="
                        python --version
                        pip --version
                        python -c "import boto3; print(f'boto3 version: {boto3.__version__}')"
                        python -c "import requests; print(f'requests version: {requests.__version__}')"
                        python -c "import pytest; print(f'pytest version: {pytest.__version__}')"
                        python -c "import black; print(f'black version: {black.__version__}')"
                        python -c "import flake8; print(f'flake8 version: {flake8.__version__}')"
                        python -c "import mypy; print(f'mypy version: {mypy.__version__}')"
                    '''
                    
                    // Check Node.js and npm
                    sh '''
                        echo "=== Node.js Environment ==="
                        node --version
                        npm --version
                        npm list -g --depth=0 | head -10
                    '''
                    
                    // Check Docker
                    sh '''
                        echo "=== Docker Environment ==="
                        docker --version
                        docker info | grep -E "(Server Version|Operating System|Kernel Version)"
                        docker run --rm hello-world
                    '''
                    
                    // Check AWS CLI
                    sh '''
                        echo "=== AWS CLI Environment ==="
                        aws --version
                        aws sts get-caller-identity
                    '''
                    
                    // Check DevOps tools
                    sh '''
                        echo "=== DevOps Tools ==="
                        kubectl version --client
                        helm version
                        terraform version
                        jq --version
                        yq --version
                        git --version
                    '''
                }
            }
        }
        
        stage('Python Development Test') {
            steps {
                script {
                    echo "🐍 Testing Python development capabilities..."
                    
                    // Create Python virtual environment
                    sh '''
                        python -m venv venv
                        source venv/bin/activate
                        pip install --upgrade pip
                        pip install pytest requests boto3
                        
                        echo "Testing Python package installation..."
                        python -c "import pytest, requests, boto3; print('All packages imported successfully!')"
                        
                        # Create and test a simple Python script
                        cat > test_script.py << 'EOF'
import requests
import json

def test_function():
    return {"status": "success", "message": "Python is working!"}

if __name__ == "__main__":
    result = test_function()
    print(json.dumps(result, indent=2))
EOF
                        
                        python test_script.py
                        deactivate
                    '''
                }
            }
        }
        
        stage('Node.js Development Test') {
            steps {
                script {
                    echo "🟢 Testing Node.js development capabilities..."
                    
                    // Create package.json and test Node.js
                    sh '''
                        echo "Creating test Node.js project..."
                        cat > package.json << 'EOF'
{
  "name": "test-project",
  "version": "1.0.0",
  "description": "Test project for Jenkins agent",
  "main": "index.js",
  "scripts": {
    "test": "node index.js"
  },
  "dependencies": {
    "axios": "^1.6.0"
  }
}
EOF
                        
                        cat > index.js << 'EOF'
const axios = require('axios');

async function testFunction() {
    try {
        const response = await axios.get('https://httpbin.org/json');
        console.log('Node.js is working!');
        console.log('Response status:', response.status);
        return { status: 'success', message: 'Node.js test completed' };
    } catch (error) {
        console.error('Error:', error.message);
        return { status: 'error', message: error.message };
    }
}

testFunction();
EOF
                        
                        npm install
                        npm test
                    '''
                }
            }
        }
        
        stage('Docker Operations Test') {
            steps {
                script {
                    echo "🐳 Testing Docker capabilities..."
                    
                    // Build and test Docker image
                    sh '''
                        echo "Creating test Dockerfile..."
                        cat > Dockerfile << 'EOF'
FROM alpine:latest
RUN apk add --no-cache curl
CMD ["echo", "Docker is working in Jenkins agent!"]
EOF
                        
                        echo "Building test Docker image..."
                        docker build -t ${DOCKER_IMAGE}:latest .
                        
                        echo "Running test container..."
                        docker run --rm ${DOCKER_IMAGE}:latest
                        
                        echo "Testing Docker commands..."
                        docker images | grep ${DOCKER_IMAGE}
                        docker ps -a | head -5
                    '''
                }
            }
        }
        
        stage('AWS Operations Test') {
            steps {
                script {
                    echo "☁️ Testing AWS CLI capabilities..."
                    
                    // Test AWS CLI commands
                    sh '''
                        echo "Testing AWS CLI authentication..."
                        aws sts get-caller-identity
                        
                        echo "Testing AWS CLI configuration..."
                        aws configure list
                        
                        echo "Testing AWS service commands..."
                        aws ec2 describe-regions --query 'Regions[0:3].{Region:RegionName,Name:RegionName}' --output table
                        
                        echo "Testing ECR login (if credentials allow)..."
                        aws ecr get-login-password --region ${AWS_DEFAULT_REGION} || echo "ECR login test skipped (may need additional permissions)"
                    '''
                }
            }
        }
        
        stage('DevOps Tools Test') {
            steps {
                script {
                    echo "🛠️ Testing DevOps tools..."
                    
                    // Test various DevOps tools
                    sh '''
                        echo "=== Kubernetes Tools ==="
                        kubectl version --client
                        kubectl config current-context || echo "No kubeconfig found (expected in ECS agent)"
                        
                        echo "=== Helm ==="
                        helm version
                        helm list || echo "No Helm releases found (expected in ECS agent)"
                        
                        echo "=== Terraform ==="
                        terraform version
                        terraform -help | head -5
                        
                        echo "=== JSON Processing ==="
                        echo '{"test": "data", "number": 42}' | jq '.test'
                        echo '{"test": "data", "number": 42}' | yq e '.test' -
                        
                        echo "=== Git ==="
                        git --version
                        git config --list | grep -E "(user.name|user.email)" || echo "Git not configured (expected in ECS agent)"
                    '''
                }
            }
        }
        
        stage('Performance Test') {
            steps {
                script {
                    echo "⚡ Testing agent performance..."
                    
                    // Test resource usage and performance
                    sh '''
                        echo "=== System Information ==="
                        echo "CPU cores: $(nproc)"
                        echo "Memory: $(free -h | grep Mem | awk '{print $2}')"
                        echo "Disk space: $(df -h / | tail -1 | awk '{print $4}')"
                        
                        echo "=== Python Performance ==="
                        time python -c "
import time
start = time.time()
result = sum(i**2 for i in range(1000000))
end = time.time()
print(f'Sum of squares: {result}')
print(f'Time taken: {end - start:.4f} seconds')
"
                        
                        echo "=== Node.js Performance ==="
                        time node -e "
const start = Date.now();
let result = 0;
for (let i = 0; i < 1000000; i++) {
    result += i * i;
}
const end = Date.now();
console.log('Sum of squares:', result);
console.log('Time taken:', (end - start) / 1000, 'seconds');
"
                        
                        echo "=== Docker Performance ==="
                        time docker run --rm alpine:latest echo "Docker container startup test"
                    '''
                }
            }
        }
        
        stage('Integration Test') {
            steps {
                script {
                    echo "🔗 Testing tool integration..."
                    
                    // Test how tools work together
                    sh '''
                        echo "=== Python + AWS Integration ==="
                        python -c "
import boto3
import json
try:
    sts = boto3.client('sts')
    identity = sts.get_caller_identity()
    print('AWS Python SDK working:', json.dumps(identity, default=str))
except Exception as e:
    print('AWS Python SDK test:', str(e))
"
                        
                        echo "=== Node.js + Docker Integration ==="
                        docker run --rm node:18-alpine node -e "
console.log('Node.js running in Docker container');
console.log('Process ID:', process.pid);
console.log('Node version:', process.version);
"
                        
                        echo "=== Multi-tool Workflow ==="
                        echo '{"step": "start", "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' | jq '.' > workflow.json
                        cat workflow.json
                        
                        # Test Python script processing JSON
                        python -c "
import json
with open('workflow.json', 'r') as f:
    data = json.load(f)
data['status'] = 'completed'
data['tools_tested'] = ['python', 'docker', 'nodejs', 'aws']
print(json.dumps(data, indent=2))
"
                    '''
                }
            }
        }
    }
    
    post {
        always {
            script {
                echo "🧹 Cleaning up test artifacts..."
                sh '''
                    # Clean up Docker images
                    docker rmi ${DOCKER_IMAGE}:latest 2>/dev/null || true
                    docker rmi alpine:latest 2>/dev/null || true
                    docker rmi node:18-alpine 2>/dev/null || true
                    
                    # Clean up files
                    rm -f test_script.py index.js package.json Dockerfile workflow.json
                    rm -rf venv node_modules
                    
                    # Clean up Docker system
                    docker system prune -f
                '''
            }
        }
        success {
            echo "✅ All tests completed successfully! Your custom Jenkins agent is working perfectly."
            echo "🎯 Tools verified: Python, Node.js, Docker, AWS CLI, kubectl, Helm, Terraform, jq, yq, Git"
        }
        failure {
            echo "❌ Some tests failed. Check the logs above for details."
            echo "🔧 Common issues:"
            echo "   - AWS credentials not configured"
            echo "   - Docker daemon not accessible"
            echo "   - Network connectivity problems"
        }
    }
}
```

### **How to Use This Test Pipeline:**

1. **Create New Job**: Create a new Jenkins job with this pipeline
2. **Set Agent Label**: Ensure the job uses your custom agent label (`custom-agent`)
3. **Run Pipeline**: Execute the pipeline to verify all tools work correctly
4. **Check Results**: Review each stage output for successful tool verification
5. **Troubleshoot**: Use the failure messages to identify and fix any issues

### **What This Pipeline Tests:**

✅ **System Tools**: All installed tools and their versions  
✅ **Python Environment**: Package installation, virtual environments, script execution  
✅ **Node.js Environment**: npm packages, script execution, async operations  
✅ **Docker Operations**: Image building, container running, Docker commands  
✅ **AWS Integration**: CLI authentication, service commands, Python SDK  
✅ **DevOps Tools**: kubectl, Helm, Terraform, jq, yq, Git  
✅ **Performance**: Resource usage, execution speed, memory management  
✅ **Integration**: How tools work together in real workflows  
✅ **Cleanup**: Proper resource cleanup and management  

This comprehensive test pipeline ensures your custom Jenkins agent is production-ready and all tools are working correctly before you start using it for actual builds.
