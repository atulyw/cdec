# 🔗 Jenkins SSH Agents & Job Configuration Complete Guide

## 📋 Prerequisites
- Jenkins Master running
- Remote server(s) with SSH access
- SSH key pair generated

---

## 🔧 1. Install SSH Build Agent Plugin

### Step-by-Step Installation
1. **Access Plugin Manager**
   - Go to **Manage Jenkins → Plugins → Available**

2. **Search and Install**
   - Search for **"SSH Build Agents Plugin"**
   - Check the plugin
   - Click **"Install without restart"** or **"Download now and install after restart"**

3. **Restart Jenkins**
   - If prompted, restart Jenkins to activate the plugin
   - Plugin enables Jenkins to connect to remote machines via SSH

### Verification
- Go to **Manage Jenkins → Plugins → Installed**
- Verify **"SSH Build Agents Plugin"** is listed and enabled

---

## 🔑 2. Create and Attach SSH Agents to Master Jenkins

### Step 1: Add SSH Credentials
1. **Navigate to Credentials**
   - Go to **Manage Jenkins → Credentials → Global**

2. **Add New Credential**
   - Click **"Add Credentials"**
   - Configure:
     - **Kind**: SSH Username with Private Key
     - **Scope**: Global
     - **Username**: `jenkins` (or your remote user)
     - **Private Key**: Paste your SSH private key
     - **Passphrase**: (if your key has one)
     - **ID**: `jenkins-ssh-key` (optional but recommended)
     - **Description**: "SSH key for Jenkins agents"
   - Click **OK**

### Step 2: Create SSH Agent Node
1. **Create New Node**
   - Go to **Manage Jenkins → Nodes and Clouds → New Node**
   - Enter **Node name**: `ssh-agent-1`
   - Select **Permanent Agent** → **OK**

2. **Configure Node Settings**
   - **Remote root directory**: `/home/jenkins`
   - **Labels**: `ssh-node` (for job targeting)
   - **Usage**: Use this node as much as possible
   - **Launch method**: **Launch agents via SSH**
   - **Host**: `192.168.1.100` (your remote server IP/DNS)
   - **Credentials**: Select the SSH credential created above
   - **Host Key Verification Strategy**: Non verifying (for testing)
   - **JavaPath**: `/usr/bin/java` (if different from default)
   - **JVM Options**: `-Xmx2g -Xms1g` (optional)

3. **Save Configuration**
   - Click **Save**
   - Jenkins will attempt to connect to the remote server

### Step 3: Verify Connection
- **Check Status**: Node should show **"Online"** (green indicator)
- **Test Connection**: Click on node name to see details
- **Troubleshoot if Offline**:
  - Verify SSH connectivity: `ssh jenkins@192.168.1.100`
  - Check credentials and permissions
  - Ensure remote directory exists and is writable

---

## ⚙️ 3. Job Configuration

### Basic Job Structure
1. **General Section**
   - **Description**: Job purpose and details
   - **Discard old builds**: Keep only recent builds
   - **This project is parameterized**: Enable for dynamic jobs
   - **Restrict where this project can be run**: Specify node labels

2. **Source Code Management**
   - **Git**: Repository URL and credentials
   - **Branch**: Specify branch to build from
   - **Additional Behaviors**: Clean workspace, submodule options

3. **Build Triggers**
   - **Poll SCM**: Check for changes periodically
   - **Build periodically**: Schedule-based builds
   - **Trigger builds remotely**: Webhook integration
   - **Build after other projects are built**: Dependency chains

4. **Build Environment**
   - **Delete workspace before build starts**
   - **Add timestamps to console output**
   - **Abort the build if it's stuck**

5. **Build Steps**
   - **Execute shell**: Linux/Unix commands
   - **Execute Windows batch command**: Windows commands
   - **Invoke top-level Maven targets**: Maven builds
   - **Execute Gradle script**: Gradle builds
   - **Build a Docker image**: Docker operations

6. **Post-build Actions**
   - **Archive the artifacts**: Save build outputs
   - **Publish test results**: JUnit, TestNG reports
   - **Build other projects**: Trigger downstream jobs
   - **Send email notification**: Alert on completion

---

## 🎛️ 4. Parameterized Jobs

### Purpose and Benefits
- **Dynamic builds**: User input at runtime
- **Reusable jobs**: Same job for different environments
- **Flexible deployment**: Different parameters for different targets

### Parameter Types

#### 1. String Parameter
```groovy
string(name: 'VERSION', defaultValue: '1.0.0', description: 'Application version to build')
```
- **Use case**: Version numbers, commit hashes, custom text

#### 2. Choice Parameter
```groovy
choice(name: 'ENVIRONMENT', choices: ['dev', 'qa', 'staging', 'prod'], description: 'Target environment')
```
- **Use case**: Environment selection, build types

#### 3. Boolean Parameter
```groovy
booleanParam(name: 'RUN_TESTS', defaultValue: true, description: 'Run automated tests?')
```
- **Use case**: Feature toggles, conditional steps

#### 4. Password Parameter
```groovy
password(name: 'DB_PASSWORD', description: 'Database password')
```
- **Use case**: Sensitive data, API keys

#### 5. File Parameter
```groovy
file(name: 'CONFIG_FILE', description: 'Upload configuration file')
```
- **Use case**: Custom configs, certificates

### Complete Parameterized Pipeline Example
```groovy
pipeline {
    agent { label 'ssh-node' }
    
    parameters {
        string(name: 'VERSION', defaultValue: '1.0.0', description: 'Application Version')
        choice(name: 'ENVIRONMENT', choices: ['dev', 'qa', 'prod'], description: 'Target Environment')
        booleanParam(name: 'RUN_TESTS', defaultValue: true, description: 'Run Tests?')
        booleanParam(name: 'DEPLOY', defaultValue: false, description: 'Deploy after build?')
        password(name: 'API_KEY', description: 'API Key for deployment')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "Building version: ${params.VERSION}"
            }
        }
        
        stage('Build') {
            steps {
                sh 'mvn clean compile'
                echo "Build completed for ${params.VERSION}"
            }
        }
        
        stage('Test') {
            when { expression { params.RUN_TESTS } }
            steps {
                sh 'mvn test'
                echo "Tests completed"
            }
        }
        
        stage('Package') {
            steps {
                sh 'mvn package -DskipTests'
                archiveArtifacts artifacts: 'target/*.jar', fingerprint: true
            }
        }
        
        stage('Deploy') {
            when { expression { params.DEPLOY } }
            steps {
                echo "Deploying to ${params.ENVIRONMENT}"
                withCredentials([string(credentialsId: 'deploy-key', variable: 'DEPLOY_KEY')]) {
                    sh "deploy.sh ${params.ENVIRONMENT} ${params.VERSION}"
                }
            }
        }
    }
    
    post {
        always {
            echo "Build completed for ${params.VERSION}"
        }
        success {
            echo "Build successful!"
        }
        failure {
            echo "Build failed!"
        }
    }
}
```

### Using Parameters in Scripts
```bash
#!/bin/bash
# Access parameters in shell scripts
echo "Version: $VERSION"
echo "Environment: $ENVIRONMENT"
echo "Run Tests: $RUN_TESTS"

if [ "$RUN_TESTS" = "true" ]; then
    echo "Running tests..."
    mvn test
fi
```

---

## 🚀 Best Practices

### SSH Agent Management
- **Label agents logically**: `prod-node`, `dev-node`, `docker-node`
- **Monitor agent health**: Regular health checks
- **Use dedicated users**: Create `jenkins` user on remote servers
- **Secure SSH keys**: Use passphrase-protected keys

### Job Configuration
- **Use descriptive names**: Clear job naming conventions
- **Implement proper cleanup**: Archive artifacts, clean workspaces
- **Add comprehensive logging**: Detailed build logs
- **Set appropriate timeouts**: Prevent stuck builds

### Parameterized Jobs
- **Provide defaults**: Always set sensible default values
- **Validate inputs**: Use regex or choice parameters for validation
- **Document parameters**: Clear descriptions for each parameter
- **Test thoroughly**: Verify all parameter combinations work

---

## ⚠️ Troubleshooting

### SSH Connection Issues
- **Connection refused**: Check SSH service on remote server
- **Authentication failed**: Verify SSH keys and permissions
- **Permission denied**: Ensure remote user has access to workspace directory
- **Host key verification failed**: Use "Non verifying" strategy for testing

### Job Configuration Issues
- **Build fails**: Check console output for specific errors
- **Parameters not working**: Verify parameter names match usage in scripts
- **Agent not used**: Check node labels and job configuration
- **Artifacts not archived**: Verify file paths and permissions

### Performance Optimization
- **Agent overload**: Distribute jobs across multiple agents
- **Build time**: Optimize build steps and use parallel execution
- **Resource usage**: Monitor CPU and memory usage on agents
