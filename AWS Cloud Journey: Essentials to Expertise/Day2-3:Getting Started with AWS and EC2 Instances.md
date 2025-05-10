# AWS Fundamentals and EC2

## Introduction to AWS Dashboard

### AWS Management Console
- Web-based interface for accessing AWS services
- URL: https://console.aws.amazon.com
- Provides centralized access to all AWS services

### Key Dashboard Components
1. **Navigation Bar**
   - Services menu
   - Region selector
   - Account information
   - Support options

2. **Services Overview**
   - Recently visited services
   - Favorite services
   - All services catalog

3. **Account Information**
   - Billing dashboard
   - Account settings
   - Security credentials

4. **Search Bar**
   - Quick access to services
   - Command palette functionality
   - Service documentation

## Region vs Availability Zone (AZ)

### AWS Regions
- **Definition:** Physical locations around the world where AWS clusters data centers
- **Key Points:**
  - Each region is completely independent
  - Regions are designed to be isolated from each other
  - Data sovereignty and compliance requirements
  - Latency considerations

### Availability Zones (AZs)
- **Definition:** Isolated locations within each region
- **Characteristics:**
  - Multiple AZs per region (usually 3-6)
  - Physically separated
  - Independent power, cooling, and networking
  - Connected through low-latency links

### Best Practices
1. **Region Selection**
   - Choose based on:
     - Data sovereignty requirements
     - Latency requirements
     - Service availability
     - Cost considerations

2. **AZ Selection**
   - Deploy across multiple AZs for high availability
   - Consider disaster recovery requirements
   - Balance cost vs. redundancy

## Introduction to EC2 Service

### What is EC2?
- Elastic Compute Cloud
- Virtual servers in the cloud
- Resizable compute capacity
- Pay-as-you-go pricing

### EC2 Instance Types
1. **General Purpose (T3, M6g)**
   - Balanced compute, memory, and networking
   - Web servers, development environments

2. **Compute Optimized (C6g)**
   - High-performance processors
   - Batch processing, media transcoding

3. **Memory Optimized (R6g)**
   - High memory-to-vCPU ratio
   - In-memory databases, real-time processing

4. **Storage Optimized (I3)**
   - High I/O performance
   - NoSQL databases, data warehousing

5. **Accelerated Computing (P3, G4)**
   - GPU instances
   - Machine learning, graphics processing

### Key EC2 Features
- **Elastic IP addresses**
- **Security Groups**
- **Elastic Block Store (EBS)**
- **Instance Store**
- **Auto Scaling**
- **Load Balancing**

## Creating First Ubuntu Instance

### Step 1: Launch Instance
1. **Access EC2 Dashboard**
   - Navigate to EC2 service
   - Click "Launch Instance"

2. **Choose AMI**
   - Select "Ubuntu Server 22.04 LTS"
   - Choose 64-bit (x86) architecture

3. **Choose Instance Type**
   - Select t2.micro (free tier eligible)
   - Review instance details

### Step 2: Configure Instance
1. **Network Settings**
   - Select VPC
   - Choose subnet
   - Auto-assign Public IP

2. **Security Group**
   - Create new security group
   - Allow SSH (Port 22)
   - Allow HTTP (Port 80) if needed

3. **Storage**
   - Default 8GB gp2 volume
   - Add additional volumes if needed

### Step 3: Review and Launch
1. **Review Instance Details**
   - Check all configurations
   - Verify security settings

2. **Create Key Pair**
   - Create new key pair
   - Download .pem file
   - Store securely

3. **Launch Instance**
   - Click "Launch Instance"
   - Wait for instance to start

### Step 4: Connect to Instance
1. **Using SSH (Linux/Mac)**
   ```bash
   chmod 400 your-key.pem
   ssh -i your-key.pem ubuntu@your-instance-public-dns
   ```

2. **Using PuTTY (Windows)**
   - Convert .pem to .ppk
   - Configure PuTTY with key
   - Connect using instance public DNS

### Step 5: Basic Instance Management
1. **Instance Actions**
   - Start/Stop
   - Reboot
   - Terminate

2. **Monitoring**
   - Check instance status
   - Monitor CPU usage
   - Review system logs

3. **Security**
   - Update security groups
   - Manage key pairs
   - Configure IAM roles

### Best Practices
1. **Security**
   - Use security groups effectively
   - Keep instances updated
   - Follow least privilege principle

2. **Cost Management**
   - Use appropriate instance types
   - Monitor usage
   - Implement auto-scaling

3. **Performance**
   - Choose right instance type
   - Use EBS optimized instances
   - Implement proper monitoring

## SSH and Key Management

![SSH Authentication Diagram](https://miro.medium.com/v2/resize:fit:805/0*mkP-2860fZWRGWMK.png)

### Understanding SSH Keys

### Understanding SSH Keys
1. **Public Key**
   - Stored on the server (authorized_keys)
   - Can be shared publicly
   - Used to encrypt data
   - Example: `id_rsa.pub`

2. **Private Key**
   - Stored on your local machine
   - Must be kept secure
   - Used to decrypt data
   - Example: `id_rsa`
   - Never share or commit to version control

### Generating SSH Keys
1. **Using ssh-keygen**
   ```bash
   # Generate new key pair
   ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
   
   # Specify custom location
   ssh-keygen -t rsa -b 4096 -f ~/.ssh/aws-key
   ```

2. **Key File Permissions**
   ```bash
   # Set correct permissions
   chmod 700 ~/.ssh
   chmod 600 ~/.ssh/id_rsa
   chmod 644 ~/.ssh/id_rsa.pub
   touch ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   # Copy the public key from Server0 and paste it here
   cat id_rsa.pub >> ~/.ssh/authorized_keys
   ```

### SSH Config File Setup
1. **Basic Configuration**
   ```bash
   # Create or edit ~/.ssh/config
   Host aws-ubuntu
       HostName ec2-xx-xx-xx-xx.compute-1.amazonaws.com
       User ubuntu
       IdentityFile ~/.ssh/aws-key
       Port 22
   ```

2. **Advanced Configuration**
   ```bash
   Host aws-ubuntu
       HostName ec2-xx-xx-xx-xx.compute-1.amazonaws.com
       User ubuntu
       IdentityFile ~/.ssh/aws-key
       Port 22
       StrictHostKeyChecking no
       UserKnownHostsFile /dev/null
       ServerAliveInterval 60
       ServerAliveCountMax 3
   ```

### Connecting to EC2 Instances
1. **Using SSH Config**
   ```bash
   # Simple connection using config
   ssh aws-ubuntu
   ```

2. **Direct Connection**
   ```bash
   # Using key file directly
   ssh -i ~/.ssh/aws-key ubuntu@ec2-xx-xx-xx-xx.compute-1.amazonaws.com
   ```

### SSH Best Practices
1. **Key Management**
   - Use different keys for different services
   - Regularly rotate keys
   - Use strong passphrases
   - Backup keys securely

2. **Security**
   - Disable password authentication
   - Use non-standard SSH ports
   - Implement fail2ban
   - Regular security audits

3. **Troubleshooting**
   - Check key permissions
   - Verify SSH service status
   - Review SSH logs
   - Test connection with verbose mode
   ```bash
   ssh -v aws-ubuntu
   ```
## Creating a Windows Instance on AWS EC2

### Step 1: Launch Instance
1. **Access EC2 Dashboard**
   - Go to the AWS Management Console.
   - Navigate to the EC2 service.
   - Click “Launch Instance”.

2. **Choose an Amazon Machine Image (AMI)**
   - Select a Windows AMI, such as “Microsoft Windows Server 2022 Base” or “Microsoft Windows Server 2019 Base”.
   - Choose the appropriate architecture (usually 64-bit x86).

3. **Choose Instance Type**
   - Select an instance type (e.g., t2.micro for free tier, or a larger type for more resources).
   - Click “Next: Configure Instance Details”.

### Step 2: Configure Instance
1. **Network Settings**
   - Select your VPC and subnet.
   - Enable “Auto-assign Public IP” for remote access.

2. **Storage**
   - Default storage is usually 30GB for Windows.
   - Add more EBS volumes if needed.

3. **Security Group**
   - Create a new security group or select an existing one.
   - Allow RDP (Remote Desktop Protocol) on port 3389 from your IP or a trusted range.
   - (Optional) Allow other ports as needed (e.g., HTTP/HTTPS).

### Step 3: Review and Launch
1. **Review Instance Details**
   - Double-check all settings.

2. **Create or Select Key Pair**
   - Select an existing key pair or create a new one.
   - Download the `.pem` file and keep it secure (you'll need it to retrieve the Windows password).

3. **Launch Instance**
   - Click “Launch Instance”.
   - Wait for the instance to enter the “running” state.

### Step 4: Connect to Your Windows Instance
1. **Get the Administrator Password**
   - In the EC2 console, select your instance.
   - Click “Connect”, then “RDP Client”.
   - Click “Get Password”.
   - Upload your `.pem` key file to decrypt and reveal the Administrator password.

2. **Connect Using Remote Desktop**
   - Note the “Public DNS” or “IPv4 Public IP” of your instance.
   - Open Remote Desktop Connection (Windows: `mstsc`, Mac: Microsoft Remote Desktop app).
   - Enter the public DNS/IP and use “Administrator” as the username.
   - Paste the decrypted password.

### Step 5: Post-Launch Configuration
- **Change the Administrator password** after first login.
- **Install updates and required software**.
- **Configure Windows Firewall** as needed.
- **Set up additional users or roles** if required.

### Best Practices
- Restrict RDP access to trusted IPs only.
- Regularly update Windows and installed software.
- Use IAM roles for secure access to AWS resources.
- Enable CloudWatch monitoring for performance and security. 


---
# SSH Practice Project: Server-Client Authentication

## Project Overview
This project demonstrates SSH key-based authentication between two EC2 instances. We'll create two instances (Server0 and Client0) and set up SSH authentication from Client0 to Server0.

## Prerequisites
- AWS Account with EC2 access
- Basic understanding of EC2 instance creation
- SSH client installed on your local machine

## Step 1: Create EC2 Instances

### Create Server0
1. Launch a new EC2 instance:
   - AMI: Ubuntu Server 22.04 LTS
   - Instance Type: t2.micro (free tier eligible)
   - Name: Server0
   - Security Group: Allow SSH (Port 22) from your IP
   - Create new key pair: `server0-key.pem`

### Create Client0
1. Launch another EC2 instance:
   - AMI: Ubuntu Server 22.04 LTS
   - Instance Type: t2.micro (free tier eligible)
   - Name: Client0
   - Security Group: Allow SSH (Port 22) from your IP
   - Create new key pair: `client0-key.pem`

## Step 2: Generate SSH Keys on Server0

1. Connect to Server0:
   ```bash
   ssh -i server0-key.pem ubuntu@<server0-public-ip>
   ```

2. Generate SSH key pair:
   ```bash
   # Generate new SSH key pair
   ssh-keygen -t rsa -b 4096 -f ~/.ssh/server0_key
   
   # Set correct permissions
   chmod 700 ~/.ssh
   chmod 600 ~/.ssh/server0_key
   chmod 644 ~/.ssh/server0_key.pub
   ```

3. View the public key:
   ```bash
   cat ~/.ssh/server0_key.pub
   ```

## Step 3: Set Up SSH Authentication

1. Connect to Client0:
   ```bash
   ssh -i client0-key.pem ubuntu@<client0-public-ip>
   ```

2. Create SSH directory and authorized_keys file:
   ```bash
   mkdir -p ~/.ssh
   chmod 700 ~/.ssh
   touch ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   ```

3. Add Server0's public key to authorized_keys:
   ```bash
   # Open authorized_keys file with vim
   vim ~/.ssh/authorized_keys
   
   # In vim:
   # 1. Press 'i' to enter insert mode
   # 2. Paste the public key from Server0 (the output from 'cat ~/.ssh/server0_key.pub')
   # 3. Press 'Esc' to exit insert mode
   # 4. Type ':wq' and press Enter to save and quit
   ```

## Step 4: Test SSH Connection

1. From Client0, try connecting to Server0:
   ```bash
   ssh -i ~/.ssh/server0_key ubuntu@<server0-public-ip>
   ```

2. If connection fails, check:
   - Key permissions
   - Security group settings
   - Network connectivity
   - SSH service status on Server0

## Step 5: Configure SSH Config (Optional)

1. On Client0, create/edit SSH config:
   ```bash
   nano ~/.ssh/config
   ```

2. Add configuration:
   ```
   Host server0
       HostName <server0-public-ip>
       User ubuntu
       IdentityFile ~/.ssh/server0_key
       StrictHostKeyChecking no
   ```

3. Test connection using config:
   ```bash
   ssh server0
   ```

## Additional: Setting Up New User Authentication

### Step 1: Create New User on Server0
1. Connect to Server0 as ubuntu user:
   ```bash
   ssh -i server0-key.pem ubuntu@<server0-public-ip>
   ```

2. Create new user 'ganesh':
   ```bash
   # Create new user with root user
   adduser ganesh
   ```

### Step 2: Set Up SSH for New User
1. Switch to ganesh user:
   ```bash
   # Switch to ganesh user
   su - ganesh
   ```

2. Create SSH directory and generate keys:
   ```bash
   # Create .ssh directory
   mkdir -p ~/.ssh
   
   # Set correct permissions
   chmod 700 ~/.ssh
   
   # Generate SSH key pair
   ssh-keygen -t rsa -b 4096 -f ~/.ssh/ganesh_key
   
   # Set correct permissions for keys
   chmod 600 ~/.ssh/ganesh_key
   chmod 644 ~/.ssh/ganesh_key.pub
   ```

3. Create and set up authorized_keys:
   ```bash
   # Create authorized_keys file
   touch ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   
   # View the public key to copy
   cat ~/.ssh/ganesh_key.pub >> ~/.ssh/authorized_keys
   ```

### Step 3: Set Up Client0 for New User
1. Connect to Client0:
   ```bash
   ssh -i client0-key.pem ubuntu@<client0-public-ip>
   ```

2. Copy ganesh's private key to Client0:
   ```bash   
   # Copy the private key from Server0 to Client0
   # You can use scp or manually copy the contents of ~/.ssh/ganesh_key
   # from Server0 to ~/.ssh/ganesh_key on Client0
   
   # Set correct permissions for the key
   chmod 600 ganesh_key
   ```

3. Test connection to Server0 as ganesh:
   ```bash
   # Simple SSH command to connect as ganesh
   ssh -i ~/.ssh/ganesh_key ganesh@<server0-public-ip>
   ```

4. (Optional) Create SSH config for easier connection:
   ```bash
   # Create or edit SSH config
   vim ~/.ssh/config
   
   # Add the following configuration:
   Host server0-ganesh
       HostName <server0-public-ip>
       User ganesh
       IdentityFile ~/.ssh/ganesh_key
       StrictHostKeyChecking no
   
   # Now you can connect simply with:
   ssh server0-ganesh
   ```

### Troubleshooting New User Setup
1. Permission issues:
   ```bash
   # Check directory permissions
   ls -la ~/.ssh
   
   # Check file permissions
   ls -la ~/.ssh/authorized_keys
   
   # Fix permissions if needed
   chmod 700 ~/.ssh
   chmod 600 ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/ganesh_key
   chmod 644 ~/.ssh/ganesh_key.pub
   ```

2. SSH service issues:
   ```bash
   # Check SSH service status
   sudo systemctl status ssh
   
   # Check SSH logs for errors
   sudo tail -f /var/log/auth.log
   ```

## Troubleshooting

### Common Issues
1. Permission denied:
   - Check key file permissions
   - Verify authorized_keys content
   - Ensure correct user permissions

2. Connection refused:
   - Verify security group settings
   - Check if SSH service is running
   - Confirm instance is running

3. Host key verification failed:
   - Use `-o StrictHostKeyChecking=no` for first connection
   - Clear known_hosts if needed

### Debug Commands
```bash
# Check SSH service status
sudo systemctl status ssh

# View SSH logs
sudo tail -f /var/log/auth.log

# Test SSH connection with verbose output
ssh -v -i ~/.ssh/server0_key ubuntu@<server0-private-ip>
```

## Security Best Practices
1. Use strong key passphrases
2. Regularly rotate SSH keys
3. Limit SSH access to specific IPs
4. Use non-standard SSH ports
5. Implement fail2ban for brute force protection
6. Keep systems updated

## Clean Up
1. Terminate both EC2 instances
2. Delete key pairs from AWS
3. Remove local key files 