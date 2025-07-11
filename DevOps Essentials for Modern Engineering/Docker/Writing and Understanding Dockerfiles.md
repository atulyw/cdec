# Dockerfile Complete Guide: Beginner to Intermediate

## Table of Contents
1. [What is a Dockerfile?](#what-is-a-dockerfile)
2. [Dockerfile Structure and Components](#dockerfile-structure-and-components)
3. [Essential Dockerfile Instructions](#essential-dockerfile-instructions)
4. [Advanced Dockerfile Techniques](#advanced-dockerfile-techniques)
5. [Best Practices](#best-practices)
6. [Common Use Cases](#common-use-cases)
7. [Troubleshooting](#troubleshooting)

---

## What is a Dockerfile?

### Definition
A **Dockerfile** is a text file that contains a series of instructions and arguments that tell Docker how to build a container image. It serves as a blueprint or recipe for creating Docker images.

### Key Concepts
- **Image**: A lightweight, standalone, executable package that includes everything needed to run an application
- **Container**: A running instance of an image
- **Layer**: Each instruction in a Dockerfile creates a new layer in the image
- **Base Image**: The starting point for your Docker image (e.g., Ubuntu, Node.js, Python)

### Why Use Dockerfiles?
1. **Reproducibility**: Ensures consistent environments across different machines
2. **Version Control**: Track changes to your application environment
3. **Automation**: Automate the build process
4. **Portability**: Run applications anywhere Docker is installed

---

## Dockerfile Structure and Components

### Basic Structure
```dockerfile
# Comments start with #
FROM base-image:tag
LABEL maintainer="your-email@example.com"
WORKDIR /app
COPY source destination
RUN command
EXPOSE port
CMD ["executable", "param1", "param2"]
```

### File Naming Convention
- **Standard**: `Dockerfile` (case-sensitive)
- **Alternative**: `dockerfile` or custom names like `Dockerfile.dev`

---

## Essential Dockerfile Instructions

### 1. FROM Instruction

#### Definition
Specifies the base image to use as the starting point for your Docker image.

#### Syntax
```dockerfile
FROM <image>[:<tag>] [AS <name>]
```

#### Examples
```dockerfile
# Use latest Ubuntu
FROM ubuntu:latest

# Use specific version
FROM python:3.9-slim

# Use with alias for multi-stage builds
FROM node:16 AS builder
```

#### Best Practices
- Always specify a tag (avoid `latest` in production)
- Use official images when possible
- Choose minimal base images (alpine, slim variants)

### 2. LABEL Instruction

#### Definition
Adds metadata to your Docker image in key-value format.

#### Syntax
```dockerfile
LABEL <key>=<value> <key>=<value> ...
```

#### Examples
```dockerfile
LABEL maintainer="john@example.com"
LABEL version="1.0"
LABEL description="My application"

# Multiple labels
LABEL maintainer="john@example.com" \
      version="1.0" \
      description="My application"
```

### 3. WORKDIR Instruction

#### Definition
Sets the working directory for any subsequent instructions (RUN, CMD, ENTRYPOINT, COPY, ADD).

#### Syntax
```dockerfile
WORKDIR /path/to/working/directory
```

#### Examples
```dockerfile
WORKDIR /app
WORKDIR /usr/src/app
```

#### Important Notes
- Creates directory if it doesn't exist
- Can be used multiple times
- Relative paths are relative to previous WORKDIR

### 4. COPY Instruction

#### Definition
Copies files and directories from the host filesystem into the Docker image.

#### Syntax
```dockerfile
COPY <source> <destination>
```

#### Examples
```dockerfile
# Copy single file
COPY package.json /app/

# Copy entire directory
COPY . /app/

# Copy with wildcards
COPY *.js /app/

# Copy with specific permissions
COPY --chown=user:group file.txt /app/
```

#### Best Practices
- Use `.dockerignore` to exclude unnecessary files
- Copy dependency files first (for better layer caching)
- Be specific about what you copy

### 5. ADD Instruction

#### Definition
Similar to COPY but with additional features like automatic extraction of compressed files and support for URLs.

#### Syntax
```dockerfile
ADD <source> <destination>
```

#### Examples
```dockerfile
# Copy and extract tar file
ADD archive.tar.gz /app/

# Copy from URL
ADD https://example.com/file.txt /app/

# Copy with wildcards
ADD *.txt /app/
```

#### When to Use ADD vs COPY
- **Use COPY** for simple file copying
- **Use ADD** when you need URL support or automatic extraction

### 6. RUN Instruction

#### Definition
Executes commands in a new layer on top of the current image and commits the results.

#### Syntax
```dockerfile
RUN <command> (shell form)
RUN ["executable", "param1", "param2"] (exec form)
```

#### Examples
```dockerfile
# Shell form
RUN apt-get update && apt-get install -y python3

# Exec form
RUN ["apt-get", "update"]
RUN ["apt-get", "install", "-y", "python3"]

# Multi-line for readability
RUN apt-get update && \
    apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*
```

#### Best Practices
- Combine multiple commands with `&&` to reduce layers
- Clean up package manager cache
- Use exec form for better performance

### 7. ENV Instruction

#### Definition
Sets environment variables that will be available during build time and runtime.

#### Syntax
```dockerfile
ENV <key>=<value>
ENV <key> <value>
```

#### Examples
```dockerfile
# Single variable
ENV NODE_ENV=production

# Multiple variables
ENV NODE_ENV=production \
    PORT=3000 \
    DATABASE_URL=postgresql://localhost:5432/mydb
```

### 8. EXPOSE Instruction

#### Definition
Documents which ports the container listens on at runtime (doesn't actually publish the port).

#### Syntax
```dockerfile
EXPOSE <port> [<port>/<protocol>]
```

#### Examples
```dockerfile
EXPOSE 3000
EXPOSE 80/tcp
EXPOSE 443/tcp 80/tcp
```

#### Important Notes
- This is documentation only
- Use `-p` flag with `docker run` to actually publish ports
- Default protocol is TCP

### 9. CMD Instruction

#### Definition
Provides default command to run when container starts (can be overridden).

#### Syntax
```dockerfile
CMD ["executable", "param1", "param2"] (exec form, preferred)
CMD command param1 param2 (shell form)
CMD ["param1", "param2"] (as default parameters to ENTRYPOINT)
```

#### Examples
```dockerfile
# Exec form (recommended)
CMD ["node", "app.js"]

# Shell form
CMD node app.js

# With parameters
CMD ["npm", "start"]
```

#### Important Notes
- Only the last CMD in a Dockerfile is used
- Can be overridden with `docker run` command
- Use exec form to avoid shell processing

### 10. ENTRYPOINT Instruction

#### Definition
Configures a container to run as an executable (cannot be overridden easily).

#### Syntax
```dockerfile
ENTRYPOINT ["executable", "param1", "param2"] (exec form, preferred)
ENTRYPOINT command param1 param2 (shell form)
```

#### Examples
```dockerfile
# Exec form
ENTRYPOINT ["node", "app.js"]

# Shell form
ENTRYPOINT node app.js

# With CMD for default parameters
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["--help"]
```

#### CMD vs ENTRYPOINT
- **CMD**: Default command, easily overridden
- **ENTRYPOINT**: Container's main executable, harder to override

### Detailed Comparison: CMD vs ENTRYPOINT

#### When to Use Each Instruction

| Aspect | CMD | ENTRYPOINT |
|--------|-----|------------|
| **Purpose** | Default command that can be easily overridden | Main executable that defines container behavior |
| **Override** | Easy to override with `docker run` | Harder to override, requires `--entrypoint` |
| **Use Case** | Default parameters for application | Main application executable |
| **Flexibility** | High - can be completely changed | Low - executable is fixed, only parameters change |
| **Best For** | Providing default behavior | Making container behave like a specific command |

#### Practical Examples

##### Example 1: Basic Usage
```dockerfile
# Using CMD
FROM ubuntu:20.04
CMD ["echo", "Hello World"]

# Using ENTRYPOINT
FROM ubuntu:20.04
ENTRYPOINT ["echo"]
CMD ["Hello World"]
```

**Usage:**
```bash
# CMD example - easily overridden
docker run image-name                    # Output: Hello World
docker run image-name echo "Goodbye"     # Output: Goodbye

# ENTRYPOINT example - executable fixed
docker run image-name                    # Output: Hello World
docker run image-name "Goodbye"          # Output: Goodbye
docker run --entrypoint="" image-name echo "Goodbye"  # Output: Goodbye
```

##### Example 2: Application Server
```dockerfile
# Using CMD for Node.js app
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "app.js"]

# Using ENTRYPOINT for Node.js app
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
ENTRYPOINT ["node"]
CMD ["app.js"]
```

**Usage:**
```bash
# CMD version
docker run myapp                        # Runs: node app.js
docker run myapp npm start              # Runs: npm start

# ENTRYPOINT version
docker run myapp                        # Runs: node app.js
docker run myapp server.js              # Runs: node server.js
```

##### Example 3: Database with Sleep
```dockerfile
# Using CMD with sleep
FROM mysql:8.0
ENV MYSQL_ROOT_PASSWORD=password
EXPOSE 3306
CMD ["mysqld"]

# Using ENTRYPOINT with sleep
FROM ubuntu:20.04
ENTRYPOINT ["sleep"]
CMD ["30"]
```

**Usage:**
```bash
# CMD version - can run different commands
docker run mysql-image                   # Runs: mysqld
docker run mysql-image sleep 60         # Runs: sleep 60

# ENTRYPOINT version - sleep is always the executable
docker run sleep-image                   # Runs: sleep 30
docker run sleep-image 60               # Runs: sleep 60
```

##### Example 4: Shell Script with Parameters
```dockerfile
# Using CMD
FROM ubuntu:20.04
COPY script.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/script.sh
CMD ["/usr/local/bin/script.sh", "default-param"]

# Using ENTRYPOINT
FROM ubuntu:20.04
COPY script.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/script.sh
ENTRYPOINT ["/usr/local/bin/script.sh"]
CMD ["default-param"]
```

**Usage:**
```bash
# CMD version
docker run script-image                  # Runs: script.sh default-param
docker run script-image custom-param    # Runs: script.sh custom-param

# ENTRYPOINT version
docker run script-image                  # Runs: script.sh default-param
docker run script-image custom-param    # Runs: script.sh custom-param
```

#### Advanced Examples

##### Example 5: Multi-command Container
```dockerfile
# Using CMD for flexible command execution
FROM ubuntu:20.04
RUN apt-get update && apt-get install -y curl wget
CMD ["bash"]

# Using ENTRYPOINT for specific tool
FROM ubuntu:20.04
RUN apt-get update && apt-get install -y curl
ENTRYPOINT ["curl"]
CMD ["--help"]
```

**Usage:**
```bash
# CMD version - can run any command
docker run -it multi-tool bash          # Interactive bash shell
docker run multi-tool curl google.com   # Run curl command

# ENTRYPOINT version - always runs curl
docker run curl-tool                     # Shows curl help
docker run curl-tool google.com          # Curls google.com
```

##### Example 6: Health Check with Sleep
```dockerfile
# Health check using CMD
FROM ubuntu:20.04
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1
CMD ["sleep", "infinity"]

# Health check using ENTRYPOINT
FROM ubuntu:20.04
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1
ENTRYPOINT ["sleep"]
CMD ["infinity"]
```

##### Example 7: Development vs Production
```dockerfile
# Development with CMD
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Production with ENTRYPOINT
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
ENTRYPOINT ["node"]
CMD ["app.js"]
```

#### Shell Form vs Exec Form

| Form | CMD Example | ENTRYPOINT Example |
|------|-------------|-------------------|
| **Shell Form** | `CMD echo "Hello"` | `ENTRYPOINT echo "Hello"` |
| **Exec Form** | `CMD ["echo", "Hello"]` | `ENTRYPOINT ["echo", "Hello"]` |

**Key Differences:**
- **Shell Form**: Runs in shell (`/bin/sh -c`), supports shell features
- **Exec Form**: Runs directly, no shell processing, better signal handling

#### Signal Handling Examples
```dockerfile
# CMD with shell form (poor signal handling)
FROM ubuntu:20.04
CMD sleep 100

# CMD with exec form (good signal handling)
FROM ubuntu:20.04
CMD ["sleep", "100"]

# ENTRYPOINT with exec form (best signal handling)
FROM ubuntu:20.04
ENTRYPOINT ["sleep"]
CMD ["100"]
```

#### Best Practices Summary

| Scenario | Recommendation | Reason |
|----------|----------------|---------|
| **Default application** | Use CMD | Easy to override for different environments |
| **Tool-like container** | Use ENTRYPOINT | Container behaves like the tool |
| **Shell scripts** | Use ENTRYPOINT | Script is the main executable |
| **Development** | Use CMD | Flexibility for different commands |
| **Production** | Use ENTRYPOINT | Consistent behavior |
| **Signal handling** | Use exec form | Better process management |

#### Common Patterns

##### Pattern 1: ENTRYPOINT with CMD for Parameters
```dockerfile
ENTRYPOINT ["/usr/local/bin/myapp"]
CMD ["--config", "/etc/myapp/config.yml"]
```

##### Pattern 2: CMD for Default Behavior
```dockerfile
CMD ["npm", "start"]
```

##### Pattern 3: ENTRYPOINT for Tool Containers
```dockerfile
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["--help"]
```

##### Pattern 4: Sleep for Debugging
```dockerfile
# Keep container running for debugging
ENTRYPOINT ["sleep"]
CMD ["infinity"]
```

---

## Advanced Dockerfile Techniques

### 1. Multi-stage Builds

#### Definition
Uses multiple FROM statements to create smaller, more efficient images by using one stage to build and another to run.

#### Example
```dockerfile
# Build stage
FROM node:16 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:16-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["node", "app.js"]
```

#### Benefits
- Smaller final image
- Better security (no build tools in production)
- Faster builds (layer caching)

### 2. ARG Instruction

#### Definition
Defines variables that users can pass at build-time using `docker build --build-arg`.

#### Syntax
```dockerfile
ARG <name>[=<default value>]
```

#### Examples
```dockerfile
ARG VERSION=latest
ARG BUILD_DATE
ARG VCS_REF

FROM ubuntu:${VERSION}
LABEL org.label-schema.build-date=$BUILD_DATE \
      org.label-schema.vcs-ref=$VCS_REF
```

### 3. USER Instruction

#### Definition
Sets the user name (or UID) and optionally the user group (or GID) for any subsequent instructions.

#### Syntax
```dockerfile
USER <user>[:<group>]
USER <UID>[:<GID>]
```

#### Examples
```dockerfile
# Create user
RUN groupadd -r appuser && useradd -r -g appuser appuser
USER appuser

# Use UID/GID
USER 1000:1000
```

### 4. VOLUME Instruction

#### Definition
Creates a mount point and marks it as holding externally mounted volumes.

#### Syntax
```dockerfile
VOLUME ["/path/to/dir"]
```

#### Examples
```dockerfile
VOLUME ["/app/data"]
VOLUME ["/var/log", "/var/db"]
```

---

## Best Practices

### 1. Layer Optimization
```dockerfile
# Bad - creates multiple layers
RUN apt-get update
RUN apt-get install -y python3
RUN apt-get install -y python3-pip

# Good - single layer
RUN apt-get update && \
    apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*
```

### 2. Order Instructions for Caching
```dockerfile
# Copy dependency files first
COPY package*.json ./
RUN npm install

# Then copy application code
COPY . .
```

### 3. Use .dockerignore
```dockerignore
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
```

### 4. Security Best Practices
```dockerfile
# Don't run as root
RUN groupadd -r appuser && useradd -r -g appuser appuser
USER appuser

# Use specific versions
FROM python:3.9-slim

# Remove unnecessary packages
RUN apt-get update && \
    apt-get install -y package-name && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

### 5. Health Checks
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost/ || exit 1
```

---

## Common Use Cases

### 1. Node.js Application
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "app.js"]
```

### 2. Python Application
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "app.py"]
```

### 3. Multi-stage React Build
```dockerfile
# Build stage
FROM node:16 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 4. Database with Initialization
```dockerfile
FROM postgres:13
ENV POSTGRES_DB=mydb
ENV POSTGRES_USER=myuser
ENV POSTGRES_PASSWORD=mypassword
COPY init.sql /docker-entrypoint-initdb.d/
EXPOSE 5432
```

### 5. Nginx Web Server
```dockerfile
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy static files
COPY ./dist/ /usr/share/nginx/html/

# Create custom error pages
COPY error-pages/ /usr/share/nginx/html/error-pages/

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### 6. Tomcat Application Server
```dockerfile
FROM tomcat:9-jdk11-openjdk

# Set environment variables
ENV CATALINA_HOME=/usr/local/tomcat
ENV PATH=$CATALINA_HOME/bin:$PATH

# Remove default applications
RUN rm -rf $CATALINA_HOME/webapps/*

# Copy custom server.xml for configuration
COPY server.xml $CATALINA_HOME/conf/

# Copy WAR file
COPY target/myapp.war $CATALINA_HOME/webapps/ROOT.war

# Create custom logging configuration
COPY logging.properties $CATALINA_HOME/conf/

# Set proper permissions
RUN chown -R tomcat:tomcat $CATALINA_HOME

# Expose port 8080
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8080/ || exit 1

# Start Tomcat
CMD ["catalina.sh", "run"]
```

### 7. MySQL Database Server
```dockerfile
FROM mysql:8.0

# Set environment variables
ENV MYSQL_ROOT_PASSWORD=rootpassword
ENV MYSQL_DATABASE=mydb
ENV MYSQL_USER=myuser
ENV MYSQL_PASSWORD=mypassword

# Copy custom MySQL configuration
COPY my.cnf /etc/mysql/conf.d/

# Copy initialization scripts
COPY init.sql /docker-entrypoint-initdb.d/

# Copy custom MySQL functions/procedures
COPY functions.sql /docker-entrypoint-initdb.d/

# Set proper permissions
RUN chown -R mysql:mysql /var/lib/mysql

# Expose port 3306
EXPOSE 3306

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD mysqladmin ping -h localhost -u root -p$MYSQL_ROOT_PASSWORD || exit 1

# Start MySQL
CMD ["mysqld"]
```

### 8. Apache HTTPD Server
```dockerfile
FROM httpd:2.4-alpine

# Install required packages
RUN apk add --no-cache \
    curl \
    apache2-utils

# Copy custom Apache configuration
COPY httpd.conf /usr/local/apache2/conf/httpd.conf

# Copy virtual host configuration
COPY vhost.conf /usr/local/apache2/conf/extra/

# Copy SSL certificates (if using HTTPS)
COPY ssl/ /usr/local/apache2/conf/ssl/

# Copy web content
COPY ./public_html/ /usr/local/apache2/htdocs/

# Create logs directory
RUN mkdir -p /usr/local/apache2/logs

# Set proper permissions
RUN chown -R daemon:daemon /usr/local/apache2/htdocs && \
    chmod -R 755 /usr/local/apache2/htdocs

# Expose ports 80 and 443
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost/ || exit 1

# Start Apache
CMD ["httpd-foreground"]
```

### 9. Java JAR Application
```dockerfile
FROM openjdk:11-jre-slim

# Set environment variables
ENV JAVA_OPTS="-Xmx512m -Xms256m"
ENV APP_OPTS=""

# Create application user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Create application directory
WORKDIR /app

# Copy JAR file
COPY target/myapp.jar app.jar

# Copy configuration files
COPY config/ /app/config/

# Copy external dependencies (if any)
COPY lib/ /app/lib/

# Set proper permissions
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose application port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Start Java application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar $APP_OPTS"]
```

### 10. Multi-stage Java Build with JAR
```dockerfile
# Build stage
FROM maven:3.8-openjdk-11 AS builder

# Set working directory
WORKDIR /build

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy source code
COPY src/ ./src/

# Build the application
RUN mvn clean package -DskipTests

# Runtime stage
FROM openjdk:11-jre-slim

# Set environment variables
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# Create application user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Create application directory
WORKDIR /app

# Copy JAR from build stage
COPY --from=builder /build/target/*.jar app.jar

# Copy configuration
COPY --from=builder /build/src/main/resources/application.yml /app/config/

# Set proper permissions
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Start application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

---

## Server-Specific Considerations

### Web Servers (Nginx, Apache HTTPD)

#### Nginx Best Practices
- **Static Content**: Optimize for serving static files
- **Reverse Proxy**: Configure for load balancing
- **SSL/TLS**: Use proper certificate configuration
- **Caching**: Implement appropriate cache headers
- **Security**: Disable server tokens, use security headers

#### Apache HTTPD Best Practices
- **Modules**: Only enable required modules
- **Virtual Hosts**: Proper virtual host configuration
- **SSL**: Configure SSL certificates correctly
- **Performance**: Enable compression and caching
- **Security**: Use .htaccess for access control

### Application Servers (Tomcat)

#### Tomcat Configuration
- **Memory Settings**: Configure JVM heap size
- **Connector Settings**: Optimize for your application
- **Security**: Remove default applications
- **Logging**: Configure proper log rotation
- **Session Management**: Configure session persistence

### Database Servers (MySQL)

#### MySQL Configuration
- **InnoDB Settings**: Configure buffer pool size
- **Connection Limits**: Set appropriate max_connections
- **Security**: Use strong passwords, limit user privileges
- **Backup**: Configure automated backups
- **Performance**: Optimize query cache and indexes

### Java Applications

#### JAR Application Considerations
- **JVM Tuning**: Set appropriate heap and GC settings
- **Profile**: Use application-specific profiles
- **Monitoring**: Include health check endpoints
- **Security**: Run as non-root user
- **Dependencies**: Include all required libraries

### Configuration Files Examples

#### Nginx Configuration (nginx.conf)
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    sendfile        on;
    keepalive_timeout  65;
    
    server {
        listen       80;
        server_name  localhost;
        
        location / {
            root   /usr/share/nginx/html;
            index  index.html index.htm;
        }
        
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   /usr/share/nginx/html;
        }
    }
}
```

#### Tomcat Server Configuration (server.xml)
```xml
<Server port="8005" shutdown="SHUTDOWN">
  <Service name="Catalina">
    <Connector port="8080" protocol="HTTP/1.1"
               connectionTimeout="20000"
               redirectPort="8443" />
    
    <Engine name="Catalina" defaultHost="localhost">
      <Host name="localhost"  appBase="webapps"
            unpackWARs="true" autoDeploy="true">
      </Host>
    </Engine>
  </Service>
</Server>
```

#### MySQL Configuration (my.cnf)
```ini
[mysqld]
default-authentication-plugin=mysql_native_password
max_connections=200
innodb_buffer_pool_size=256M
innodb_log_file_size=64M
innodb_flush_log_at_trx_commit=2
```

#### Java Application Properties
```yaml
# application.yml
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  profiles:
    active: docker
  datasource:
    url: jdbc:mysql://db:3306/mydb
    username: ${DB_USER}
    password: ${DB_PASSWORD}

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Build Context Too Large
**Problem**: Build takes too long due to large context
**Solution**: Use `.dockerignore` file

#### 2. Permission Denied
**Problem**: Container can't write to mounted volumes
**Solution**: Use `USER` instruction or adjust permissions

#### 3. Port Already in Use
**Problem**: Port conflict when running container
**Solution**: Use different port mapping: `docker run -p 8080:3000`

#### 4. Missing Dependencies
**Problem**: Application fails due to missing packages
**Solution**: Ensure all dependencies are in Dockerfile

#### 5. Large Image Size
**Problem**: Image is too large
**Solution**: Use multi-stage builds, minimal base images, clean up cache

### Debugging Commands
```bash
# Build with verbose output
docker build --progress=plain .

# Run container interactively
docker run -it image-name /bin/bash

# Inspect image layers
docker history image-name

# Check image size
docker images
```

---

## Summary

A Dockerfile is a powerful tool for creating reproducible, portable container images. By understanding the core instructions and following best practices, you can create efficient, secure, and maintainable Docker images for your applications.

### Key Takeaways
1. **Layer Optimization**: Minimize layers for better performance
2. **Security**: Don't run as root, use specific versions
3. **Caching**: Order instructions to maximize cache usage
4. **Multi-stage Builds**: Use for smaller, more secure images
5. **Documentation**: Use LABEL and comments for clarity

### Next Steps
- Practice building images for your applications
- Experiment with multi-stage builds
- Learn about Docker Compose for multi-container applications
- Explore Docker best practices for production deployments 