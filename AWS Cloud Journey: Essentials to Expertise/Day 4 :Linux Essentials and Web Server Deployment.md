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

---
# Web Servers in Linux: A Comprehensive Guide

## Table of Contents
1. [Introduction to Web Servers](#introduction)
2. [Popular Web Servers](#popular-web-servers)
3. [Nginx Deep Dive](#nginx-deep-dive)
4. [Installation and Configuration](#installation-and-configuration)
5. [Security Best Practices](#security-best-practices)
6. [Performance Optimization](#performance-optimization)
7. [Troubleshooting](#troubleshooting)

## Introduction
A web server is software that serves web pages to clients using HTTP/HTTPS protocols. It handles requests from browsers and serves static or dynamic content.

## Popular Web Servers
1. **Nginx**
   - High-performance, event-driven architecture
   - Excellent for static content and reverse proxy
   - Low memory footprint
   - Built for high concurrency

2. **Apache**
   - Process-driven architecture
   - Highly configurable
   - Extensive module system
   - Good for dynamic content

3. **Lighttpd**
   - Lightweight and fast
   - Low memory footprint
   - Good for embedded systems

## Nginx Deep Dive

### Architecture
1. **Master Process**
   - Reads and validates configuration
   - Manages worker processes
   - Handles signals

2. **Worker Processes**
   - Handle actual requests
   - Event-driven model
   - Non-blocking I/O

### Key Features
1. **Static File Serving**
   - Efficient file handling
   - Sendfile support
   - Direct I/O

2. **Reverse Proxy**
   - Load balancing
   - SSL termination
   - Caching

3. **HTTP Features**
   - HTTP/2 support
   - WebSocket proxy
   - Gzip compression

## Installation and Configuration

### Installation
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install epel-release
sudo yum install nginx

# Verify installation
nginx -v
```

### Basic Configuration
1. **Main Configuration File**
   ```bash
   # Location: /etc/nginx/nginx.conf
   
   # Basic structure
   user nginx;
   worker_processes auto;
   error_log /var/log/nginx/error.log;
   pid /run/nginx.pid;
   
   events {
       worker_connections 1024;
   }
   
   http {
       include /etc/nginx/mime.types;
       default_type application/octet-stream;
       
       # Logging settings
       access_log /var/log/nginx/access.log;
       
       # Server blocks
       include /etc/nginx/conf.d/*.conf;
   }
   ```

2. **Server Block Example**
   ```nginx
   server {
       listen 80;
       server_name example.com;
       root /var/www/html;
       
       location / {
           index index.html index.htm;
       }
       
       location /api {
           proxy_pass http://localhost:3000;
       }
   }
   ```

### Common Directives
1. **Server Configuration**
   - `listen`: Port and IP address
   - `server_name`: Domain names
   - `root`: Document root
   - `index`: Default files

2. **Location Blocks**
   - `location /`: URL matching
   - `proxy_pass`: Reverse proxy
   - `try_files`: File existence check
   - `rewrite`: URL rewriting

## Security Best Practices

### SSL/TLS Configuration
```nginx
server {
    listen 443 ssl;
    server_name example.com;
    
    ssl_certificate /etc/nginx/ssl/example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
}
```

### Security Headers
```nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-XSS-Protection "1; mode=block";
add_header X-Content-Type-Options "nosniff";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
```

### Access Control
```nginx
# IP-based access
allow 192.168.1.0/24;
deny all;

# Basic authentication
auth_basic "Restricted Area";
auth_basic_user_file /etc/nginx/.htpasswd;
```

## Performance Optimization

### Caching
```nginx
# Browser caching
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 30d;
    add_header Cache-Control "public, no-transform";
}

# Proxy caching
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=10g inactive=60m;
```

### Compression
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
gzip_min_length 1000;
```

### Worker Configuration
```nginx
worker_processes auto;
worker_rlimit_nofile 65535;
events {
    worker_connections 1024;
    multi_accept on;
    use epoll;
}
```

## Troubleshooting

### Common Issues
1. **Permission Problems**
   ```bash
   # Check file permissions
   ls -la /var/www/html
   
   # Fix permissions
   sudo chown -R nginx:nginx /var/www/html
   sudo chmod -R 755 /var/www/html
   ```

2. **Configuration Testing**
   ```bash
   # Test configuration
   nginx -t
   
   # Reload configuration
   sudo systemctl reload nginx
   ```

3. **Log Analysis**
   ```bash
   # Error log
   sudo tail -f /var/log/nginx/error.log
   
   # Access log
   sudo tail -f /var/log/nginx/access.log
   ```

### Performance Monitoring
1. **Status Module**
   ```nginx
   location /nginx_status {
       stub_status on;
       access_log off;
       allow 127.0.0.1;
       deny all;
   }
   ```

2. **Monitoring Tools**
   - `htop`: Process monitoring
   - `netstat`: Connection monitoring
   - `iftop`: Network traffic monitoring

## Additional Resources
1. [Nginx Official Documentation](https://nginx.org/en/docs/)
2. [Nginx Configuration Generator](https://www.digitalocean.com/community/tools/nginx)
3. [Nginx Security Headers](https://securityheaders.com)
4. [Nginx Performance Tuning](https://www.nginx.com/blog/tuning-nginx/) 