# EasyCRUD Docker Compose Configuration

Based on the [cloud-blitz/EasyCRUD](https://github.com/cloud-blitz/EasyCRUD/) repository structure, here's a complete Docker Compose setup for the full-stack CRUD application.

## Project Structure Analysis

The EasyCRUD project consists of:
- **Frontend**: JavaScript/CSS/HTML (56.6% + 20.0% + 2.3% = 79% frontend)
- **Backend**: Java (21.1%)
- **Database**: MariaDB (as mentioned in README)

## 1. Complete Docker Compose Configuration

### docker-compose.yml
```yaml
version: '3.8'

services:
  # MariaDB Database
  mariadb:
    image: mariadb:10.6
    container_name: easycrud-mariadb
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: student_db
      MYSQL_USER: username
      MYSQL_PASSWORD: your_password
      MYSQL_ROOT_HOST: '%'
    ports:
      - "3306:3306"
    volumes:
      - mariadb_data:/var/lib/mysql
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    networks:
      - easycrud-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-prootpassword"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped

  # Spring Boot Backend
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: easycrud-backend
    environment:
      # Database Configuration
      DB_HOST: mariadb
      DB_USER: username
      DB_PASS: your_password
      DB_PORT: 3306
      DB_NAME: student_db
      
      # Spring Boot Configuration
      SPRING_PROFILES_ACTIVE: docker
      SPRING_DATASOURCE_URL: jdbc:mysql://mariadb:3306/student_db?useSSL=false&allowPublicKeyRetrieval=true
      SPRING_DATASOURCE_USERNAME: username
      SPRING_DATASOURCE_PASSWORD: your_password
      SPRING_JPA_HIBERNATE_DDL_AUTO: update
      SPRING_JPA_SHOW_SQL: true
      
      # Application Configuration
      SERVER_PORT: 8080
      JAVA_OPTS: "-Xmx512m -Xms256m"
    ports:
      - "8080:8080"
    depends_on:
      mariadb:
        condition: service_healthy
    networks:
      - easycrud-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    restart: unless-stopped

  # Frontend (Nginx)
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: easycrud-frontend
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - easycrud-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

volumes:
  mariadb_data:
    driver: local

networks:
  easycrud-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

## 2. Backend Dockerfile

### backend/Dockerfile
```dockerfile
# Multi-stage build for Spring Boot application
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

# Production stage
FROM openjdk:11-jre-slim

# Set environment variables
ENV JAVA_OPTS="-Xmx512m -Xms256m"
ENV SPRING_PROFILES_ACTIVE=docker

# Create application user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Create application directory
WORKDIR /app

# Copy JAR from build stage
COPY --from=builder /build/target/*.jar app.jar

# Copy configuration files
COPY --from=builder /build/src/main/resources/application.yml /app/config/

# Set proper permissions
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port 8080
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Start Spring Boot application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

## 3. Frontend Dockerfile

### frontend/Dockerfile
```dockerfile
# Multi-stage build for frontend
FROM node:16-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=builder /app/dist/ /usr/share/nginx/html/

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

## 4. Nginx Configuration

### frontend/nginx.conf
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    sendfile        on;
    keepalive_timeout  65;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    server {
        listen       80;
        server_name  localhost;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
        
        location / {
            root   /usr/share/nginx/html;
            index  index.html index.htm;
            try_files $uri $uri/ /index.html;
        }
        
        # API proxy to backend
        location /api/ {
            proxy_pass http://backend:8080/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # CORS headers
            add_header Access-Control-Allow-Origin * always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
            
            # Handle preflight requests
            if ($request_method = 'OPTIONS') {
                add_header Access-Control-Allow-Origin *;
                add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
                add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
                add_header Access-Control-Max-Age 1728000;
                add_header Content-Type 'text/plain; charset=utf-8';
                add_header Content-Length 0;
                return 204;
            }
        }
        
        # Static files caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   /usr/share/nginx/html;
        }
    }
}
```

## 5. Database Initialization

### database/init.sql
```sql
-- Create database if not exists
CREATE DATABASE IF NOT EXISTS student_db;
USE student_db;

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO students (name, email, phone, address) VALUES
('John Doe', 'john.doe@example.com', '+1234567890', '123 Main St, City, State'),
('Jane Smith', 'jane.smith@example.com', '+0987654321', '456 Oak Ave, Town, State'),
('Bob Johnson', 'bob.johnson@example.com', '+1122334455', '789 Pine Rd, Village, State');

-- Create indexes for better performance
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_name ON students(name);
```

## 6. Environment Configuration

### .env
```env
# Database Configuration
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=student_db
MYSQL_USER=username
MYSQL_PASSWORD=your_password
MYSQL_ROOT_HOST=%

# Backend Configuration
DB_HOST=mariadb
DB_USER=username
DB_PASS=your_password
DB_PORT=3306
DB_NAME=student_db

# Spring Boot Configuration
SPRING_PROFILES_ACTIVE=docker
SPRING_DATASOURCE_URL=jdbc:mysql://mariadb:3306/student_db?useSSL=false&allowPublicKeyRetrieval=true
SPRING_DATASOURCE_USERNAME=username
SPRING_DATASOURCE_PASSWORD=your_password
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SPRING_JPA_SHOW_SQL=true

# Application Configuration
SERVER_PORT=8080
JAVA_OPTS=-Xmx512m -Xms256m

# Frontend Configuration
NGINX_PORT=80
```

## 7. Spring Boot Application Properties

### backend/src/main/resources/application.yml
```yaml
server:
  port: ${SERVER_PORT:8080}
  servlet:
    context-path: /api

spring:
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:docker}
  datasource:
    url: ${SPRING_DATASOURCE_URL:jdbc:mysql://mariadb:3306/student_db?useSSL=false&allowPublicKeyRetrieval=true}
    username: ${SPRING_DATASOURCE_USERNAME:username}
    password: ${SPRING_DATASOURCE_PASSWORD:your_password}
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
  jpa:
    hibernate:
      ddl-auto: ${SPRING_JPA_HIBERNATE_DDL_AUTO:update}
    show-sql: ${SPRING_JPA_SHOW_SQL:true}
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
        format_sql: true
        use_sql_comments: true

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,env
  endpoint:
    health:
      show-details: always
  health:
    db:
      enabled: true

logging:
  level:
    org.springframework.web: DEBUG
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
```

## 8. Development Configuration

### docker-compose.dev.yml
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    volumes:
      - ./backend:/app
      - /app/target
    environment:
      SPRING_PROFILES_ACTIVE: dev
      SPRING_JPA_SHOW_SQL: true
    command: mvn spring-boot:run

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
    command: npm start
```

### backend/Dockerfile.dev
```dockerfile
FROM maven:3.8-openjdk-11

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline

COPY . .

EXPOSE 8080

CMD ["mvn", "spring-boot:run"]
```

### frontend/Dockerfile.dev
```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

## 9. Build and Run Instructions

### Production Build
```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Development Build
```bash
# Start development environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Individual Service Management
```bash
# Start specific service
docker-compose up -d mariadb
docker-compose up -d backend
docker-compose up -d frontend

# Restart specific service
docker-compose restart backend

# Access database
docker-compose exec mariadb mysql -u username -p student_db
```

## 10. Testing the Application

### Health Checks
```bash
# Check database health
curl http://localhost:3306

# Check backend health
curl http://localhost:8080/api/actuator/health

# Check frontend health
curl http://localhost/
```

### API Testing
```bash
# Test CRUD operations
# Create student
curl -X POST http://localhost/api/students \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Student","email":"test@example.com","phone":"1234567890"}'

# Get all students
curl http://localhost/api/students

# Get student by ID
curl http://localhost/api/students/1

# Update student
curl -X PUT http://localhost/api/students/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Student","email":"updated@example.com"}'

# Delete student
curl -X DELETE http://localhost/api/students/1
```

## 11. Troubleshooting

### Common Issues and Solutions

#### Issue 1: Database Connection Failed
```bash
# Check if MariaDB is running
docker-compose ps mariadb

# Check database logs
docker-compose logs mariadb

# Test database connection
docker-compose exec mariadb mysql -u root -p
```

#### Issue 2: Backend Won't Start
```bash
# Check backend logs
docker-compose logs backend

# Verify database is ready
docker-compose exec mariadb mysql -u username -p student_db -e "SHOW TABLES;"

# Check backend health
curl http://localhost:8080/api/actuator/health
```

#### Issue 3: Frontend Not Loading
```bash
# Check nginx logs
docker-compose logs frontend

# Verify backend is accessible
curl http://localhost:8080/api/actuator/health

# Check nginx configuration
docker-compose exec frontend nginx -t
```

### Debug Commands
```bash
# Access containers
docker-compose exec mariadb bash
docker-compose exec backend bash
docker-compose exec frontend sh

# View container resources
docker stats

# Check network connectivity
docker-compose exec backend ping mariadb
docker-compose exec frontend ping backend
```

## 12. Production Considerations

### Security Enhancements
```yaml
# Add to docker-compose.yml
services:
  mariadb:
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    volumes:
      - mariadb_data:/var/lib/mysql
      - ./database/backup:/backup:ro  # Backup volume
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
      - /var/tmp

  backend:
    environment:
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
      - /var/tmp
```

### Monitoring and Logging
```yaml
# Add logging configuration
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
  
  frontend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
  
  mariadb:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

This Docker Compose configuration provides a complete, production-ready setup for the EasyCRUD application with proper service orchestration, health monitoring, and security considerations. 