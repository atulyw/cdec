# ConfigMaps and Secrets: Configuration Management in Kubernetes

## Table of Contents
1. [ConfigMaps Overview](#configmaps-overview)
2. [ConfigMap Benefits](#configmap-benefits)
3. [Creating and Using ConfigMaps](#creating-and-using-configmaps)
4. [Secrets Overview](#secrets-overview)
5. [Secret Benefits](#secret-benefits)
6. [Creating and Using Secrets](#creating-and-using-secrets)
7. [Best Practices and Security](#best-practices-and-security)
8. [Practical Examples](#practical-examples)

---

## 1. ConfigMaps Overview

### What are ConfigMaps?
ConfigMaps are Kubernetes objects that store non-confidential configuration data in key-value pairs. They allow you to decouple configuration from application code and container images.

### ConfigMap Characteristics
- **Non-confidential data**: Configuration settings, environment variables
- **Key-value pairs**: Simple data structure
- **Namespace-scoped**: Available within a specific namespace
- **Immutable option**: Can be made immutable for stability
- **Multiple formats**: Literal values, files, or YAML definitions

### When to Use ConfigMaps
- **Application Configuration**: Database URLs, API endpoints, feature flags
- **Environment Variables**: Log levels, debug settings, application modes
- **Configuration Files**: nginx.conf, application.properties, config.json
- **Command-line Arguments**: Application startup parameters

---

## 2. ConfigMap Benefits

### 1. **Configuration Decoupling**
- **Separate from Code**: Configuration is separate from application code
- **Environment Flexibility**: Same image, different configurations
- **Version Control**: Configuration can be versioned independently
- **Deployment Flexibility**: Different configs for dev/staging/prod

### 2. **Environment Management**
- **Multiple Environments**: Dev, staging, production configurations
- **Environment-Specific Settings**: Different configs per environment
- **Easy Updates**: Change configuration without rebuilding images
- **Rollback Capability**: Revert configuration changes easily

### 3. **Operational Benefits**
- **No Image Rebuilds**: Update configuration without rebuilding containers
- **Quick Deployments**: Faster deployment cycles
- **Configuration Validation**: Validate configuration before deployment
- **Centralized Management**: Manage all configurations in one place

### 4. **Development Benefits**
- **Local Development**: Use same configuration patterns locally
- **Testing**: Easy to test different configurations
- **Debugging**: Clear separation of code and configuration
- **Team Collaboration**: Configuration can be shared and reviewed

---

## 3. Creating and Using ConfigMaps

### Creating ConfigMaps

#### Method 1: From Literal Values
```bash
kubectl create configmap app-config \
  --from-literal=database_url=postgresql://localhost:5432/mydb \
  --from-literal=api_endpoint=https://api.example.com \
  --from-literal=log_level=INFO \
  --from-literal=max_connections=100
```

#### Method 2: From Files
```bash
# Create from a single file
kubectl create configmap nginx-config --from-file=nginx.conf

# Create from multiple files
kubectl create configmap app-config-files \
  --from-file=config.json \
  --from-file=application.properties \
  --from-file=logging.conf
```

#### Method 3: From YAML Definition
```yaml
# app-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  labels:
    app: myapp
data:
  # Literal values
  database_url: "postgresql://localhost:5432/mydb"
  api_endpoint: "https://api.example.com"
  log_level: "INFO"
  max_connections: "100"
  
  # File content
  config.json: |
    {
      "database": {
        "host": "localhost",
        "port": 5432,
        "name": "mydb"
      },
      "api": {
        "timeout": 30,
        "retries": 3
      }
    }
  
  nginx.conf: |
    server {
        listen 80;
        server_name localhost;
        location / {
            root /usr/share/nginx/html;
            index index.html;
        }
    }
```

### Using ConfigMaps in Deployments

#### Method 1: Environment Variables
```yaml
# deployment-with-env.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-with-config
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: app
        image: myapp:latest
        ports:
        - containerPort: 8080
        env:
        # Individual environment variables
        - name: DATABASE_URL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: database_url
        - name: API_ENDPOINT
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: api_endpoint
        - name: LOG_LEVEL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: log_level
        # All ConfigMap data as environment variables
        envFrom:
        - configMapRef:
            name: app-config
```

#### Method 2: Volume Mounts
```yaml
# deployment-with-volume.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-with-config-volume
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: app
        image: myapp:latest
        ports:
        - containerPort: 8080
        volumeMounts:
        - name: config-volume
          mountPath: /etc/config
        - name: nginx-config
          mountPath: /etc/nginx/nginx.conf
          subPath: nginx.conf
        - name: app-config-file
          mountPath: /app/config
      volumes:
      - name: config-volume
        configMap:
          name: app-config
          items:
          - key: config.json
            path: config.json
      - name: nginx-config
        configMap:
          name: app-config
          items:
          - key: nginx.conf
            path: nginx.conf
      - name: app-config-file
        configMap:
          name: app-config-files
```

---

## 4. Secrets Overview

### What are Secrets?
Secrets are Kubernetes objects that store sensitive data like passwords, tokens, and keys. They provide a way to store and manage sensitive information separately from application code.

### Secret Characteristics
- **Sensitive data**: Passwords, API keys, certificates, tokens
- **Base64 encoded**: Data is automatically encoded/decoded
- **Namespace-scoped**: Available within a specific namespace
- **Immutable option**: Can be made immutable for security
- **Multiple types**: Opaque, TLS, Docker registry, etc.

### When to Use Secrets
- **Database Credentials**: Usernames, passwords, connection strings
- **API Keys**: External service authentication
- **TLS Certificates**: SSL/TLS certificates and private keys
- **Docker Registry**: Registry authentication credentials
- **OAuth Tokens**: Application authentication tokens

---

## 5. Secret Benefits

### 1. **Security Benefits**
- **Encrypted Storage**: Secrets are encrypted at rest
- **Access Control**: RBAC controls who can access secrets
- **Audit Trail**: Access to secrets can be logged and audited
- **Isolation**: Secrets are isolated from application code

### 2. **Operational Security**
- **No Hardcoding**: Sensitive data not embedded in code
- **Centralized Management**: All secrets managed in one place
- **Rotation Capability**: Easy to rotate secrets without code changes
- **Environment Isolation**: Different secrets per environment

### 3. **Compliance Benefits**
- **Regulatory Compliance**: Meets security requirements
- **Data Protection**: Sensitive data properly protected
- **Access Logging**: Track who accesses sensitive data
- **Audit Requirements**: Satisfies audit and compliance needs

### 4. **Development Benefits**
- **Secure Development**: Developers don't need access to production secrets
- **Environment Separation**: Different secrets for dev/staging/prod
- **Testing**: Safe testing with mock secrets
- **CI/CD Integration**: Secure secret management in pipelines

---

## 6. Creating and Using Secrets

### Creating Secrets

#### Method 1: From Literal Values
```bash
kubectl create secret generic app-secret \
  --from-literal=db_password=mysecretpassword \
  --from-literal=api_key=sk-1234567890abcdef \
  --from-literal=oauth_token=ghp_abcdef123456789
```

#### Method 2: From Files
```bash
# Create TLS secret
kubectl create secret tls app-tls \
  --cert=cert.pem \
  --key=key.pem

# Create Docker registry secret
kubectl create secret docker-registry regcred \
  --docker-server=https://index.docker.io/v1/ \
  --docker-username=username \
  --docker-password=password \
  --docker-email=email@example.com
```

#### Method 3: From YAML Definition
```yaml
# app-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
  labels:
    app: myapp
type: Opaque
data:
  # Base64 encoded values
  db_password: bXlzZWNyZXRwYXNzd29yZA==  # mysecretpassword
  api_key: c2stMTIzNDU2Nzg5MGFiY2RlZg==  # sk-1234567890abcdef
  oauth_token: Z2hwX2FiY2RlZjEyMzQ1Njc4OQ==  # ghp_abcdef123456789
```

### Using Secrets in Deployments

#### Method 1: Environment Variables
```yaml
# deployment-with-secret-env.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-with-secret
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: app
        image: myapp:latest
        ports:
        - containerPort: 8080
        env:
        # Individual secret values as environment variables
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secret
              key: db_password
        - name: API_KEY
          valueFrom:
            secretKeyRef:
              name: app-secret
              key: api_key
        - name: OAUTH_TOKEN
          valueFrom:
            secretKeyRef:
              name: app-secret
              key: oauth_token
        # All secret data as environment variables
        envFrom:
        - secretRef:
            name: app-secret
```

#### Method 2: Volume Mounts
```yaml
# deployment-with-secret-volume.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-with-secret-volume
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: app
        image: myapp:latest
        ports:
        - containerPort: 8080
        volumeMounts:
        - name: secret-volume
          mountPath: /etc/secrets
          readOnly: true
        - name: tls-certs
          mountPath: /etc/ssl/certs
          readOnly: true
      volumes:
      - name: secret-volume
        secret:
          secretName: app-secret
          items:
          - key: db_password
            path: database/password
          - key: api_key
            path: api/key
      - name: tls-certs
        secret:
          secretName: app-tls
```

---

## 7. Best Practices and Security

### ConfigMap Best Practices

#### 1. **Organization**
```yaml
# Environment-specific ConfigMaps
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config-dev
  namespace: development
data:
  environment: "development"
  log_level: "DEBUG"
  api_endpoint: "https://dev-api.example.com"
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config-prod
  namespace: production
data:
  environment: "production"
  log_level: "INFO"
  api_endpoint: "https://api.example.com"
```

#### 2. **Immutable ConfigMaps**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config-immutable
spec:
  immutable: true  # Prevents accidental changes
data:
  database_url: "postgresql://localhost:5432/mydb"
  api_endpoint: "https://api.example.com"
```

### Secret Best Practices

#### 1. **Security Measures**
```yaml
# Use RBAC to control access
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: default
  name: secret-reader
rules:
- apiGroups: [""]
  resources: ["secrets"]
  verbs: ["get", "list"]
  resourceNames: ["app-secret"]
```

#### 2. **Immutable Secrets**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secret-immutable
spec:
  immutable: true  # Prevents accidental changes
type: Opaque
data:
  db_password: bXlzZWNyZXRwYXNzd29yZA==
```

#### 3. **External Secret Management**
```yaml
# Using external secret management (e.g., AWS Secrets Manager)
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: app-external-secret
spec:
  secretStoreRef:
    name: aws-secrets-manager
    kind: SecretStore
  target:
    name: app-secret
  data:
  - secretKey: db_password
    remoteRef:
      key: myapp/database/password
  - secretKey: api_key
    remoteRef:
      key: myapp/api/key
```

---

## 8. Practical Examples

### Complete Application with ConfigMap and Secret

#### 1. Create ConfigMap
```yaml
# app-config-complete.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  database_url: "postgresql://localhost:5432/mydb"
  api_endpoint: "https://api.example.com"
  log_level: "INFO"
  max_connections: "100"
  config.json: |
    {
      "database": {
        "host": "localhost",
        "port": 5432,
        "name": "mydb"
      },
      "api": {
        "timeout": 30,
        "retries": 3
      }
    }
```

#### 2. Create Secret
```yaml
# app-secret-complete.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
data:
  db_password: bXlzZWNyZXRwYXNzd29yZA==
  api_key: c2stMTIzNDU2Nzg5MGFiY2RlZg==
  oauth_token: Z2hwX2FiY2RlZjEyMzQ1Njc4OQ==
```

#### 3. Complete Deployment
```yaml
# app-deployment-complete.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-complete
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: app
        image: myapp:latest
        ports:
        - containerPort: 8080
        env:
        # ConfigMap values
        - name: DATABASE_URL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: database_url
        - name: API_ENDPOINT
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: api_endpoint
        - name: LOG_LEVEL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: log_level
        # Secret values
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secret
              key: db_password
        - name: API_KEY
          valueFrom:
            secretKeyRef:
              name: app-secret
              key: api_key
        volumeMounts:
        - name: config-volume
          mountPath: /etc/config
        - name: secret-volume
          mountPath: /etc/secrets
          readOnly: true
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
      volumes:
      - name: config-volume
        configMap:
          name: app-config
          items:
          - key: config.json
            path: config.json
      - name: secret-volume
        secret:
          secretName: app-secret
```

#### 4. Deploy and Verify
```bash
# Apply all resources
kubectl apply -f app-config-complete.yaml
kubectl apply -f app-secret-complete.yaml
kubectl apply -f app-deployment-complete.yaml

# Verify deployment
kubectl get deployment app-complete
kubectl get pods -l app=myapp

# Check ConfigMap and Secret
kubectl get configmap app-config
kubectl get secret app-secret

# Test configuration in pod
kubectl exec -it <pod-name> -- env | grep -E "(DATABASE_URL|DB_PASSWORD|API_KEY)"
kubectl exec -it <pod-name> -- cat /etc/config/config.json
```

### Troubleshooting Commands

#### ConfigMap Troubleshooting
```bash
# Check ConfigMap
kubectl get configmap
kubectl describe configmap app-config
kubectl get configmap app-config -o yaml

# Check if ConfigMap is mounted
kubectl exec -it <pod-name> -- ls /etc/config
kubectl exec -it <pod-name> -- cat /etc/config/config.json

# Check environment variables
kubectl exec -it <pod-name> -- env | grep -E "(DATABASE_URL|API_ENDPOINT)"
```

#### Secret Troubleshooting
```bash
# Check Secret
kubectl get secret
kubectl describe secret app-secret
kubectl get secret app-secret -o yaml

# Check if Secret is mounted
kubectl exec -it <pod-name> -- ls /etc/secrets
kubectl exec -it <pod-name> -- cat /etc/secrets/database/password

# Check environment variables
kubectl exec -it <pod-name> -- env | grep -E "(DB_PASSWORD|API_KEY)"
```

### Clean Up
```bash
# Delete resources
kubectl delete deployment app-complete
kubectl delete configmap app-config
kubectl delete secret app-secret

# Verify cleanup
kubectl get deployment,configmap,secret
```

---

## Summary

ConfigMaps and Secrets are essential Kubernetes resources for configuration management:

### ConfigMaps
- **Purpose**: Store non-confidential configuration data
- **Benefits**: Decouple configuration from code, environment flexibility
- **Usage**: Environment variables, volume mounts, configuration files

### Secrets
- **Purpose**: Store sensitive data securely
- **Benefits**: Security, compliance, centralized management
- **Usage**: Credentials, certificates, API keys, tokens

### Best Practices
- **Security**: Use RBAC, make immutable when possible
- **Organization**: Environment-specific ConfigMaps and Secrets
- **Management**: Version control, external secret management
- **Monitoring**: Regular audits, access logging

This comprehensive guide provides everything needed to effectively use ConfigMaps and Secrets in Kubernetes deployments. 