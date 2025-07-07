# Docker Commands - Complete Guide

## Table of Contents
1. [Docker Container Commands Overview](#docker-container-commands-overview)
2. [Essential Commands for Container Management](#essential-commands-for-container-management)
3. [Creating and Running Containers](#creating-and-running-containers)
4. [Container Lifecycle Management](#container-lifecycle-management)
5. [Exposing Applications to the World](#exposing-applications-to-the-world)
6. [Interacting with Containers](#interacting-with-containers)
7. [Inspection and Troubleshooting](#inspection-and-troubleshooting)
8. [File Operations](#file-operations)
9. [Monitoring and Logs](#monitoring-and-logs)
10. [Advanced Container Operations](#advanced-container-operations)

---

## Docker Container Commands Overview

### What are Docker Commands?
Docker commands are instructions used to manage Docker containers, images, networks, and volumes. They allow you to create, run, stop, and manage containerized applications.

### Command Structure
```bash
docker [command] [subcommand] [options] [arguments]
```

### Common Command Categories
- **Container Management**: Create, start, stop, remove containers
- **Image Management**: Build, pull, push, tag images
- **Network Management**: Create, inspect, connect networks
- **Volume Management**: Create, mount, backup volumes
- **System Management**: Info, stats, system cleanup

---

## Essential Commands for Container Management

### Basic Container Operations

#### **docker run** - Create and Start a Container
```bash
# Basic run command
docker run [OPTIONS] IMAGE [COMMAND] [ARG...]

# Run a container in detached mode
docker run -d nginx

# Run with a specific name
docker run --name my-container nginx

# Run with port mapping
docker run -p 8080:80 nginx

# Run with environment variables
docker run -e VARIABLE_NAME=value nginx

# Run with volume mounting
docker run -v /host/path:/container/path nginx
```

#### **docker create** - Create a Container Without Starting
```bash
# Create a container
docker create nginx

# Create with specific name
docker create --name my-container nginx

# Create with port mapping
docker create -p 8080:80 nginx

# Create with environment variables
docker create -e DB_HOST=localhost nginx
```

#### **docker start** - Start an Existing Container
```bash
# Start a container by name
docker start my-container

# Start a container by ID
docker start abc123def456

# Start multiple containers
docker start container1 container2 container3

# Start with additional options
docker start -a my-container  # Attach to container
```

#### **docker stop** - Stop a Running Container
```bash
# Stop a container by name
docker stop my-container

# Stop a container by ID
docker stop abc123def456

# Stop multiple containers
docker stop container1 container2 container3

# Force stop (SIGKILL)
docker stop --time=0 my-container
```

#### **docker rm** - Remove a Container
```bash
# Remove a stopped container
docker rm my-container

# Force remove a running container
docker rm -f my-container

# Remove multiple containers
docker rm container1 container2 container3

# Remove all stopped containers
docker container prune
```

#### **docker ps** - List Containers
```bash
# List running containers
docker ps

# List all containers (running and stopped)
docker ps -a

# List containers with specific format
docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Status}}"

# List containers with size
docker ps -s

# List containers with labels
docker ps --filter "label=environment=production"
```

---

## Creating and Running Containers

### Docker Run Command Options

#### **Detached Mode (-d)**
```bash
# Run container in background
docker run -d nginx

# Run with name in detached mode
docker run -d --name web-server nginx

# Run with port mapping in detached mode
docker run -d -p 8080:80 nginx
```

#### **Port Mapping (-p, -P)**
```bash
# Map specific port
docker run -p 8080:80 nginx

# Map multiple ports
docker run -p 8080:80 -p 443:443 nginx

# Map port with specific IP
docker run -p 127.0.0.1:8080:80 nginx

# Expose all ports (-P)
docker run -P nginx
```

#### **Environment Variables (-e)**
```bash
# Set single environment variable
docker run -e DB_HOST=localhost nginx

# Set multiple environment variables
docker run -e DB_HOST=localhost -e DB_PORT=5432 nginx

# Set from file
docker run --env-file .env nginx

# Pass all host environment variables
docker run --env-file .env nginx
```

#### **Container Naming (--name)**
```bash
# Run with specific name
docker run --name my-web-server nginx

# Run with name in detached mode
docker run -d --name web-app nginx

# Run with name and port mapping
docker run -d --name web-server -p 8080:80 nginx
```

### Container Creation Examples

#### **Web Application Container**
```bash
# Run a web server
docker run -d --name web-server -p 8080:80 nginx

# Run with custom configuration
docker run -d --name web-server \
  -p 8080:80 \
  -v /host/nginx.conf:/etc/nginx/nginx.conf \
  nginx
```

#### **Database Container**
```bash
# Run PostgreSQL database
docker run -d --name postgres-db \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -e POSTGRES_DB=mydatabase \
  -p 5432:5432 \
  postgres:13

# Run MySQL database
docker run -d --name mysql-db \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=mydatabase \
  -p 3306:3306 \
  mysql:8.0
```

#### **Application Container**
```bash
# Run Node.js application
docker run -d --name node-app \
  -p 3000:3000 \
  -e NODE_ENV=production \
  my-node-app:latest

# Run Python application
docker run -d --name python-app \
  -p 5000:5000 \
  -e FLASK_ENV=production \
  my-python-app:latest
```

---

## Container Lifecycle Management

### Starting and Stopping Containers

#### **Start Commands**
```bash
# Start a container
docker start my-container

# Start and attach to container
docker start -a my-container

# Start with interactive mode
docker start -i my-container

# Start with pseudo-TTY
docker start -it my-container
```

#### **Stop Commands**
```bash
# Stop a container gracefully
docker stop my-container

# Stop with timeout
docker stop --time=30 my-container

# Force stop (immediate)
docker stop --time=0 my-container

# Stop multiple containers
docker stop container1 container2 container3
```

#### **Restart Commands**
```bash
# Restart a container
docker restart my-container

# Restart with timeout
docker restart --time=30 my-container

# Restart multiple containers
docker restart container1 container2 container3
```

### Container Removal

#### **Remove Commands**
```bash
# Remove a stopped container
docker rm my-container

# Force remove running container
docker rm -f my-container

# Remove with volumes
docker rm -v my-container

# Remove multiple containers
docker rm container1 container2 container3

# Remove all stopped containers
docker container prune
```

#### **Bulk Operations**
```bash
# Stop all running containers
docker stop $(docker ps -q)

# Remove all containers
docker rm $(docker ps -aq)

# Remove all images
docker rmi $(docker images -q)

# Clean up everything
docker system prune -a
```

---

## Exposing Applications to the World

### Port Mapping Strategies

#### **Basic Port Mapping**
```bash
# Map container port 80 to host port 8080
docker run -p 8080:80 nginx

# Map container port 3000 to host port 3000
docker run -p 3000:3000 node-app

# Map multiple ports
docker run -p 8080:80 -p 443:443 nginx
```

#### **Advanced Port Mapping**
```bash
# Bind to specific IP
docker run -p 127.0.0.1:8080:80 nginx

# Use random host port
docker run -P nginx

# Map UDP port
docker run -p 8080:80/udp nginx

# Map TCP port explicitly
docker run -p 8080:80/tcp nginx
```

#### **Network Exposure**
```bash
# Run with host networking
docker run --network host nginx

# Run with bridge networking
docker run --network bridge nginx

# Run with custom network
docker run --network my-network nginx
```

### Web Application Examples

#### **Nginx Web Server**
```bash
# Run nginx with port mapping
docker run -d --name web-server \
  -p 80:80 \
  -p 443:443 \
  nginx

# Run with custom configuration
docker run -d --name web-server \
  -p 80:80 \
  -v /host/nginx.conf:/etc/nginx/nginx.conf \
  nginx
```

#### **Node.js Application**
```bash
# Run Node.js app
docker run -d --name node-app \
  -p 3000:3000 \
  -e NODE_ENV=production \
  my-node-app

# Run with volume for development
docker run -d --name node-dev \
  -p 3000:3000 \
  -v /host/app:/app \
  node-app
```

#### **Python Flask Application**
```bash
# Run Flask app
docker run -d --name flask-app \
  -p 5000:5000 \
  -e FLASK_ENV=production \
  my-flask-app

# Run with environment file
docker run -d --name flask-app \
  -p 5000:5000 \
  --env-file .env \
  my-flask-app
```

---

## Interacting with Containers

### Docker Exec Command

#### **Basic Exec Usage**
```bash
# Execute command in running container
docker exec my-container ls /app

# Execute interactive shell
docker exec -it my-container /bin/bash

# Execute with specific user
docker exec -u root my-container /bin/bash

# Execute with environment variables
docker exec -e DEBUG=1 my-container /bin/bash
```

#### **Interactive Mode (-it)**
```bash
# Start interactive bash shell
docker exec -it my-container /bin/bash

# Start interactive sh shell
docker exec -it my-container /bin/sh

# Start interactive python shell
docker exec -it my-container python

# Start interactive node shell
docker exec -it my-container node
```

#### **Exec Examples**
```bash
# Check container logs
docker exec my-container tail -f /var/log/app.log

# Install packages
docker exec my-container apt-get update

# Copy files within container
docker exec my-container cp /source/file /destination/

# Run database commands
docker exec postgres-db psql -U postgres -d mydatabase
```

### Container Interaction Examples

#### **Database Container Interaction**
```bash
# Connect to PostgreSQL
docker exec -it postgres-db psql -U postgres

# Run SQL commands
docker exec postgres-db psql -U postgres -c "SELECT * FROM users;"

# Backup database
docker exec postgres-db pg_dump -U postgres mydatabase > backup.sql
```

#### **Web Application Interaction**
```bash
# Check application logs
docker exec web-app tail -f /var/log/nginx/access.log

# Test application
docker exec web-app curl http://localhost:3000

# Update application files
docker exec web-app git pull origin main

# Restart application service
docker exec web-app systemctl restart myapp
```

#### **Development Container Interaction**
```bash
# Install development dependencies
docker exec dev-container npm install

# Run tests
docker exec dev-container npm test

# Build application
docker exec dev-container npm run build

# Start development server
docker exec dev-container npm run dev
```

---

## Inspection and Troubleshooting

### Docker Inspect Command

#### **Basic Inspection**
```bash
# Inspect container details
docker inspect my-container

# Inspect specific field
docker inspect -f '{{.State.Status}}' my-container

# Inspect network settings
docker inspect -f '{{.NetworkSettings.IPAddress}}' my-container

# Inspect mounted volumes
docker inspect -f '{{.Mounts}}' my-container
```

#### **Advanced Inspection**
```bash
# Inspect container configuration
docker inspect -f '{{.Config}}' my-container

# Inspect container environment
docker inspect -f '{{.Config.Env}}' my-container

# Inspect container ports
docker inspect -f '{{.NetworkSettings.Ports}}' my-container

# Inspect container labels
docker inspect -f '{{.Config.Labels}}' my-container
```

#### **Inspection Examples**
```bash
# Get container IP address
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' my-container

# Get container status
docker inspect -f '{{.State.Status}}' my-container

# Get container image
docker inspect -f '{{.Config.Image}}' my-container

# Get container command
docker inspect -f '{{.Config.Cmd}}' my-container
```

### Troubleshooting Commands

#### **Container Status**
```bash
# Check container status
docker ps -a

# Check container logs
docker logs my-container

# Check container stats
docker stats my-container

# Check container processes
docker top my-container
```

#### **Network Troubleshooting**
```bash
# Check container network
docker network inspect bridge

# Check container IP
docker inspect -f '{{.NetworkSettings.IPAddress}}' my-container

# Test network connectivity
docker exec my-container ping google.com

# Check port bindings
docker port my-container
```

#### **Resource Troubleshooting**
```bash
# Check container resource usage
docker stats my-container

# Check container disk usage
docker system df

# Check container memory usage
docker stats --no-stream my-container

# Check container CPU usage
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

---

## File Operations

### Docker CP Command

#### **Copy Files to Container**
```bash
# Copy file to container
docker cp local-file.txt my-container:/app/

# Copy directory to container
docker cp /local/directory/ my-container:/app/

# Copy with specific permissions
docker cp --chown=user:group file.txt my-container:/app/
```

#### **Copy Files from Container**
```bash
# Copy file from container
docker cp my-container:/app/file.txt ./local-file.txt

# Copy directory from container
docker cp my-container:/app/logs/ ./local-logs/

# Copy with specific user
docker cp --chown=user:group my-container:/app/file.txt ./local-file.txt
```

#### **CP Examples**
```bash
# Copy configuration file
docker cp nginx.conf web-container:/etc/nginx/nginx.conf

# Copy application files
docker cp ./src/ app-container:/app/src/

# Copy logs from container
docker cp app-container:/var/log/app.log ./app.log

# Copy database backup
docker cp postgres-container:/backup/db.sql ./backup/
```

### Volume Operations

#### **Volume Mounting**
```bash
# Mount host directory
docker run -v /host/path:/container/path nginx

# Mount with read-only
docker run -v /host/path:/container/path:ro nginx

# Mount named volume
docker run -v my-volume:/container/path nginx

# Mount with specific permissions
docker run -v /host/path:/container/path:rw nginx
```

---

## Monitoring and Logs

### Docker Logs Command

#### **Basic Log Viewing**
```bash
# View container logs
docker logs my-container

# Follow logs in real-time
docker logs -f my-container

# Show last N lines
docker logs --tail=100 my-container

# Show logs with timestamps
docker logs -t my-container
```

#### **Advanced Log Options**
```bash
# Show logs since specific time
docker logs --since="2024-01-15T10:00:00" my-container

# Show logs until specific time
docker logs --until="2024-01-15T11:00:00" my-container

# Show logs with specific format
docker logs --format="table {{.Timestamp}}\t{{.Log}}" my-container

# Show logs for multiple containers
docker logs container1 container2
```

### Docker Stats Command

#### **Resource Monitoring**
```bash
# Monitor container stats
docker stats my-container

# Monitor all containers
docker stats

# Monitor with specific format
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Monitor without streaming
docker stats --no-stream my-container
```

#### **Stats Examples**
```bash
# Monitor specific containers
docker stats web-container db-container

# Monitor with custom format
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

# Monitor with timestamps
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.Timestamp}}"
```

---

## Advanced Container Operations

### Container Management

#### **Container Updates**
```bash
# Update container image
docker pull new-image:latest
docker stop old-container
docker rm old-container
docker run -d --name new-container new-image:latest

# Update with same configuration
docker update --memory=512m my-container

# Update container restart policy
docker update --restart=unless-stopped my-container
```

#### **Container Backup**
```bash
# Export container to tar file
docker export my-container > container-backup.tar

# Import container from tar file
docker import container-backup.tar my-image:latest

# Commit container changes
docker commit my-container my-image:latest

# Save container image
docker save my-image:latest > image-backup.tar
```

### Container Networking

#### **Network Commands**
```bash
# Create custom network
docker network create my-network

# Connect container to network
docker network connect my-network my-container

# Disconnect container from network
docker network disconnect my-network my-container

# Inspect network
docker network inspect my-network
```

#### **Network Examples**
```bash
# Run container with custom network
docker run -d --name web-app --network my-network nginx

# Connect to multiple networks
docker network connect network1 my-container
docker network connect network2 my-container

# Run with host networking
docker run --network host nginx
```

### Container Security

#### **Security Commands**
```bash
# Run container with read-only root filesystem
docker run --read-only nginx

# Run container with specific user
docker run -u 1000:1000 nginx

# Run container with security options
docker run --security-opt=no-new-privileges nginx

# Run container with capabilities
docker run --cap-add=SYS_ADMIN nginx
```

---

## Best Practices

### Container Management
- ✅ Always use meaningful container names
- ✅ Use specific image tags instead of 'latest'
- ✅ Clean up unused containers and images
- ✅ Monitor container resource usage
- ✅ Use health checks for critical containers

### Security Practices
- ✅ Run containers as non-root user when possible
- ✅ Use read-only filesystems for stateless applications
- ✅ Limit container capabilities
- ✅ Scan images for vulnerabilities
- ✅ Use secrets management for sensitive data

### Performance Practices
- ✅ Use multi-stage builds for smaller images
- ✅ Optimize layer caching
- ✅ Use appropriate base images
- ✅ Monitor container performance
- ✅ Use resource limits

### Troubleshooting Tips
- ✅ Check container logs first
- ✅ Use `docker inspect` for detailed information
- ✅ Verify network connectivity
- ✅ Check resource usage with `docker stats`
- ✅ Use `docker exec` for interactive debugging

---

## Summary

This guide covers the essential Docker commands for container management:

### **Core Commands**
- `docker run`: Create and start containers
- `docker create`: Create containers without starting
- `docker start/stop`: Manage container lifecycle
- `docker rm`: Remove containers
- `docker ps`: List containers

### **Interaction Commands**
- `docker exec`: Execute commands in running containers
- `docker logs`: View container logs
- `docker cp`: Copy files to/from containers

### **Inspection Commands**
- `docker inspect`: Get detailed container information
- `docker stats`: Monitor resource usage
- `docker top`: View container processes

### **Key Options**
- `-d`: Detached mode
- `-p/-P`: Port mapping
- `-e`: Environment variables
- `--name`: Container naming
- `-it`: Interactive mode
- `-v`: Volume mounting

Mastering these commands will give you full control over Docker containers and enable you to effectively manage containerized applications in development and production environments. 