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

### Probe Parameters Explained
- **initialDelaySeconds**: Time to wait before first probe
- **periodSeconds**: How often to perform the probe
- **timeoutSeconds**: Time to wait for probe response
- **failureThreshold**: Number of failures before considering probe failed
- **successThreshold**: Number of successes before considering probe successful

---
