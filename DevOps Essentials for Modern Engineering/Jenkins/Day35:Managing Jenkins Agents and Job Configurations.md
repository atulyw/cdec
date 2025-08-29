# 📒 Jenkins Notes

## 🔹 1. Install SSH Build Agent Plugin
- Go to **Manage Jenkins → Plugins → Available Plugins**  
- Search for **SSH Build Agents Plugin**  
- Install + Restart Jenkins  
- This allows Jenkins Master to connect to remote machines via **SSH** and use them as agents (slaves).  

---

## 🔹 2. Create & Attach SSH Agents to Master Jenkins
1. **Add SSH Credentials**
   - Go to **Manage Jenkins → Credentials → Global**  
   - Add:  
     - Kind: **SSH Username with Private Key**  
     - Username: (e.g., `jenkins`)  
     - Private Key: paste your SSH key  

2. **Configure New Node**
   - Go to **Manage Jenkins → Nodes & Clouds → New Node**  
   - Enter name (e.g., `ssh-agent-1`)  
   - Select **Permanent Agent** → OK  
   - Configure:  
     - Remote root directory: `/home/jenkins`  
     - Labels: `ssh-node`  
     - Launch method: **Launch agents via SSH**  
     - Add hostname (IP / DNS of remote server)  
     - Choose the **SSH credential** you created  

3. **Save & Connect**
   - Jenkins will attempt SSH connection  
   - If successful → node status turns **online**  
   - Now jobs can run on this SSH agent  

---

## 🔹 3. Node-Side Configuration (Remote Server Setup)

### Prerequisites on Remote Server
- **Operating System**: Linux (Ubuntu/CentOS/RHEL)
- **SSH Service**: Must be running and accessible
- **Java**: OpenJDK 8 or 11 installed
- **User Account**: Dedicated user for Jenkins operations

### Step 1: Create Jenkins User
```bash
# Create jenkins user
sudo useradd -m -s /bin/bash jenkins

# Set password (optional)
sudo passwd jenkins

# Add to sudo group (if needed for builds)
sudo usermod -aG sudo jenkins
```

### Step 2: Install Java
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install openjdk-11-jdk

# CentOS/RHEL
sudo yum install java-11-openjdk-devel

# Verify installation
java -version
```

### Step 3: Create Workspace Directory
```bash
# Create Jenkins workspace
sudo mkdir -p /home/jenkins
sudo chown jenkins:jenkins /home/jenkins
sudo chmod 755 /home/jenkins

# Create additional directories if needed
sudo mkdir -p /home/jenkins/tools
sudo mkdir -p /home/jenkins/workspace
sudo chown -R jenkins:jenkins /home/jenkins/
```

### Step 4: Install Build Tools (Optional)
```bash
# Install common build tools
sudo apt install git maven gradle docker.io

# Or for CentOS/RHEL
sudo yum install git maven gradle docker

# Verify installations
git --version
mvn --version
gradle --version
docker --version
```

### Step 5: Configure SSH Access
```bash
# Generate SSH key pair on Jenkins master
ssh-keygen -t rsa -b 4096 -C "jenkins@master"

# Copy public key to remote server
ssh-copy-id jenkins@remote-server-ip

# Test SSH connection
ssh jenkins@remote-server-ip "echo 'SSH connection successful'"
```

### Step 6: Configure Environment Variables
```bash
# Add to /home/jenkins/.bashrc
echo 'export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64' >> /home/jenkins/.bashrc
echo 'export PATH=$JAVA_HOME/bin:$PATH' >> /home/jenkins/.bashrc
echo 'export MAVEN_HOME=/usr/share/maven' >> /home/jenkins/.bashrc
echo 'export PATH=$MAVEN_HOME/bin:$PATH' >> /home/jenkins/.bashrc

# Source the profile
source /home/jenkins/.bashrc
```

### Step 7: Configure Docker Access (if using Docker)
```bash
# Add jenkins user to docker group
sudo usermod -aG docker jenkins

# Restart docker service
sudo systemctl restart docker

# Verify docker access
sudo -u jenkins docker run hello-world
```

### Step 8: Security Configuration
```bash
# Configure SSH for key-based authentication only
sudo nano /etc/ssh/sshd_config

# Add/modify these lines:
# PasswordAuthentication no
# PubkeyAuthentication yes
# PermitRootLogin no

# Restart SSH service
sudo systemctl restart sshd
```

### Step 9: Firewall Configuration
```bash
# Allow SSH connections
sudo ufw allow ssh

# If using specific ports for Jenkins
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable
```

### Step 10: Test Node Connectivity
```bash
# From Jenkins master, test connection
ssh jenkins@remote-server-ip "java -version"
ssh jenkins@remote-server-ip "echo \$JAVA_HOME"
ssh jenkins@remote-server-ip "ls -la /home/jenkins"
```

---

## 🔹 4. Jenkins Job Configuration

### General Sections
- **General**: description, discard old builds  
- **Source Code Management**: Git, branch, credentials  
- **Build Triggers**: Manual, Poll SCM, Webhook, CRON  
- **Build Steps**: shell, batch, Maven, Gradle, Docker build, etc.  
- **Post-build Actions**: archive artifacts, publish test reports, trigger another job, send notification  

---

## 🔹 5. Parameterized Jobs

### Purpose
- Allow **user input** at build time  
- Make jobs **reusable & flexible**  

### Common Parameter Types
1. **String** – free text (e.g., version = `1.2.3`)  
2. **Choice** – dropdown (e.g., env = `dev/qa/prod`)  
3. **Boolean** – checkbox (true/false)  
4. **Password** – hidden input  
5. **File** – upload file to use in build  

### Example Pipeline
```groovy
pipeline {
    agent { label 'ssh-node' } // run on SSH agent
    parameters {
        string(name: 'VERSION', defaultValue: '1.0.0', description: 'App Version')
        choice(name: 'ENV', choices: ['dev', 'qa', 'prod'], description: 'Target Environment')
        booleanParam(name: 'RUN_TESTS', defaultValue: true, description: 'Run Tests?')
    }
    stages {
        stage('Build') {
            steps {
                echo "Building version: ${params.VERSION}"
            }
        }
        stage('Deploy') {
            steps {
                echo "Deploying to ${params.ENV}"
            }
        }
        stage('Tests') {
            when { expression { params.RUN_TESTS } }
            steps {
                echo "Running tests..."
            }
        }
    }
}
```

---

## 🔹 6. Node-Side Troubleshooting

### Common Issues and Solutions

#### 1. SSH Connection Issues
```bash
# Test SSH connectivity
ssh -v jenkins@remote-server-ip

# Check SSH service status
sudo systemctl status sshd

# Verify SSH keys
ls -la ~/.ssh/
```

#### 2. Java Installation Issues
```bash
# Check Java installation
java -version
which java
echo $JAVA_HOME

# Reinstall Java if needed
sudo apt remove openjdk-*
sudo apt install openjdk-11-jdk
```

#### 3. Permission Issues
```bash
# Fix workspace permissions
sudo chown -R jenkins:jenkins /home/jenkins
sudo chmod -R 755 /home/jenkins

# Check user groups
groups jenkins
```

#### 4. Docker Access Issues
```bash
# Verify docker group membership
groups jenkins

# Test docker access
sudo -u jenkins docker ps

# Restart docker service
sudo systemctl restart docker
```

#### 5. Environment Variable Issues
```bash
# Check environment variables
env | grep JAVA
env | grep MAVEN

# Source profile
source ~/.bashrc
```

---

✅ **Summary**
- Install **SSH Build Agent Plugin** for remote agents.  
- Add **SSH credentials**, create new **nodes**, and attach them.  
- **Configure remote server** with proper user, Java, and build tools.  
- Configure jobs (SCM, triggers, build steps, post-actions).  
- Use **parameters** to make jobs dynamic and reusable.  
- **Troubleshoot** common node-side issues for successful agent setup.
