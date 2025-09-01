# 🚀 Jenkins Installation Scripts

## 📋 Version Information
- **Latest Jenkins LTS**: 2.426.1.3 (as of 2024)
- **Minimum Java Version**: Java 17 (Jenkins 2.426+)
- **Recommended Java Version**: Java 21 (for optimal performance)
- **Supported Platforms**: Ubuntu/Debian, CentOS/RHEL, Docker

## 📋 Prerequisites
- Ubuntu/Debian or CentOS/RHEL system
- Sudo privileges
- Internet connectivity
- Java 17 or 21 (Jenkins 2.426+ requires Java 17+, latest LTS requires Java 21)

---

## 🔧 1. Ubuntu/Debian Installation Script

### Complete Installation Script
```bash
#!/bin/bash

# Jenkins Installation Script for Ubuntu/Debian
# Run with: sudo bash jenkins-install-ubuntu.sh

set -e  # Exit on any error

echo "🚀 Starting Jenkins Installation on Ubuntu/Debian..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Java 21
echo "☕ Installing Java 21..."
sudo apt install -y openjdk-21-jdk

# Verify Java installation
echo "✅ Verifying Java installation..."
java -version

# Add Jenkins repository
echo "📥 Adding Jenkins repository..."
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# Update package list
sudo apt update

# Install Jenkins
echo "🔧 Installing Jenkins..."
sudo apt install -y jenkins

# Start and enable Jenkins
echo "▶️ Starting Jenkins service..."
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Get initial admin password
echo "🔑 Getting initial admin password..."
echo "Initial admin password:"
sudo cat /var/lib/jenkins/secrets/initialAdminPassword

# Show Jenkins status
echo "📊 Jenkins status:"
sudo systemctl status jenkins --no-pager

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 8080/tcp
sudo ufw allow ssh

echo "✅ Jenkins installation completed!"
echo "🌐 Access Jenkins at: http://$(hostname -I | awk '{print $1}'):8080"
echo "🔑 Initial password: $(sudo cat /var/lib/jenkins/secrets/initialAdminPassword)"
```

### Quick Installation Script
```bash
#!/bin/bash
# Quick Jenkins install for Ubuntu/Debian
sudo apt update
sudo apt install -y openjdk-21-jdk
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/ | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt update
sudo apt install -y jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins
echo "Jenkins installed! Password: $(sudo cat /var/lib/jenkins/secrets/initialAdminPassword)"
```

---

## 🔧 2. CentOS/RHEL Installation Script

### Complete Installation Script
```bash
#!/bin/bash

# Jenkins Installation Script for CentOS/RHEL
# Run with: sudo bash jenkins-install-centos.sh

set -e  # Exit on any error

echo "🚀 Starting Jenkins Installation on CentOS/RHEL..."

# Update system
echo "📦 Updating system packages..."
sudo yum update -y

# Install Java 21
echo "☕ Installing Java 21..."
sudo yum install -y java-21-openjdk-devel

# Verify Java installation
echo "✅ Verifying Java installation..."
java -version

# Add Jenkins repository
echo "📥 Adding Jenkins repository..."
sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key

# Install Jenkins
echo "🔧 Installing Jenkins..."
sudo yum install -y jenkins

# Start and enable Jenkins
echo "▶️ Starting Jenkins service..."
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Get initial admin password
echo "🔑 Getting initial admin password..."
echo "Initial admin password:"
sudo cat /var/lib/jenkins/secrets/initialAdminPassword

# Show Jenkins status
echo "📊 Jenkins status:"
sudo systemctl status jenkins --no-pager

# Configure firewall
echo "🔥 Configuring firewall..."
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload

echo "✅ Jenkins installation completed!"
echo "🌐 Access Jenkins at: http://$(hostname -I | awk '{print $1}'):8080"
echo "🔑 Initial password: $(sudo cat /var/lib/jenkins/secrets/initialAdminPassword)"
```

### Quick Installation Script
```bash
#!/bin/bash
# Quick Jenkins install for CentOS/RHEL
sudo yum update -y
sudo yum install -y java-21-openjdk-devel
sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key
sudo yum install -y jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins
echo "Jenkins installed! Password: $(sudo cat /var/lib/jenkins/secrets/initialAdminPassword)"
```

---

## 🔧 3. Docker Installation Script

### Jenkins with Docker
```bash
#!/bin/bash

# Jenkins Docker Installation Script
# Run with: bash jenkins-docker-install.sh

set -e

echo "🐳 Installing Jenkins with Docker..."

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "⚠️ Please log out and back in for Docker group changes to take effect"
fi

# Create Jenkins data directory
echo "📁 Creating Jenkins data directory..."
sudo mkdir -p /var/jenkins_home
sudo chown 1000:1000 /var/jenkins_home

# Run Jenkins container with latest LTS
echo "🚀 Starting Jenkins container with latest LTS..."
docker run -d \
  --name jenkins \
  --restart=unless-stopped \
  -p 8080:8080 \
  -p 50000:50000 \
  -v /var/jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts-jdk21

# Wait for Jenkins to start
echo "⏳ Waiting for Jenkins to start..."
sleep 30

# Get initial password
echo "🔑 Getting initial admin password..."
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword

echo "✅ Jenkins Docker installation completed!"
echo "🌐 Access Jenkins at: http://localhost:8080"
echo "🔑 Initial password: $(docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword)"
```

---

## 🔧 4. Automated Setup Script

### Complete Jenkins Setup with Plugins
```bash
#!/bin/bash

# Complete Jenkins Setup Script
# Run with: sudo bash jenkins-complete-setup.sh

set -e

echo "🚀 Complete Jenkins Setup Script..."

# Detect OS and install Jenkins
if [ -f /etc/debian_version ]; then
    echo "📦 Detected Debian/Ubuntu system..."
    sudo apt update
    sudo apt install -y openjdk-21-jdk
    curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null
    echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/ | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null
    sudo apt update
    sudo apt install -y jenkins
elif [ -f /etc/redhat-release ]; then
    echo "📦 Detected CentOS/RHEL system..."
    sudo yum update -y
    sudo yum install -y java-21-openjdk-devel
    sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
    sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key
    sudo yum install -y jenkins
else
    echo "❌ Unsupported operating system"
    exit 1
fi

# Start Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Wait for Jenkins to start
echo "⏳ Waiting for Jenkins to start..."
sleep 60

# Get initial password
INITIAL_PASSWORD=$(sudo cat /var/lib/jenkins/secrets/initialAdminPassword)

# Create Jenkins CLI configuration
echo "🔧 Setting up Jenkins CLI..."
sudo mkdir -p /var/lib/jenkins/init.groovy.d

# Create initial setup script
cat > /tmp/init-setup.groovy << 'EOF'
import jenkins.model.*
import hudson.security.*
import jenkins.security.s2m.AdminWhitelistRule

def instance = Jenkins.getInstance()

// Create admin user
def hudsonRealm = new HudsonPrivateSecurityRealm(false)
hudsonRealm.createAccount("admin", "admin123")
instance.setSecurityRealm(hudsonRealm)

// Set authorization strategy
def strategy = new FullControlOnceLoggedInAuthorizationStrategy()
instance.setAuthorizationStrategy(strategy)

// Disable CSRF protection for initial setup
instance.getDescriptor("jenkins.CLI").get().setEnabled(false)

// Save configuration
instance.save()
EOF

sudo cp /tmp/init-setup.groovy /var/lib/jenkins/init.groovy.d/
sudo chown jenkins:jenkins /var/lib/jenkins/init.groovy.d/init-setup.groovy

# Restart Jenkins to apply changes
sudo systemctl restart jenkins

echo "✅ Jenkins installation and setup completed!"
echo "🌐 Access Jenkins at: http://$(hostname -I | awk '{print $1}'):8080"
echo "👤 Username: admin"
echo "🔑 Password: admin123"
echo "🔑 Original password: $INITIAL_PASSWORD"
```

---

## 🔧 5. Uninstall Script

### Remove Jenkins Completely
```bash
#!/bin/bash

# Jenkins Uninstall Script
# Run with: sudo bash jenkins-uninstall.sh

echo "🗑️ Uninstalling Jenkins..."

# Stop and disable Jenkins service
sudo systemctl stop jenkins
sudo systemctl disable jenkins

# Detect OS and uninstall
if [ -f /etc/debian_version ]; then
    echo "📦 Removing Jenkins from Ubuntu/Debian..."
    sudo apt remove --purge jenkins -y
    sudo apt autoremove -y
    sudo rm -rf /var/lib/jenkins
    sudo rm -rf /var/cache/jenkins
    sudo rm -rf /var/log/jenkins
    sudo rm -f /etc/apt/sources.list.d/jenkins.list
    sudo rm -f /usr/share/keyrings/jenkins-keyring.asc
elif [ -f /etc/redhat-release ]; then
    echo "📦 Removing Jenkins from CentOS/RHEL..."
    sudo yum remove jenkins -y
    sudo rm -rf /var/lib/jenkins
    sudo rm -rf /var/cache/jenkins
    sudo rm -rf /var/log/jenkins
    sudo rm -f /etc/yum.repos.d/jenkins.repo
fi

# Remove Jenkins user
sudo userdel -r jenkins 2>/dev/null || true

echo "✅ Jenkins uninstalled successfully!"
```

---

## 🔧 6. Latest Jenkins LTS Installation Script

### Install Latest Jenkins LTS with Java 21
```bash
#!/bin/bash

# Latest Jenkins LTS Installation Script
# Run with: sudo bash jenkins-latest-install.sh

set -e

echo "🚀 Installing Latest Jenkins LTS with Java 21..."

# Detect OS
if [ -f /etc/debian_version ]; then
    echo "📦 Detected Debian/Ubuntu system..."
    
    # Update system
    sudo apt update && sudo apt upgrade -y
    
    # Install Java 21
    echo "☕ Installing Java 21..."
    sudo apt install -y openjdk-21-jdk
    
    # Add Jenkins repository with latest key
    echo "📥 Adding Jenkins repository..."
    curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
      /usr/share/keyrings/jenkins-keyring.asc > /dev/null
    
    echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
      https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
      /etc/apt/sources.list.d/jenkins.list > /dev/null
    
    # Update and install latest Jenkins
    sudo apt update
    sudo apt install -y jenkins
    
elif [ -f /etc/redhat-release ]; then
    echo "📦 Detected CentOS/RHEL system..."
    
    # Update system
    sudo yum update -y
    
    # Install Java 21
    echo "☕ Installing Java 21..."
    sudo yum install -y java-21-openjdk-devel
    
    # Add Jenkins repository
    echo "📥 Adding Jenkins repository..."
    sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
    sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key
    
    # Install latest Jenkins
    sudo yum install -y jenkins
    
else
    echo "❌ Unsupported operating system"
    exit 1
fi

# Start and enable Jenkins
echo "▶️ Starting Jenkins service..."
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Wait for Jenkins to start
echo "⏳ Waiting for Jenkins to start..."
sleep 30

# Get initial password
INITIAL_PASSWORD=$(sudo cat /var/lib/jenkins/secrets/initialAdminPassword)

# Show Jenkins version
echo "📊 Jenkins version:"
sudo systemctl status jenkins --no-pager

# Configure firewall
echo "🔥 Configuring firewall..."
if command -v ufw &> /dev/null; then
    sudo ufw allow 8080/tcp
    sudo ufw allow ssh
elif command -v firewall-cmd &> /dev/null; then
    sudo firewall-cmd --permanent --add-port=8080/tcp
    sudo firewall-cmd --permanent --add-service=ssh
    sudo firewall-cmd --reload
fi

echo "✅ Latest Jenkins LTS installation completed!"
echo "🌐 Access Jenkins at: http://$(hostname -I | awk '{print $1}'):8080"
echo "🔑 Initial password: $INITIAL_PASSWORD"
echo "📋 Jenkins LTS version installed with Java 21 support"
```

---

## 🔧 7. Backup and Restore Scripts

### Backup Jenkins Configuration
```bash
#!/bin/bash

# Jenkins Backup Script
# Run with: sudo bash jenkins-backup.sh

BACKUP_DIR="/backup/jenkins"
DATE=$(date +%Y%m%d_%H%M%S)

echo "💾 Creating Jenkins backup..."

# Create backup directory
sudo mkdir -p $BACKUP_DIR

# Stop Jenkins
sudo systemctl stop jenkins

# Create backup
sudo tar -czf $BACKUP_DIR/jenkins_backup_$DATE.tar.gz \
    /var/lib/jenkins \
    /var/cache/jenkins \
    /etc/default/jenkins \
    /etc/init.d/jenkins

# Start Jenkins
sudo systemctl start jenkins

echo "✅ Backup created: $BACKUP_DIR/jenkins_backup_$DATE.tar.gz"
```

### Restore Jenkins Configuration
```bash
#!/bin/bash

# Jenkins Restore Script
# Usage: sudo bash jenkins-restore.sh /path/to/backup.tar.gz

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "❌ Please provide backup file path"
    echo "Usage: sudo bash jenkins-restore.sh /path/to/backup.tar.gz"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "🔄 Restoring Jenkins from backup..."

# Stop Jenkins
sudo systemctl stop jenkins

# Restore from backup
sudo tar -xzf $BACKUP_FILE -C /

# Fix permissions
sudo chown -R jenkins:jenkins /var/lib/jenkins
sudo chown -R jenkins:jenkins /var/cache/jenkins

# Start Jenkins
sudo systemctl start jenkins

echo "✅ Jenkins restored successfully!"
```

---

## 📋 Usage Instructions

### 1. Save Scripts
```bash
# Save the script to a file
nano jenkins-install.sh
# Paste the script content
chmod +x jenkins-install.sh
```

### 2. Run Installation
```bash
# For Ubuntu/Debian
sudo bash jenkins-install-ubuntu.sh

# For CentOS/RHEL
sudo bash jenkins-install-centos.sh

# For Docker
bash jenkins-docker-install.sh

# For Latest Jenkins LTS with Java 21 (Recommended)
sudo bash jenkins-latest-install.sh
```

### 3. Access Jenkins
- Open browser: `http://your-server-ip:8080`
- Use initial password from script output
- Follow setup wizard

---

## ⚠️ Important Notes

- **Security**: Change default passwords after installation
- **Firewall**: Ensure port 8080 is open
- **Java**: Jenkins 2.426+ requires Java 17+, latest LTS requires Java 21
- **Backup**: Regular backups recommended
- **Updates**: Keep Jenkins updated for security
- **Version**: Latest Jenkins LTS version supports Java 21 for optimal performance

---

## 🔧 Post-Installation Steps

1. **Install Recommended Plugins**
2. **Create Admin User**
3. **Configure Build Tools** (Maven, Gradle, Docker)
4. **Set up SSH Keys** for agents
5. **Configure Backup Strategy**
6. **Set up Monitoring**

## 🆕 Latest Jenkins LTS Features (2.426+)

- **Enhanced Security**: Improved security headers and CSRF protection
- **Performance**: Better memory management with Java 21
- **UI Improvements**: Modernized interface and better accessibility
- **Pipeline Enhancements**: Improved Declarative Pipeline syntax
- **Cloud Native**: Better Kubernetes and Docker support
- **Monitoring**: Enhanced metrics and health checks
- **Accessibility**: WCAG 2.1 compliance improvements
