# Kubernetes Advanced Concepts: Liveness, Readiness, Deployments, StatefulSets, DaemonSets, ConfigMaps, Secrets, and Storage

## Table of Contents
1. [Liveness and Readiness Probes](#liveness-and-readiness-probes)
2. [Deployments vs StatefulSets](#deployments-vs-statefulsets)
3. [DaemonSets](#daemonsets)
4. [ConfigMaps and Secrets](#configmaps-and-secrets)
5. [Persistent Storage with PV and PVC](#persistent-storage-with-pv-and-pvc)
6. [Dynamic Volume Provisioning with EBS](#dynamic-volume-provisioning-with-ebs)

---

## 1. Liveness and Readiness Probes

### Overview
Kubernetes uses probes to determine the health and readiness of containers. There are three types of probes:
- **Liveness Probe**: Determines if a container is alive and should be restarted
- **Readiness Probe**: Determines if a container is ready to serve traffic
- **Startup Probe**: Determines if the application has successfully started

### Readiness Probes

#### Definition and Purpose
Sometimes, applications are temporarily unable to serve traffic. For example, an application might need to load large data or configuration files during startup, or depend on external services after startup. In such cases, you don't want to kill the application, but you don't want to send it requests either. Kubernetes provides readiness probes to detect and mitigate these situations. A pod with containers reporting that they are not ready does not receive traffic through Kubernetes Services.

#### Key Characteristics
- **Purpose**: Determines if a container is ready to serve traffic
- **When it runs**: Before the initial delay, it runs periodically
- **Action on failure**: Removes the pod from service endpoints (no traffic routing)
- **Use cases**: 
  - Check if application is fully initialized
  - Verify dependencies are available (databases, external APIs)
  - Ensure configuration files are loaded
  - Validate service registration is complete

#### Readiness Probe Behavior
- **Success**: Pod is added to service endpoints and receives traffic
- **Failure**: Pod is removed from service endpoints and receives no traffic
- **Container continues running**: Unlike liveness probes, readiness failures don't restart the container
- **Automatic recovery**: When probe succeeds again, pod is automatically added back to service endpoints

### Liveness Probes

#### Definition and Purpose
Many applications running for long periods of time eventually transition to broken states, and cannot recover except by restart. Kubernetes provides liveness probes to detect and remedy such situations.

#### Key Characteristics
- **Purpose**: Detects when a container is in a broken state and needs to be restarted
- **When it runs**: After the initial delay, it runs periodically
- **Action on failure**: Restarts the container (kubelet kills and recreates the container)
- **Use cases**: 
  - Detect deadlocks or infinite loops
  - Identify unresponsive applications
  - Handle memory leaks that cause application to become unresponsive
  - Restart containers that are stuck in a broken state

#### Liveness Probe Behavior
- **Success**: Container continues running normally
- **Failure**: Container is restarted by kubelet
- **Restart policy**: Follows pod's restart policy (Always, OnFailure, Never)
- **Fresh start**: Container gets a completely fresh start with new process

### Startup Probes

#### Definition and Purpose
Startup probes are used for applications that need a longer time to start for their first time. You can configure startup probes to check for the same endpoints as liveness probes, but with a different failure threshold. This allows the application to have more time to start up, while still ensuring that the liveness probe doesn't interfere with the startup process.

#### Key Characteristics
- **Purpose**: Determines if the application has successfully started
- **When it runs**: Before liveness/readiness probes, then stops after success
- **Action on failure**: Keep container running, continue checking (no restart)
- **Use cases**:
  - Slow-starting applications (Java applications, large applications)
  - Applications with complex initialization processes
  - Legacy applications without proper health endpoints
  - Applications that consume resources during startup

#### Startup Probe Behavior
- **Success**: Startup probe stops, liveness/readiness probes begin
- **Failure**: Container continues running, startup probe continues checking
- **No restart**: Startup probe failures don't cause container restarts
- **Transition**: Once startup succeeds, normal probe behavior resumes

### Probe Interaction and Lifecycle

#### Probe Execution Order
```
Container Start
    ↓
initialDelaySeconds (wait)
    ↓
Startup Probe (if configured)
    ↓
Startup Probe Succeeds
    ↓
Liveness Probe Starts
    ↓
Readiness Probe Starts
    ↓
All Probes Run Periodically
```

#### Probe Failure Handling

**Liveness Probe Failure**:
- Container is restarted by kubelet
- Pod remains in the same node
- All probes are reset to initial state
- Application gets fresh start

**Readiness Probe Failure**:
- Pod is removed from service endpoints
- No traffic is routed to the pod
- Container continues running
- Probes continue checking

**Startup Probe Failure**:
- Container continues running
- Liveness/readiness probes are disabled
- Startup probe continues checking
- No restart occurs

### Probe Types

#### 1. HTTP GET Probe
Makes HTTP request to specified path and port.

**Use Cases**: Web applications, REST APIs, microservices
**Success Criteria**: HTTP status code 200-399
**Failure Criteria**: Any other status code or connection failure

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
    httpHeaders:
    - name: Custom-Header
      value: "health-check"
```

#### 2. TCP Socket Probe
Attempts to establish TCP connection to specified port.

**Use Cases**: Databases, message queues, custom protocols
**Success Criteria**: Connection established successfully
**Failure Criteria**: Connection refused or timeout

```yaml
readinessProbe:
  tcpSocket:
    port: 3306
```

#### 3. Exec Probe
Executes a command inside the container.

**Use Cases**: Custom health checks, legacy applications
**Success Criteria**: Command exits with status code 0
**Failure Criteria**: Any non-zero exit code

```yaml
livenessProbe:
  exec:
    command:
    - /bin/sh
    - -c
    - "pgrep -f myapp || exit 1"
```

### Probe Parameters Explained

#### Timing Parameters
- **initialDelaySeconds**: Time to wait before first probe (default: 0)
- **periodSeconds**: How often to perform the probe (default: 10)
- **timeoutSeconds**: Time to wait for probe response (default: 1)
- **failureThreshold**: Number of failures before considering probe failed (default: 3)
- **successThreshold**: Number of successes before considering probe successful (default: 1)

#### Parameter Guidelines
- **initialDelaySeconds**: Should be longer than application startup time
- **periodSeconds**: Balance responsiveness with overhead (5-30 seconds)
- **timeoutSeconds**: Should be less than periodSeconds
- **failureThreshold**: Higher values reduce false positives but increase detection time
- **successThreshold**: Usually 1, but can be higher for readiness probes

### Comprehensive Probe Examples

#### 1. Web Application with HTTP Probes
```yaml
# web-app-probes.yaml
apiVersion: v1
kind: Pod
metadata:
  name: web-app-with-probes
  labels:
    app: web-app
spec:
  containers:
  - name: web-app
    image: nginx:latest
    ports:
    - containerPort: 80
    livenessProbe:
      httpGet:
        path: /health
        port: 80
        httpHeaders:
        - name: User-Agent
          value: "kubelet-health-check"
      initialDelaySeconds: 30
      periodSeconds: 10
      timeoutSeconds: 5
      failureThreshold: 3
      successThreshold: 1
    readinessProbe:
      httpGet:
        path: /ready
        port: 80
      initialDelaySeconds: 5
      periodSeconds: 5
      timeoutSeconds: 3
      failureThreshold: 3
      successThreshold: 1
    startupProbe:
      httpGet:
        path: /startup
        port: 80
      initialDelaySeconds: 10
      periodSeconds: 5
      timeoutSeconds: 3
      failureThreshold: 30
      successThreshold: 1
```

#### 2. Database with TCP and Exec Probes
```yaml
# database-probes.yaml
apiVersion: v1
kind: Pod
metadata:
  name: mysql-with-probes
  labels:
    app: mysql
spec:
  containers:
  - name: mysql
    image: mysql:8.0
    ports:
    - containerPort: 3306
    env:
    - name: MYSQL_ROOT_PASSWORD
      value: "password"
    livenessProbe:
      exec:
        command:
        - /bin/sh
        - -c
        - "mysqladmin ping -h localhost -u root -p$MYSQL_ROOT_PASSWORD"
      initialDelaySeconds: 60
      periodSeconds: 30
      timeoutSeconds: 10
      failureThreshold: 3
      successThreshold: 1
    readinessProbe:
      tcpSocket:
        port: 3306
      initialDelaySeconds: 10
      periodSeconds: 5
      timeoutSeconds: 5
      failureThreshold: 3
      successThreshold: 1
    startupProbe:
      exec:
        command:
        - /bin/sh
        - -c
        - "mysql -h localhost -u root -p$MYSQL_ROOT_PASSWORD -e 'SELECT 1'"
      initialDelaySeconds: 15
      periodSeconds: 10
      timeoutSeconds: 5
      failureThreshold: 30
      successThreshold: 1
```

#### 3. Microservice with Custom Health Check
```yaml
# microservice-probes.yaml
apiVersion: v1
kind: Pod
metadata:
  name: microservice-with-probes
  labels:
    app: microservice
spec:
  containers:
  - name: microservice
    image: myapp:latest
    ports:
    - containerPort: 8080
    env:
    - name: DATABASE_URL
      value: "postgresql://localhost:5432/mydb"
    livenessProbe:
      httpGet:
        path: /health/live
        port: 8080
        httpHeaders:
        - name: Accept
          value: "application/json"
      initialDelaySeconds: 30
      periodSeconds: 10
      timeoutSeconds: 5
      failureThreshold: 3
      successThreshold: 1
    readinessProbe:
      httpGet:
        path: /health/ready
        port: 8080
      initialDelaySeconds: 5
      periodSeconds: 5
      timeoutSeconds: 3
      failureThreshold: 3
      successThreshold: 1
    startupProbe:
      httpGet:
        path: /health/startup
        port: 8080
      initialDelaySeconds: 10
      periodSeconds: 5
      timeoutSeconds: 3
      failureThreshold: 30
      successThreshold: 1
```

#### 4. Legacy Application with Exec Probe
```yaml
# legacy-app-probes.yaml
apiVersion: v1
kind: Pod
metadata:
  name: legacy-app-with-probes
  labels:
    app: legacy-app
spec:
  containers:
  - name: legacy-app
    image: legacy-app:latest
    ports:
    - containerPort: 9000
    livenessProbe:
      exec:
        command:
        - /bin/sh
        - -c
        - "pgrep -f legacy-app || exit 1"
      initialDelaySeconds: 60
      periodSeconds: 30
      timeoutSeconds: 10
      failureThreshold: 3
      successThreshold: 1
    readinessProbe:
      exec:
        command:
        - /bin/sh
        - -c
        - "curl -f http://localhost:9000/status || exit 1"
      initialDelaySeconds: 10
      periodSeconds: 5
      timeoutSeconds: 5
      failureThreshold: 3
      successThreshold: 1
    startupProbe:
      exec:
        command:
        - /bin/sh
        - -c
        - "test -f /app/ready.flag"
      initialDelaySeconds: 15
      periodSeconds: 10
      timeoutSeconds: 5
      failureThreshold: 30
      successThreshold: 1
```

### Probe Best Practices

#### 1. Design Principles
- **Keep probes lightweight**: Avoid heavy operations that could impact application performance
- **Make probes fast**: Complete within timeout to avoid false failures
- **Use appropriate timeouts**: Balance responsiveness with reliability
- **Set proper thresholds**: Avoid false positives/negatives
- **Use dedicated endpoints**: Separate health checks from business logic

#### 2. Implementation Guidelines
- **Use dedicated health endpoints**: Create `/health`, `/ready`, `/live` endpoints
- **Return consistent responses**: Standardize response format across all health endpoints
- **Include minimal information**: Avoid sensitive data in health responses
- **Handle errors gracefully**: Return appropriate HTTP status codes
- **Test thoroughly**: Validate probes in staging environment

#### 3. Configuration Recommendations
- **Start conservative**: Use longer timeouts and higher failure thresholds initially
- **Monitor and adjust**: Tune based on actual application behavior
- **Use different endpoints**: Separate liveness, readiness, and startup checks
- **Document clearly**: Explain probe purpose and expected behavior

#### 4. Common Patterns

**Web Application Pattern**:
```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /health/ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 3

startupProbe:
  httpGet:
    path: /health/startup
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 30
```

**Database Pattern**:
```yaml
livenessProbe:
  exec:
    command: ["pg_isready", "-h", "localhost", "-p", "5432"]
  initialDelaySeconds: 60
  periodSeconds: 30
  timeoutSeconds: 10
  failureThreshold: 3

readinessProbe:
  tcpSocket:
    port: 5432
  initialDelaySeconds: 10
  periodSeconds: 5
  timeoutSeconds: 5
  failureThreshold: 3
```

### Troubleshooting Probes

#### 1. Common Issues and Solutions

**Probe Failing Immediately**:
- Check if health endpoint exists and is accessible
- Verify port numbers are correct
- Ensure application is listening on the specified port
- Check for network policies blocking probe traffic

**Probe Timing Out**:
- Increase `timeoutSeconds` if application is slow to respond
- Optimize health check endpoint performance
- Consider using lighter health checks (TCP vs HTTP)

**False Positives**:
- Increase `failureThreshold` to allow for temporary issues
- Use more specific health checks
- Monitor application logs during probe failures

**False Negatives**:
- Decrease `failureThreshold` for faster failure detection
- Use more comprehensive health checks
- Ensure health endpoints are reliable

#### 2. Debugging Commands

```bash
# Check pod status and events
kubectl describe pod <pod-name>

# View pod logs
kubectl logs <pod-name>

# Check probe status
kubectl get events --field-selector involvedObject.name=<pod-name>

# Test probe manually
kubectl exec <pod-name> -- curl -f http://localhost:8080/health

# Check if port is listening
kubectl exec <pod-name> -- netstat -tlnp

# Test TCP connection
kubectl exec <pod-name> -- nc -zv localhost 3306
```

#### 3. Probe Monitoring

**Metrics to Monitor**:
- Probe success/failure rates
- Probe response times
- Container restart frequency
- Service endpoint changes

**Alerting**:
- High probe failure rates
- Frequent container restarts
- Probes timing out consistently
- Readiness probe failures affecting traffic

### Advanced Probe Concepts

#### 1. Probe Dependencies and Coordination
Probes can be designed to work together in sophisticated ways:

**Probe Chain Pattern**:
```yaml
# Startup probe ensures application is ready before liveness/readiness
startupProbe:
  httpGet:
    path: /health/startup
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 30

# Liveness probe only starts after startup succeeds
livenessProbe:
  httpGet:
    path: /health/live
    port: 8080
  initialDelaySeconds: 0  # Starts immediately after startup
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3

# Readiness probe checks dependencies
readinessProbe:
  httpGet:
    path: /health/ready
    port: 8080
  initialDelaySeconds: 0
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 3
```

#### 2. Probe with Custom Headers and Authentication
```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 8080
    httpHeaders:
    - name: Authorization
      value: "Bearer ${HEALTH_CHECK_TOKEN}"
    - name: X-Health-Check
      value: "true"
    - name: User-Agent
      value: "kubelet-health-check/1.0"
```

#### 3. Probe with TLS/SSL Verification
```yaml
readinessProbe:
  httpGet:
    path: /health/ready
    port: 8443
    scheme: HTTPS
    httpHeaders:
    - name: Host
      value: "api.example.com"
```

#### 4. Advanced Exec Probe Patterns

**Database Connection Check**:
```yaml
readinessProbe:
  exec:
    command:
    - /bin/sh
    - -c
    - |
      pg_isready -h localhost -p 5432 -U postgres -d mydb
      if [ $? -eq 0 ]; then
        echo "Database is ready"
        exit 0
      else
        echo "Database is not ready"
        exit 1
      fi
  initialDelaySeconds: 10
  periodSeconds: 5
  timeoutSeconds: 5
  failureThreshold: 3
```

**Application Health Check with Metrics**:
```yaml
livenessProbe:
  exec:
    command:
    - /bin/sh
    - -c
    - |
      # Check if application process is running
      if ! pgrep -f "myapp" > /dev/null; then
        echo "Application process not found"
        exit 1
      fi
      
      # Check memory usage
      MEMORY_USAGE=$(ps -o %mem= -p $(pgrep -f "myapp"))
      if (( $(echo "$MEMORY_USAGE > 90" | bc -l) )); then
        echo "Memory usage too high: ${MEMORY_USAGE}%"
        exit 1
      fi
      
      # Check disk space
      DISK_USAGE=$(df /app/data | tail -1 | awk '{print $5}' | sed 's/%//')
      if [ "$DISK_USAGE" -gt 90 ]; then
        echo "Disk usage too high: ${DISK_USAGE}%"
        exit 1
      fi
      
      echo "Application is healthy"
      exit 0
  initialDelaySeconds: 30
  periodSeconds: 30
  timeoutSeconds: 10
  failureThreshold: 3
```

#### 5. Probe with External Dependencies

**Service Dependency Check**:
```yaml
readinessProbe:
  exec:
    command:
    - /bin/sh
    - -c
    - |
      # Check if required services are available
      SERVICES=("redis:6379" "postgresql:5432" "elasticsearch:9200")
      
      for service in "${SERVICES[@]}"; do
        host=$(echo $service | cut -d: -f1)
        port=$(echo $service | cut -d: -f2)
        
        if ! nc -z $host $port 2>/dev/null; then
          echo "Service $service is not available"
          exit 1
        fi
      done
      
      echo "All required services are available"
      exit 0
  initialDelaySeconds: 15
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

#### 6. Probe with Custom Response Validation

**JSON Response Validation**:
```yaml
readinessProbe:
  exec:
    command:
    - /bin/sh
    - -c
    - |
      # Make HTTP request and validate JSON response
      RESPONSE=$(curl -s -f http://localhost:8080/health/ready)
      if [ $? -ne 0 ]; then
        echo "Health endpoint not responding"
        exit 1
      fi
      
      # Parse JSON response
      STATUS=$(echo $RESPONSE | jq -r '.status')
      DEPENDENCIES=$(echo $RESPONSE | jq -r '.dependencies.database')
      
      if [ "$STATUS" != "healthy" ] || [ "$DEPENDENCIES" != "connected" ]; then
        echo "Health check failed: status=$STATUS, database=$DEPENDENCIES"
        exit 1
      fi
      
      echo "Health check passed"
      exit 0
  initialDelaySeconds: 10
  periodSeconds: 5
  timeoutSeconds: 5
  failureThreshold: 3
```

## Practical Probe Testing with Docker Simulator

To understand and test Kubernetes probes (readinessProbe, livenessProbe, and startupProbe), you can create a simple Docker image that simulates delays and failures for each probe type.

### 🛠 Sample Docker App (Python Flask)

This app will:
- **Fail readiness** for 20 seconds after starting
- **Fail startup** for 10 seconds
- **Fail liveness** every 40 seconds to simulate a crash

#### 1. app.py
```python
from flask import Flask
import time

app = Flask(__name__)

start_time = time.time()

@app.route('/')
def hello():
    return "App is running!\n"

@app.route('/readiness')
def readiness():
    # Fails readiness for first 20 seconds
    if time.time() - start_time < 20:
        return "Not Ready\n", 503
    return "Ready\n", 200

@app.route('/liveness')
def liveness():
    # Fails every 40 seconds for 10 seconds
    elapsed = time.time() - start_time
    if int(elapsed) % 40 < 10:
        return "Liveness Failed\n", 500
    return "Alive\n", 200

@app.route('/startup')
def startup():
    # Fails for first 10 seconds only
    if time.time() - start_time < 10:
        return "Still starting...\n", 500
    return "Started\n", 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
```

#### 2. Dockerfile
```dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY app.py .

RUN pip install flask

EXPOSE 8080
CMD ["python", "app.py"]
```

#### 3. Build Docker Image
```bash
docker build -t probe-simulator:latest .
```

#### 4. Push to DockerHub (Optional)
```bash
docker tag probe-simulator yourdockerhubusername/probe-simulator
docker push yourdockerhubusername/probe-simulator
```

#### 5. Kubernetes Deployment YAML Example
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: probe-demo
spec:
  replicas: 1
  selector:
    matchLabels:
      app: probe-demo
  template:
    metadata:
      labels:
        app: probe-demo
    spec:
      containers:
      - name: probe-simulator
        image: yourdockerhubusername/probe-simulator:latest
        ports:
        - containerPort: 8080
        readinessProbe:
          httpGet:
            path: /readiness
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
        livenessProbe:
          httpGet:
            path: /liveness
            port: 8080
          initialDelaySeconds: 15
          periodSeconds: 10
        startupProbe:
          httpGet:
            path: /startup
            port: 8080
          failureThreshold: 3
          periodSeconds: 5
```

### ✅ What You'll Observe

#### Startup Probe Behavior
- Container will get 15 seconds (3 attempts × 5 sec) to become healthy
- If startup fails, liveness and readiness probes are disabled
- Once startup succeeds, normal probe behavior resumes

#### Readiness Probe Behavior
- Won't route traffic until `/readiness` returns 200
- Pod remains in "NotReady" state for first 20 seconds
- After 20 seconds, pod becomes ready and receives traffic

#### Liveness Probe Behavior
- Restarts the container periodically when `/liveness` fails
- Fails every 40 seconds for 10 seconds duration
- Container gets fresh start after each liveness failure

### 🔍 Testing and Monitoring

#### Deploy and Monitor
```bash
# Deploy the probe simulator
kubectl apply -f probe-demo.yaml

# Watch pod status
kubectl get pods -w

# Check pod events
kubectl describe pod <pod-name>

# View logs
kubectl logs <pod-name> -f

# Test endpoints manually
kubectl port-forward <pod-name> 8080:8080
curl http://localhost:8080/startup
curl http://localhost:8080/readiness
curl http://localhost:8080/liveness
```

#### Expected Timeline
```
0s:   Container starts
5s:   Startup probe begins (fails)
10s:  Startup probe succeeds
15s:  Liveness probe begins
20s:  Readiness probe succeeds (pod becomes ready)
40s:  Liveness probe fails (container restarts)
50s:  New container starts, cycle repeats
```

### 🎯 Advanced Testing Scenarios

#### 1. Custom Probe Timing
```yaml
startupProbe:
  httpGet:
    path: /startup
    port: 8080
  initialDelaySeconds: 2
  periodSeconds: 3
  timeoutSeconds: 2
  failureThreshold: 10  # Allow 30 seconds total
```

#### 2. Different Failure Patterns
```python
# Modify app.py for different scenarios
@app.route('/liveness')
def liveness():
    # Fail every 30 seconds instead of 40
    elapsed = time.time() - start_time
    if int(elapsed) % 30 < 5:
        return "Liveness Failed\n", 500
    return "Alive\n", 200
```

#### 3. Gradual Recovery
```python
@app.route('/readiness')
def readiness():
    # Gradual recovery over 30 seconds
    elapsed = time.time() - start_time
    if elapsed < 20:
        return "Not Ready\n", 503
    elif elapsed < 30:
        # 50% chance of success during recovery
        import random
        if random.random() < 0.5:
            return "Ready\n", 200
        else:
            return "Recovering\n", 503
    return "Ready\n", 200
```

### 📊 Monitoring Probe Behavior

#### Prometheus Metrics
```yaml
# Add annotations for Prometheus monitoring
metadata:
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "8080"
    prometheus.io/path: "/metrics"
```

#### Custom Metrics Endpoint
```python
@app.route('/metrics')
def metrics():
    elapsed = time.time() - start_time
    return f"""
# HELP probe_simulator_uptime_seconds Uptime in seconds
# TYPE probe_simulator_uptime_seconds gauge
probe_simulator_uptime_seconds {elapsed}

# HELP probe_simulator_ready_status Readiness status
# TYPE probe_simulator_ready_status gauge
probe_simulator_ready_status {1 if elapsed >= 20 else 0}

# HELP probe_simulator_live_status Liveness status
# TYPE probe_simulator_live_status gauge
probe_simulator_live_status {0 if int(elapsed) % 40 < 10 else 1}
"""
```

### 🔧 Troubleshooting the Simulator

#### Common Issues
1. **Container not starting**: Check Docker image build and push
2. **Probes not working**: Verify endpoint paths and ports
3. **Timing issues**: Adjust probe parameters based on application behavior
4. **Network issues**: Ensure port forwarding and service connectivity

#### Debug Commands
```bash
# Check if container is running
kubectl exec <pod-name> -- ps aux

# Test endpoints from inside container
kubectl exec <pod-name> -- curl -s http://localhost:8080/startup
kubectl exec <pod-name> -- curl -s http://localhost:8080/readiness
kubectl exec <pod-name> -- curl -s http://localhost:8080/liveness

# Check probe events
kubectl get events --field-selector involvedObject.name=<pod-name>

# Monitor probe timing
kubectl describe pod <pod-name> | grep -A 10 "Events:"
```

This practical example provides hands-on experience with Kubernetes probes and helps understand their behavior in real-world scenarios.

### Probe Parameters Explained
- **initialDelaySeconds**: Time to wait before first probe
- **periodSeconds**: How often to perform the probe
- **timeoutSeconds**: Time to wait for probe response
- **failureThreshold**: Number of failures before considering probe failed
- **successThreshold**: Number of successes before considering probe successful

---
