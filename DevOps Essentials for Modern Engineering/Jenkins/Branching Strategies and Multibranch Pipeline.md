# Branching Strategies and Multibranch Pipeline

## Table of Contents
1. [Introduction to Branching Strategies](#introduction-to-branching-strategies)
2. [Common Branching Models](#common-branching-models)
3. [Git Flow Strategy](#git-flow-strategy)
4. [GitHub Flow Strategy](#github-flow-strategy)
5. [Trunk-Based Development](#trunk-based-development)
6. [Introduction to Multibranch Pipeline](#introduction-to-multibranch-pipeline)
7. [Setting Up Multibranch Pipeline](#setting-up-multibranch-pipeline)
8. [Jenkinsfile for Multibranch](#jenkinsfile-for-multibranch)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

## Introduction to Branching Strategies

Branching strategies are systematic approaches to managing code branches in version control systems. They define how teams create, merge, and maintain different versions of their codebase throughout the development lifecycle.

### Why Branching Strategies Matter
- **Code Organization**: Keeps code organized and manageable
- **Team Collaboration**: Enables multiple developers to work simultaneously
- **Release Management**: Facilitates controlled releases and hotfixes
- **Quality Assurance**: Provides isolated environments for testing
- **Rollback Capability**: Enables quick recovery from problematic releases

## Common Branching Models

### 1. Git Flow Strategy

Git Flow is a comprehensive branching model designed for projects with scheduled releases.

#### Branch Structure
```
main (production)
├── develop (integration)
├── feature/feature-name
├── release/release-version
└── hotfix/hotfix-name
```

#### Branch Roles
- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/**: Individual feature development
- **release/**: Preparation for production release
- **hotfix/**: Emergency fixes for production

#### Workflow
1. **Feature Development**
   ```bash
   git checkout develop
   git checkout -b feature/new-feature
   # Develop feature
   git commit -m "Add new feature"
   git checkout develop
   git merge feature/new-feature
   git branch -d feature/new-feature
   ```

2. **Release Preparation**
   ```bash
   git checkout develop
   git checkout -b release/1.0.0
   # Fix bugs, update version
   git checkout main
   git merge release/1.0.0
   git tag -a v1.0.0 -m "Release 1.0.0"
   git checkout develop
   git merge release/1.0.0
   git branch -d release/1.0.0
   ```

3. **Hotfix Process**
   ```bash
   git checkout main
   git checkout -b hotfix/critical-bug
   # Fix the bug
   git commit -m "Fix critical bug"
   git checkout main
   git merge hotfix/critical-bug
   git tag -a v1.0.1 -m "Hotfix 1.0.1"
   git checkout develop
   git merge hotfix/critical-bug
   git branch -d hotfix/critical-bug
   ```

### 2. GitHub Flow Strategy

GitHub Flow is a simplified branching model suitable for continuous deployment.

#### Branch Structure
```
main (production)
└── feature-branch
```

#### Workflow
1. **Create Feature Branch**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature-branch
   ```

2. **Make Changes and Commit**
   ```bash
   # Make changes
   git add .
   git commit -m "Add new feature"
   git push origin feature-branch
   ```

3. **Create Pull Request**
   - Create PR on GitHub/GitLab
   - Get code review
   - Address feedback

4. **Merge and Deploy**
   ```bash
   git checkout main
   git pull origin main
   git merge feature-branch
   git push origin main
   git branch -d feature-branch
   ```

### 3. Trunk-Based Development

Trunk-Based Development promotes continuous integration with short-lived feature branches.

#### Branch Structure
```
main (trunk)
└── feature-branch (short-lived)
```

#### Key Principles
- **Single Main Branch**: All development happens on main
- **Short-Lived Branches**: Feature branches exist for hours/days, not weeks
- **Continuous Integration**: Frequent commits to main
- **Feature Flags**: Use toggles for incomplete features

## Introduction to Multibranch Pipeline

Multibranch Pipeline is a Jenkins plugin that automatically creates a pipeline for each branch in your repository.

### Benefits
- **Automated Branch Discovery**: Automatically detects new branches
- **Consistent CI/CD**: Same pipeline process across all branches
- **Branch-Specific Configuration**: Customize behavior per branch
- **Automatic Cleanup**: Removes pipelines for deleted branches

### How It Works
1. **Branch Discovery**: Scans repository for branches
2. **Pipeline Creation**: Creates Jenkins pipeline for each branch
3. **Configuration**: Applies branch-specific settings
4. **Execution**: Runs pipeline based on triggers
5. **Cleanup**: Removes pipelines for deleted branches

## Setting Up Multibranch Pipeline

### Prerequisites
- Jenkins with Multibranch Pipeline plugin
- Git repository access
- Jenkinsfile in repository

### Configuration Steps

#### 1. Create New Multibranch Pipeline
1. Click "New Item" in Jenkins
2. Select "Multibranch Pipeline"
3. Enter name and description

#### 2. Configure Branch Sources
```groovy
// Branch source configuration
Branch Sources:
  - Git
    Repository: https://github.com/username/repo.git
    Credentials: Select appropriate credentials
    Behaviours:
      - Discover branches
      - Discover pull requests
      - Discover tags
```

#### 3. Build Configuration
```groovy
// Build configuration
Build Configuration:
  - Mode: by Jenkinsfile
  - Script Path: Jenkinsfile (or custom path)
```

#### 4. Build Triggers
```groovy
// Build triggers
Build Triggers:
  - Periodically if not otherwise run
  - Poll SCM
  - Webhook (if using GitHub/GitLab)
```

#### 5. Property Strategies
```groovy
// Property strategies
Property Strategies:
  - Suppress automatic SCM triggering
  - Clean before checkout
  - Custom checkout timeout
```

## Jenkinsfile for Multibranch

### Basic Multibranch Jenkinsfile
```groovy
pipeline {
    agent any
    
    tools {
        maven 'Maven 3.8.1'
        jdk 'JDK 11'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build') {
            steps {
                sh 'mvn clean compile'
            }
        }
        
        stage('Test') {
            steps {
                sh 'mvn test'
            }
            post {
                always {
                    junit '**/target/surefire-reports/*.xml'
                }
            }
        }
        
        stage('Package') {
            when {
                branch 'main'
            }
            steps {
                sh 'mvn package'
            }
        }
        
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                echo "Deploying to production"
                // Add deployment steps
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo "Pipeline succeeded for branch: ${env.BRANCH_NAME}"
        }
        failure {
            echo "Pipeline failed for branch: ${env.BRANCH_NAME}"
        }
    }
}
```

### Advanced Multibranch Jenkinsfile
```groovy
pipeline {
    agent any
    
    environment {
        BRANCH_NAME = "${env.BRANCH_NAME}"
        CHANGE_ID = "${env.CHANGE_ID}"
        CHANGE_TARGET = "${env.CHANGE_TARGET}"
        CHANGE_BRANCH = "${env.CHANGE_BRANCH}"
        CHANGE_FORK = "${env.CHANGE_FORK}"
        CHANGE_URL = "${env.CHANGE_URL}"
        CHANGE_TITLE = "${env.CHANGE_TITLE}"
        CHANGE_AUTHOR = "${env.CHANGE_AUTHOR}"
        CHANGE_AUTHOR_DISPLAY_NAME = "${env.CHANGE_AUTHOR_DISPLAY_NAME}"
        CHANGE_AUTHOR_EMAIL = "${env.CHANGE_AUTHOR_EMAIL}"
        CHANGE_AUTHOR_AVATAR = "${env.CHANGE_AUTHOR_AVATAR}"
        CHANGE_AUTHOR_FULL_NAME = "${env.CHANGE_AUTHOR_FULL_NAME}"
    }
    
    stages {
        stage('Environment Setup') {
            steps {
                script {
                    // Branch-specific environment setup
                    if (env.BRANCH_NAME == 'main') {
                        env.DEPLOY_ENV = 'production'
                        env.DEPLOY_URL = 'https://prod.example.com'
                    } else if (env.BRANCH_NAME == 'develop') {
                        env.DEPLOY_ENV = 'staging'
                        env.DEPLOY_URL = 'https://staging.example.com'
                    } else {
                        env.DEPLOY_ENV = 'development'
                        env.DEPLOY_URL = 'https://dev.example.com'
                    }
                    
                    echo "Branch: ${env.BRANCH_NAME}"
                    echo "Environment: ${env.DEPLOY_ENV}"
                    echo "Deploy URL: ${env.DEPLOY_URL}"
                }
            }
        }
        
        stage('Code Quality') {
            parallel {
                stage('SonarQube Analysis') {
                    steps {
                        script {
                            if (env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'develop') {
                                echo "Running SonarQube analysis"
                                // Add SonarQube steps
                            } else {
                                echo "Skipping SonarQube for feature branch"
                            }
                        }
                    }
                }
                
                stage('Security Scan') {
                    steps {
                        script {
                            if (env.BRANCH_NAME == 'main') {
                                echo "Running security scan"
                                // Add security scanning steps
                            } else {
                                echo "Skipping security scan for non-main branch"
                            }
                        }
                    }
                }
            }
        }
        
        stage('Build and Test') {
            parallel {
                stage('Unit Tests') {
                    steps {
                        sh 'npm run test:unit'
                    }
                }
                
                stage('Integration Tests') {
                    steps {
                        sh 'npm run test:integration'
                    }
                }
                
                stage('E2E Tests') {
                    when {
                        branch 'main'
                    }
                    steps {
                        sh 'npm run test:e2e'
                    }
                }
            }
        }
        
        stage('Deploy') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                    branch pattern: "release/*", comparator: "REGEXP"
                }
            }
            steps {
                script {
                    switch(env.BRANCH_NAME) {
                        case 'main':
                            echo "Deploying to production"
                            // Production deployment steps
                            break
                        case 'develop':
                            echo "Deploying to staging"
                            // Staging deployment steps
                            break
                        default:
                            if (env.BRANCH_NAME.startsWith('release/')) {
                                echo "Deploying release candidate"
                                // Release deployment steps
                            }
                    }
                }
            }
        }
    }
    
    post {
        always {
            // Always run these steps
            cleanWs()
            archiveArtifacts artifacts: '**/coverage/**/*', fingerprint: true
        }
        
        success {
            script {
                if (env.BRANCH_NAME == 'main') {
                    // Notify stakeholders of successful production deployment
                    emailext (
                        subject: "Production Deployment Successful - ${env.BUILD_NUMBER}",
                        body: "Build ${env.BUILD_NUMBER} has been successfully deployed to production.",
                        to: "devops@company.com, managers@company.com"
                    )
                }
            }
        }
        
        failure {
            script {
                // Notify developers of build failure
                emailext (
                    subject: "Build Failed - ${env.BRANCH_NAME} #${env.BUILD_NUMBER}",
                    body: "Build ${env.BUILD_NUMBER} on branch ${env.BRANCH_NAME} has failed.",
                    to: "developers@company.com"
                )
            }
        }
        
        cleanup {
            // Cleanup steps
            echo "Cleaning up workspace"
        }
    }
}
```

## Best Practices

### 1. Branch Naming Conventions
- **Feature branches**: `feature/description-of-feature`
- **Bug fixes**: `bugfix/description-of-bug`
- **Hotfixes**: `hotfix/description-of-hotfix`
- **Releases**: `release/version-number`
- **Documentation**: `docs/description-of-docs`

### 2. Pipeline Organization
- **Consistent Structure**: Use same stage names across branches
- **Conditional Execution**: Use `when` blocks for branch-specific behavior
- **Parallel Execution**: Run independent stages in parallel
- **Error Handling**: Implement proper error handling and notifications

### 3. Security Considerations
- **Credential Management**: Use Jenkins credentials for sensitive data
- **Access Control**: Implement proper branch protection rules
- **Code Review**: Require PR reviews for main branches
- **Audit Logging**: Log all pipeline executions

### 4. Performance Optimization
- **Caching**: Cache dependencies between builds
- **Parallel Jobs**: Run independent tasks in parallel
- **Resource Management**: Set appropriate resource limits
- **Cleanup**: Regular cleanup of old builds and artifacts

## Troubleshooting

### Common Issues and Solutions

#### 1. Branch Not Discovered
**Problem**: New branch not appearing in Jenkins
**Solution**: 
- Check branch source configuration
- Verify repository permissions
- Manually trigger branch discovery

#### 2. Pipeline Fails on Specific Branches
**Problem**: Pipeline works on some branches but fails on others
**Solution**:
- Check branch-specific Jenkinsfile
- Verify environment variables
- Review conditional logic

#### 3. Build Triggers Not Working
**Problem**: Pipeline not building automatically
**Solution**:
- Check webhook configuration
- Verify SCM polling settings
- Review trigger conditions

#### 4. Workspace Cleanup Issues
**Problem**: Workspace not cleaning properly
**Solution**:
- Add `cleanWs()` in post actions
- Check disk space
- Verify cleanup permissions

### Debugging Commands
```bash
# Check Jenkins logs
tail -f /var/log/jenkins/jenkins.log

# Verify Git repository access
git ls-remote --heads <repository-url>

# Check branch discovery
curl -u username:token http://jenkins-url/job/job-name/api/json
```

## Conclusion

Branching strategies and multibranch pipelines are essential components of modern CI/CD practices. By implementing the right branching strategy for your team and project, combined with a well-configured multibranch pipeline, you can achieve:

- **Faster Development Cycles**: Parallel development on multiple branches
- **Better Code Quality**: Automated testing and quality gates
- **Easier Release Management**: Controlled deployment processes
- **Improved Team Collaboration**: Clear workflows and responsibilities
- **Reduced Deployment Risk**: Automated testing and validation

Choose the branching strategy that best fits your team size, release frequency, and deployment requirements, then configure your multibranch pipeline accordingly for optimal results.


