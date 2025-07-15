# Docker Compose Complete Guide: Beginner to Intermediate

## Table of Contents
1. [What is Docker Compose?](#what-is-docker-compose)
2. [Docker Compose File Structure](#docker-compose-file-structure)
3. [Essential Docker Compose Instructions](#essential-docker-compose-instructions)
4. [Advanced Docker Compose Features](#advanced-docker-compose-features)
5. [Networking in Docker Compose](#networking-in-docker-compose)
6. [Volumes and Data Persistence](#volumes-and-data-persistence)
7. [Environment Variables](#environment-variables)
8. [Best Practices](#best-practices)
9. [Common Use Cases](#common-use-cases)
10. [Troubleshooting](#troubleshooting)

---

## What is Docker Compose?

### Definition
**Docker Compose** is a tool for defining and running multi-container Docker applications. It uses YAML files to configure application services and allows you to create and start all the services from your configuration with a single command.

### Theoretical Foundation

#### Container Orchestration Theory
Docker Compose implements **declarative orchestration**, where you describe the desired state of your application rather than the steps to achieve it. This follows the **Infrastructure as Code (IaC)** principle, treating infrastructure configuration as version-controlled code.

#### Microservices Architecture Support
Docker Compose enables **service-oriented architecture (SOA)** by allowing you to:
- **Decompose** monolithic applications into smaller, independent services
- **Isolate** services with separate containers
- **Scale** services independently
- **Manage** service dependencies and communication

#### Declarative vs Imperative Configuration
- **Declarative**: Define what you want (YAML configuration)
- **Imperative**: Define how to achieve it (shell scripts)
- Docker Compose uses declarative configuration for better maintainability and reproducibility

### Key Concepts

#### Service Theory
- **Service**: A container that runs as part of your application
  - **Stateless Services**: Can be easily scaled and replaced
  - **Stateful Services**: Require persistent storage and careful management
  - **Service Discovery**: Automatic naming and network resolution

#### Project Theory
- **Project**: A collection of services defined in a docker-compose.yml file
  - **Namespace Isolation**: Each project has its own network namespace
  - **Resource Management**: Shared resource allocation across services
  - **Lifecycle Management**: Coordinated startup, shutdown, and updates

#### Network Theory
- **Network**: Communication between services
  - **Bridge Networks**: Default network type for service communication
  - **Network Isolation**: Services can only communicate if on the same network
  - **DNS Resolution**: Automatic service name resolution within networks

#### Volume Theory
- **Volume**: Persistent data storage
  - **Data Persistence**: Survives container lifecycle
  - **Data Sharing**: Multiple containers can access the same data
  - **Backup and Recovery**: Independent of container state

#### Environment Theory
- **Environment**: Configuration for services
  - **Configuration Management**: Externalized configuration
  - **Environment Separation**: Different configs for dev/staging/prod
  - **Security**: Sensitive data management through environment variables

### Why Use Docker Compose?
1. **Multi-container Applications**: Manage complex applications with multiple services
2. **Development Environment**: Consistent development setup across team members
3. **Service Orchestration**: Define relationships and dependencies between services
4. **Environment Consistency**: Same configuration across development, staging, and production
5. **Easy Deployment**: Single command to start entire application stack

---

## Docker Compose File Structure

### Basic Structure
```yaml
version: '3.8'

services:
  service-name:
    image: image-name:tag
    ports:
      - "host-port:container-port"
    environment:
      - KEY=value
    volumes:
      - host-path:container-path
    networks:
      - network-name

volumes:
  volume-name:

networks:
  network-name:
    driver: bridge
```

### File Naming Convention
- **Standard**: `docker-compose.yml`
- **Alternative**: `docker-compose.yaml`
- **Environment-specific**: `docker-compose.prod.yml`, `docker-compose.dev.yml`

---

## Essential Docker Compose Instructions

### 1. Services Section

#### Definition
The `services` section defines the containers that make up your application. Each service represents a container that will be created and managed by Docker Compose.

#### Theoretical Background

##### Service-Oriented Architecture (SOA) Principles
Services in Docker Compose follow **SOA principles**:
- **Loose Coupling**: Services are independent and can be developed/deployed separately
- **High Cohesion**: Each service has a single, well-defined responsibility
- **Service Autonomy**: Services can operate independently
- **Service Reusability**: Services can be reused across different applications

##### Container Lifecycle Management
Docker Compose manages the **complete lifecycle** of services:
- **Creation**: Building or pulling container images
- **Starting**: Initializing services in dependency order
- **Running**: Maintaining service health and availability
- **Stopping**: Graceful shutdown of services
- **Cleanup**: Removing containers and associated resources

##### Service Discovery Theory
Docker Compose implements **automatic service discovery**:
- **DNS Resolution**: Services can communicate using service names
- **Network Isolation**: Services are isolated in their own network namespace
- **Load Balancing**: Built-in load balancing for multiple instances
- **Health Monitoring**: Continuous health checking of services

##### Resource Management Theory
Services are managed with **resource constraints**:
- **CPU Limits**: Prevents resource exhaustion
- **Memory Limits**: Ensures predictable memory usage
- **Network Bandwidth**: Controls network resource allocation
- **Storage Quotas**: Manages disk space usage

#### Basic Service Configuration
```yaml
services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
  
  database:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
    ports:
      - "3306:3306"
```

#### Service with Build Context
```yaml
services:
  app:
    build:
      context: ./app
      dockerfile: Dockerfile
      args:
        BUILDKIT_INLINE_CACHE: 1
    ports:
      - "3000:3000"
```

### 2. Image Instruction

#### Definition
Specifies the Docker image to use for the service. Can be a pre-built image or built from a Dockerfile.

#### Theoretical Background

##### Container Image Theory
Docker images follow the **layered filesystem model**:
- **Base Layer**: Operating system and runtime environment
- **Application Layer**: Application code and dependencies
- **Configuration Layer**: Environment-specific configurations
- **Metadata Layer**: Image metadata and configuration

##### Image Registry Theory
Docker Compose supports **distributed image management**:
- **Public Registries**: Docker Hub, GitHub Container Registry
- **Private Registries**: Enterprise-grade image storage
- **Image Caching**: Local caching for faster deployments
- **Image Security**: Vulnerability scanning and signing

##### Immutable Infrastructure Principle
Docker images follow **immutable infrastructure** principles:
- **Versioning**: Each image has a specific version tag
- **Reproducibility**: Same image produces same container
- **Rollback Capability**: Easy rollback to previous versions
- **Security**: Immutable images reduce attack surface

##### Image Optimization Theory
Docker Compose supports **image optimization strategies**:
- **Multi-stage Builds**: Separate build and runtime images
- **Layer Caching**: Reuse layers for faster builds
- **Image Size Optimization**: Minimize attack surface and resource usage
- **Security Scanning**: Automated vulnerability detection

#### Examples
```yaml
services:
  # Using pre-built image
  nginx:
    image: nginx:alpine
  
  # Using specific version
  postgres:
    image: postgres:13.4
  
  # Using private registry
  private-app:
    image: myregistry.com/myapp:v1.0
```

### 3. Build Instruction

#### Definition
Specifies how to build the image for the service using a Dockerfile.

#### Theoretical Background

##### Build Process Theory
Docker Compose implements **automated build processes**:
- **Dependency Resolution**: Automatic dependency management
- **Build Context**: Isolated build environment
- **Layer Optimization**: Efficient layer creation and caching
- **Parallel Building**: Concurrent build execution for multiple services

##### Continuous Integration/Continuous Deployment (CI/CD) Theory
Build instructions support **CI/CD pipelines**:
- **Automated Testing**: Integration with testing frameworks
- **Quality Gates**: Automated quality checks during build
- **Artifact Management**: Versioned artifact storage
- **Deployment Automation**: Automated deployment processes

##### Build Optimization Theory
Docker Compose implements **build optimization strategies**:
- **Build Cache**: Reuse previous build layers
- **Multi-stage Builds**: Separate build and runtime environments
- **Build Arguments**: Parameterized builds for different environments
- **Build Context Optimization**: Minimize build context size

##### Security in Build Process
Build instructions include **security considerations**:
- **Base Image Security**: Using secure base images
- **Dependency Scanning**: Automated vulnerability detection
- **Secrets Management**: Secure handling of build secrets
- **Build Isolation**: Isolated build environments

#### Examples
```yaml
services:
  # Simple build
  app:
    build: ./app
  
  # Build with context and dockerfile
  app:
    build:
      context: ./app
      dockerfile: Dockerfile.prod
  
  # Build with arguments
  app:
    build:
      context: ./app
      args:
        NODE_ENV: production
        VERSION: 1.0.0
```

### 4. Ports Instruction

#### Definition
Maps ports between the host and the container. Allows external access to services.

#### Theoretical Background

##### Network Address Translation (NAT) Theory
Docker Compose uses **NAT** for port mapping:
- **Port Forwarding**: Maps host ports to container ports
- **Network Isolation**: Containers are isolated from host network
- **Load Balancing**: Multiple containers can share the same host port
- **Security**: Controlled exposure of container services

##### Network Security Theory
Port mapping implements **network security principles**:
- **Principle of Least Privilege**: Only expose necessary ports
- **Network Segmentation**: Isolate services in different networks
- **Access Control**: Control which services are externally accessible
- **Traffic Monitoring**: Monitor network traffic for security

##### Service Discovery Theory
Port mapping enables **service discovery mechanisms**:
- **DNS Resolution**: Automatic service name resolution
- **Load Balancing**: Distribute traffic across multiple instances
- **Health Checking**: Monitor service availability
- **Failover**: Automatic failover to healthy instances

##### Network Performance Theory
Port mapping affects **network performance**:
- **Latency**: Additional network hop for external access
- **Throughput**: Bandwidth limitations of port mapping
- **Connection Pooling**: Efficient connection management
- **Network Optimization**: Optimize for specific use cases

#### Syntax
```yaml
ports:
  - "HOST_PORT:CONTAINER_PORT"
  - "HOST_PORT:CONTAINER_PORT/PROTOCOL"
```

#### Examples
```yaml
services:
  web:
    image: nginx:alpine
    ports:
      # Basic port mapping
      - "80:80"
      
      # Multiple ports
      - "80:80"
      - "443:443"
      
      # Specific protocol
      - "8080:8080/tcp"
      
      # Random host port
      - "3000"
      
      # Specific host IP
      - "127.0.0.1:8080:8080"
```

### 5. Environment Variables

#### Definition
Sets environment variables for the service. Can be defined inline or using external files.

#### Theoretical Background

##### Configuration Management Theory
Environment variables implement **configuration management principles**:
- **Externalized Configuration**: Separate configuration from code
- **Environment Separation**: Different configs for different environments
- **Configuration Validation**: Validate configuration at startup
- **Configuration Versioning**: Version control for configurations

##### Twelve-Factor App Methodology
Environment variables follow **12-factor app principles**:
- **Config**: Store configuration in environment variables
- **Dev/Prod Parity**: Keep development and production as similar as possible
- **Logs**: Treat logs as event streams
- **Processes**: Execute the app as one or more stateless processes

##### Security Theory
Environment variables implement **security best practices**:
- **Secrets Management**: Secure handling of sensitive data
- **Access Control**: Control who can access configuration
- **Encryption**: Encrypt sensitive configuration data
- **Audit Trail**: Track configuration changes

##### Configuration Drift Prevention
Environment variables prevent **configuration drift**:
- **Immutable Configuration**: Configuration doesn't change during runtime
- **Configuration Validation**: Validate configuration at startup
- **Configuration Monitoring**: Monitor configuration changes
- **Configuration Backup**: Backup configuration data

#### Examples
```yaml
services:
  # Inline environment variables
  app:
    image: myapp:latest
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://user:pass@db:5432/mydb
      PORT: 3000
  
  # Using .env file
  app:
    image: myapp:latest
    env_file:
      - .env
      - .env.local
  
  # Mix of inline and file
  app:
    image: myapp:latest
    environment:
      NODE_ENV: production
    env_file:
      - .env
```

### 6. Volumes Instruction

#### Definition
Mounts volumes to persist data and share files between the host and containers.

#### Theoretical Background

##### Data Persistence Theory
Volumes implement **data persistence principles**:
- **Data Durability**: Data survives container lifecycle
- **Data Consistency**: Ensure data integrity across operations
- **Data Availability**: Ensure data is available when needed
- **Data Recovery**: Recover data in case of failures

##### Storage Abstraction Theory
Volumes provide **storage abstraction**:
- **Storage Independence**: Applications are independent of storage implementation
- **Storage Portability**: Move applications between different storage systems
- **Storage Scalability**: Scale storage independently of applications
- **Storage Optimization**: Optimize storage for specific use cases

##### Data Management Theory
Volumes support **data management strategies**:
- **Data Lifecycle Management**: Manage data throughout its lifecycle
- **Data Backup and Recovery**: Backup and recover data
- **Data Archiving**: Archive old data
- **Data Retention**: Implement data retention policies

##### Performance Theory
Volumes affect **storage performance**:
- **I/O Performance**: Optimize input/output operations
- **Storage Capacity**: Manage storage capacity efficiently
- **Storage Latency**: Minimize storage access latency
- **Storage Throughput**: Maximize storage throughput

#### Examples
```yaml
services:
  # Named volume
  database:
    image: mysql:8.0
    volumes:
      - db_data:/var/lib/mysql
  
  # Bind mount
  app:
    image: myapp:latest
    volumes:
      - ./app:/app
      - /app/node_modules
  
  # Anonymous volume
  app:
    image: myapp:latest
    volumes:
      - /app/temp
```

### 7. Networks Instruction

#### Definition
Defines networks for service communication and isolation.

#### Theoretical Background

##### Network Architecture Theory
Docker Compose networks implement **network architecture principles**:
- **Network Segmentation**: Divide network into logical segments
- **Network Isolation**: Isolate services in different networks
- **Network Security**: Implement security at network level
- **Network Scalability**: Scale networks independently

##### Service Mesh Theory
Networks support **service mesh concepts**:
- **Service Discovery**: Automatic service discovery
- **Load Balancing**: Distribute traffic across services
- **Circuit Breaking**: Prevent cascading failures
- **Observability**: Monitor network traffic and performance

##### Network Security Theory
Networks implement **network security principles**:
- **Zero Trust Security**: Verify every connection
- **Network Access Control**: Control network access
- **Traffic Encryption**: Encrypt network traffic
- **Network Monitoring**: Monitor network for threats

##### Network Performance Theory
Networks affect **network performance**:
- **Network Latency**: Minimize network latency
- **Network Bandwidth**: Optimize bandwidth usage
- **Network Reliability**: Ensure network reliability
- **Network Scalability**: Scale network capacity

#### Examples
```yaml
services:
  # Default network
  app:
    image: myapp:latest
    networks:
      - default
  
  # Custom network
  app:
    image: myapp:latest
    networks:
      - frontend
      - backend
  
  # Network with aliases
  app:
    image: myapp:latest
    networks:
      frontend:
        aliases:
          - web
      backend:
        aliases:
          - api

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
```

### 8. Depends_on Instruction

#### Definition
Expresses dependency between services, ensuring proper startup order.

#### Theoretical Background

##### Dependency Management Theory
Depends_on implements **dependency management principles**:
- **Dependency Resolution**: Resolve service dependencies automatically
- **Dependency Ordering**: Ensure correct startup order
- **Dependency Validation**: Validate dependencies before startup
- **Dependency Monitoring**: Monitor dependency health

##### System Architecture Theory
Dependencies reflect **system architecture patterns**:
- **Layered Architecture**: Services depend on lower layers
- **Microservices Architecture**: Services depend on other services
- **Event-Driven Architecture**: Services depend on event sources
- **Service-Oriented Architecture**: Services depend on shared services

##### Fault Tolerance Theory
Dependencies support **fault tolerance strategies**:
- **Circuit Breaking**: Prevent cascading failures
- **Retry Logic**: Retry failed operations
- **Fallback Mechanisms**: Provide fallback services
- **Graceful Degradation**: Degrade gracefully when dependencies fail

##### Performance Theory
Dependencies affect **system performance**:
- **Startup Time**: Optimize startup time with proper dependencies
- **Resource Utilization**: Optimize resource usage
- **Scalability**: Scale services independently
- **Reliability**: Ensure system reliability

#### Examples
```yaml
services:
  app:
    image: myapp:latest
    depends_on:
      - database
      - redis
  
  database:
    image: mysql:8.0
  
  redis:
    image: redis:alpine
```

#### Health Check Dependencies
```yaml
services:
  app:
    image: myapp:latest
    depends_on:
      database:
        condition: service_healthy
      redis:
        condition: service_started
  
  database:
    image: mysql:8.0
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### 9. Healthcheck Instruction

#### Definition
Defines how to check if a service is healthy and ready to receive traffic.

#### Theoretical Background

##### System Health Theory
Health checks implement **system health monitoring principles**:
- **Proactive Monitoring**: Monitor system health proactively
- **Health Indicators**: Define clear health indicators
- **Health Thresholds**: Set appropriate health thresholds
- **Health Reporting**: Report health status accurately

##### Reliability Engineering Theory
Health checks support **reliability engineering practices**:
- **Fault Detection**: Detect faults early
- **Fault Isolation**: Isolate faulty components
- **Fault Recovery**: Recover from faults automatically
- **Fault Prevention**: Prevent faults through monitoring

##### Observability Theory
Health checks provide **observability capabilities**:
- **Metrics Collection**: Collect health metrics
- **Logging**: Log health check results
- **Tracing**: Trace health check execution
- **Alerting**: Alert on health issues

##### Performance Theory
Health checks affect **system performance**:
- **Health Check Overhead**: Minimize health check overhead
- **Health Check Frequency**: Optimize health check frequency
- **Health Check Timeout**: Set appropriate timeouts
- **Health Check Reliability**: Ensure health check reliability

#### Examples
```yaml
services:
  # Basic health check
  web:
    image: nginx:alpine
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 30s
      timeout: 10s
      retries: 3
  
  # Health check with custom command
  app:
    image: myapp:latest
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
  
  # Disable health check
  app:
    image: myapp:latest
    healthcheck:
      disable: true
```

### 10. Restart Policy

#### Definition
Defines the restart policy for the service when it exits.

#### Theoretical Background

##### Fault Tolerance Theory
Restart policies implement **fault tolerance principles**:
- **Automatic Recovery**: Automatically recover from failures
- **Failure Isolation**: Isolate failures to prevent cascading
- **Graceful Degradation**: Degrade gracefully during failures
- **Self-Healing**: Systems that heal themselves

##### System Reliability Theory
Restart policies support **system reliability practices**:
- **Mean Time Between Failures (MTBF)**: Maximize time between failures
- **Mean Time To Recovery (MTTR)**: Minimize time to recovery
- **Availability**: Maximize system availability
- **Reliability**: Ensure system reliability

##### Resource Management Theory
Restart policies affect **resource management**:
- **Resource Utilization**: Optimize resource usage
- **Resource Allocation**: Allocate resources efficiently
- **Resource Monitoring**: Monitor resource usage
- **Resource Scaling**: Scale resources as needed

##### Performance Theory
Restart policies impact **system performance**:
- **Startup Time**: Optimize restart time
- **Resource Overhead**: Minimize restart overhead
- **Service Availability**: Maximize service availability
- **User Experience**: Maintain good user experience during restarts

#### Examples
```yaml
services:
  # Always restart
  app:
    image: myapp:latest
    restart: always
  
  # Restart on failure
  app:
    image: myapp:latest
    restart: on-failure
  
  # Restart with max attempts
  app:
    image: myapp:latest
    restart: on-failure:3
  
  # Never restart
  app:
    image: myapp:latest
    restart: "no"
```

---

## Advanced Docker Compose Features

### 1. Multi-stage Services

#### Definition
Services that depend on other services for building or configuration.

#### Example
```yaml
services:
  # Build service
  builder:
    build:
      context: ./app
      target: builder
    volumes:
      - build_output:/build
  
  # Production service
  app:
    build:
      context: ./app
      target: production
    volumes:
      - build_output:/app/dist
    depends_on:
      - builder

volumes:
  build_output:
```

### 2. Service Overrides

#### Definition
Using multiple compose files to override configurations for different environments.

#### Example
```yaml
# docker-compose.yml (base)
services:
  app:
    image: myapp:latest
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development

# docker-compose.prod.yml (override)
services:
  app:
    environment:
      NODE_ENV: production
    deploy:
      replicas: 3
```

#### Usage
```bash
# Development
docker-compose up

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

### 3. Secrets Management

#### Definition
Securely manage sensitive data like passwords and API keys.

#### Example
```yaml
services:
  app:
    image: myapp:latest
    secrets:
      - db_password
      - api_key

secrets:
  db_password:
    file: ./secrets/db_password.txt
  api_key:
    external: true
```

### 4. Configs Management

#### Definition
Manage configuration files that can be shared between services.

#### Example
```yaml
services:
  app:
    image: myapp:latest
    configs:
      - source: app_config
        target: /app/config.yml
      - source: nginx_config
        target: /etc/nginx/nginx.conf

configs:
  app_config:
    file: ./config/app.yml
  nginx_config:
    external: true
```

### 5. Deploy Configuration

#### Definition
Define deployment configurations for production environments.

#### Example
```yaml
services:
  app:
    image: myapp:latest
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
      resources:
        limits:
          cpus: '0.50'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

---

## Networking in Docker Compose

### Default Network
```yaml
services:
  app:
    image: myapp:latest
    # Automatically connected to default network
  
  database:
    image: mysql:8.0
    # Automatically connected to default network
```

### Custom Networks
```yaml
services:
  frontend:
    image: nginx:alpine
    networks:
      - frontend
  
  backend:
    image: myapp:latest
    networks:
      - frontend
      - backend
  
  database:
    image: mysql:8.0
    networks:
      - backend

networks:
  frontend:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
  backend:
    driver: bridge
    ipam:
      config:
        - subnet: 172.21.0.0/16
```

### Network Aliases
```yaml
services:
  app:
    image: myapp:latest
    networks:
      backend:
        aliases:
          - api
          - app.local
  
  database:
    image: mysql:8.0
    networks:
      backend:
        aliases:
          - db
          - database.local
```

---

## Volumes and Data Persistence

### Named Volumes
```yaml
services:
  database:
    image: mysql:8.0
    volumes:
      - db_data:/var/lib/mysql
      - db_logs:/var/log/mysql

volumes:
  db_data:
    driver: local
  db_logs:
    driver: local
```

### Bind Mounts
```yaml
services:
  app:
    image: myapp:latest
    volumes:
      # Development source code
      - ./src:/app/src
      # Configuration files
      - ./config:/app/config:ro
      # Exclude node_modules
      - /app/node_modules
```

### Volume Configuration
```yaml
volumes:
  db_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /path/on/host
  cache_data:
    driver: local
    driver_opts:
      type: tmpfs
      o: size=100m
```

---

## Environment Variables

### .env File
```env
# .env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@db:5432/mydb
API_KEY=your-secret-key
PORT=3000
```

### Environment Variable Substitution
```yaml
services:
  app:
    image: myapp:latest
    environment:
      NODE_ENV: ${NODE_ENV:-development}
      DATABASE_URL: ${DATABASE_URL}
      API_KEY: ${API_KEY}
    env_file:
      - .env
      - .env.local
```

### Conditional Environment Variables
```yaml
services:
  app:
    image: myapp:latest
    environment:
      DEBUG: ${DEBUG:-false}
      LOG_LEVEL: ${LOG_LEVEL:-info}
      DATABASE_URL: ${DATABASE_URL:-sqlite:///app.db}
```

---

## Best Practices

### 1. Service Naming
```yaml
services:
  # Use descriptive names
  web-server:
    image: nginx:alpine
  
  # Use consistent naming convention
  api-gateway:
    image: myapp:latest
  
  # Use lowercase with hyphens
  user-service:
    image: user-service:latest
```

### 2. Version Management
```yaml
version: '3.8'  # Use specific version

services:
  app:
    image: myapp:1.2.3  # Use specific image tags
```

### 3. Resource Limits
```yaml
services:
  app:
    image: myapp:latest
    deploy:
      resources:
        limits:
          cpus: '0.50'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### 4. Health Checks
```yaml
services:
  app:
    image: myapp:latest
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### 5. Logging Configuration
```yaml
services:
  app:
    image: myapp:latest
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 6. Security
```yaml
services:
  app:
    image: myapp:latest
    user: "1000:1000"  # Non-root user
    read_only: true
    tmpfs:
      - /tmp
      - /var/cache
```

---

## Common Use Cases

### 1. Web Application Stack
```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
  
  app:
    build: ./app
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://user:pass@db:5432/mydb
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:13
    environment:
      POSTGRES_DB: mydb
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - db_data:/var/lib/postgresql/data
  
  redis:
    image: redis:alpine
    volumes:
      - redis_data:/data

volumes:
  db_data:
  redis_data:
```

### 2. Microservices Architecture
```yaml
version: '3.8'

services:
  api-gateway:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./gateway.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - user-service
      - order-service
  
  user-service:
    build: ./user-service
    environment:
      DATABASE_URL: postgresql://user:pass@user-db:5432/users
    depends_on:
      - user-db
  
  order-service:
    build: ./order-service
    environment:
      DATABASE_URL: postgresql://user:pass@order-db:5432/orders
    depends_on:
      - order-db
  
  user-db:
    image: postgres:13
    environment:
      POSTGRES_DB: users
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - user_db_data:/var/lib/postgresql/data
  
  order-db:
    image: postgres:13
    environment:
      POSTGRES_DB: orders
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - order_db_data:/var/lib/postgresql/data

volumes:
  user_db_data:
  order_db_data:
```

### 3. Development Environment
```yaml
version: '3.8'

services:
  app:
    build: ./app
    ports:
      - "3000:3000"
    volumes:
      - ./app:/app
      - /app/node_modules
    environment:
      NODE_ENV: development
    command: npm run dev
  
  database:
    image: postgres:13
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: devdb
      POSTGRES_USER: devuser
      POSTGRES_PASSWORD: devpass
    volumes:
      - db_data:/var/lib/postgresql/data
  
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  db_data:
  redis_data:
```

### 4. Testing Environment
```yaml
version: '3.8'

services:
  test-app:
    build: ./app
    environment:
      NODE_ENV: test
      DATABASE_URL: postgresql://testuser:testpass@test-db:5432/testdb
    depends_on:
      - test-db
    command: npm test
  
  test-db:
    image: postgres:13
    environment:
      POSTGRES_DB: testdb
      POSTGRES_USER: testuser
      POSTGRES_PASSWORD: testpass
    tmpfs:
      - /var/lib/postgresql/data
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: Service Won't Start
```bash
# Check service logs
docker-compose logs service-name

# Check service status
docker-compose ps

# Restart specific service
docker-compose restart service-name
```

#### Issue 2: Network Connectivity
```bash
# Check network configuration
docker-compose exec service-name ping other-service

# Inspect network
docker network ls
docker network inspect project-name_default
```

#### Issue 3: Volume Issues
```bash
# Check volume mounts
docker-compose exec service-name ls -la /path/to/mount

# Inspect volumes
docker volume ls
docker volume inspect volume-name
```

#### Issue 4: Environment Variables
```bash
# Check environment variables
docker-compose exec service-name env

# Validate .env file
docker-compose config
```

### Debug Commands
```bash
# Validate compose file
docker-compose config

# Show service dependencies
docker-compose config --services

# Dry run
docker-compose up --dry-run

# Build with no cache
docker-compose build --no-cache

# Remove all containers and volumes
docker-compose down -v

# View resource usage
docker-compose top
```

### Performance Optimization
```bash
# Use build cache
docker-compose build --parallel

# Limit resource usage
docker-compose up --scale service=2

# Use specific profiles
docker-compose --profile prod up
```

---

## Summary

Docker Compose is a powerful tool for managing multi-container applications. By understanding the core concepts and following best practices, you can create efficient, maintainable, and scalable containerized applications.

### Key Takeaways
1. **Service Definition**: Define each component as a service
2. **Networking**: Use custom networks for service communication
3. **Data Persistence**: Use volumes for persistent data
4. **Environment Management**: Use environment variables and .env files
5. **Health Checks**: Implement proper health monitoring
6. **Resource Management**: Set appropriate limits and reservations

### Next Steps
- Practice creating multi-service applications
- Experiment with different network configurations
- Learn about Docker Swarm for production orchestration
- Explore advanced features like secrets and configs
- Implement CI/CD pipelines with Docker Compose 