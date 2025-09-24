# Datadog APM Setup Guide

This guide provides step-by-step instructions for setting up Datadog APM monitoring in your EKS cluster.

## Prerequisites

- EKS cluster running
- `kubectl` configured to access your cluster
- `helm` installed
- Datadog account with API and APP keys

## Setup Steps

### Step 1: Add Datadog Helm Repository

```bash
# Add the official Datadog Helm repository
helm repo add datadog https://helm.datadoghq.com

# Update the repository to get the latest charts
helm repo update
```

**What this does:**
- Adds Datadog's official Helm repository to your local Helm configuration
- Updates the repository to ensure you have the latest chart versions

### Step 2: Install the Datadog Operator

```bash
# Install the Datadog Operator using Helm
helm install datadog-operator datadog/datadog-operator -n datadog-agent
```

**What this does:**
- Deploys the Datadog Operator to your cluster
- The operator manages Datadog Agent lifecycle and configuration
- You should see a `datadog-operator` pod running after installation

**Verification:**
```bash
kubectl get pods | grep datadog-operator
```

### Step 3: Create Secret with Datadog Credentials

```bash
# Create dedicated namespace for Datadog components
kubectl create namespace datadog-agent

# Create secret with your Datadog API and APP keys
kubectl create secret generic datadog-secret \
  --namespace datadog-agent \
  --from-literal api-key=<DATADOG_API_KEY> \
  --from-literal app-key=<DATADOG_APP_KEY>
```

**Important Notes:**
- Replace `<DATADOG_API_KEY>` with your actual Datadog API key
- Replace `<DATADOG_APP_KEY>` with your actual Datadog APP key
- Keep these credentials secure and never commit them to version control
- The secret is created in the `datadog-agent` namespace

**Security Best Practice:**
Consider using external secret management (AWS Secrets Manager, HashiCorp Vault) for production environments.

### Step 4: Create DatadogAgent Resource

Create a file named `datadog-agent.yaml` with the following content:

```yaml
apiVersion: datadoghq.com/v2alpha1
kind: DatadogAgent
metadata:
  name: datadog
  namespace: datadog-agent
spec:
  global:
    clusterName: <EKS_CLUSTER_NAME>  # Replace with your actual cluster name
    site: datadoghq.com              # or datadoghq.eu, us3.datadoghq.com etc.
    credentials:
      apiSecret:
        secretName: datadog-secret
        keyName: api-key
      appSecret:
        secretName: datadog-secret
        keyName: app-key
  features:
    apm:
      enabled: true
    logCollection:
      enabled: true          # ✅ Enable log collection
      containerCollectAll: true   # ✅ Collect logs from all containers
```

**Configuration Details:**
- `clusterName`: Replace with your actual EKS cluster name (e.g., `backend-dev-cluster`)
- `site`: Choose the appropriate Datadog site based on your region:
  - `datadoghq.com` - US1 (default)
  - `datadoghq.eu` - EU
  - `us3.datadoghq.com` - US3
  - `us5.datadoghq.com` - US5
- `apm.enabled: true` - Enables Application Performance Monitoring
- `logCollection.enabled: true` - Enables log collection and correlation
- `logCollection.containerCollectAll: true` - **Important**: Collects logs from ALL containers in the cluster, not just those with specific annotations

**Apply the configuration:**
```bash
kubectl apply -f datadog-agent.yaml
```

### Log Collection Configuration Explained

The `containerCollectAll: true` setting is crucial for comprehensive log monitoring:

#### What it does:
- **Automatic Log Collection**: Collects logs from ALL containers in your cluster without requiring individual container annotations
- **Simplified Setup**: No need to add log collection annotations to each deployment
- **Complete Coverage**: Ensures no application logs are missed

#### Alternative Approach (if you prefer selective collection):
If you want to collect logs only from specific containers, you can set `containerCollectAll: false` and add this annotation to your deployments:

```yaml
metadata:
  annotations:
    ad.datadoghq.com/<container-name>.logs: '[{"source": "java", "service": "<service-name>"}]'
```

#### Benefits of `containerCollectAll: true`:
- ✅ **Zero Configuration**: Works out of the box with your existing deployments
- ✅ **Complete Visibility**: Captures logs from all services, system pods, and infrastructure
- ✅ **Automatic Correlation**: Logs are automatically correlated with traces using the `DD_LOGS_INJECTION` environment variable we added
- ✅ **Easy Debugging**: All application logs are available in Datadog for troubleshooting

### Step 5: Verify Installation

#### Check Pod Status
```bash
# Check if Datadog Agent pods are running
kubectl get pods -n datadog-agent

# Expected output should show:
# - datadog-agent-* pods (one per node)
# - datadog-operator pod
```

#### Check DatadogAgent Resource
```bash
# Check the status of the DatadogAgent custom resource
kubectl get datadogagent -n datadog-agent

# Get detailed information about the DatadogAgent resource
kubectl describe datadogagent datadog -n datadog-agent
```

#### Check Agent Status
```bash
# Get the name of a Datadog Agent pod
kubectl get pods -n datadog-agent -l app=datadog-agent

# Check the agent status (replace <agent-pod> with actual pod name)
kubectl exec -n datadog-agent <agent-pod> -- agent status
```

**Expected Status Indicators:**
- All pods should be in `Running` state
- Agent status should show "Agent is running" and "Pipelines running"
- No critical errors in the agent logs

## Integration with Your Services

Your backend services have been pre-configured with Datadog APM labels and annotations. Here are the specific changes made to enable Datadog monitoring:

### Changes Made to Deployment Files

#### 1. **Metadata Labels Added**
Each service deployment now includes Datadog-specific labels at both deployment and pod template levels:

```yaml
metadata:
  labels:
    app: <service-name>
    version: v1
    tags.datadoghq.com/env: dev
    tags.datadoghq.com/service: <service-name>
    tags.datadoghq.com/version: v1
```

#### 2. **Pod Template Labels and Annotations**
Added to the pod template metadata:

```yaml
template:
  metadata:
    labels:
      app: <service-name>
      version: v1
      tags.datadoghq.com/env: dev
      tags.datadoghq.com/service: <service-name>
      tags.datadoghq.com/version: v1
      admission.datadoghq.com/enabled: "true"  # Enables admission controller
    annotations:
      admission.datadoghq.com/java-lib.version: v1.53.0  # Java library version
```

#### 3. **Environment Variables Added**
Each service container now includes:

```yaml
env:
  # ... existing environment variables ...
  - name: DD_LOGS_INJECTION
    value: "true"  # Enables trace/span ID injection into logs
```

### Services Configured

#### ✅ **auth-service** (port 8081)
- **File**: `app/backend/auth-service/k8s/deployment.yaml`
- **Service Tag**: `auth-service`
- **Environment**: `dev`

#### ✅ **course-service** (port 8082)
- **File**: `app/backend/course-service/k8s/deployment.yaml`
- **Service Tag**: `course-service`
- **Environment**: `dev`

#### ✅ **enrollment-service** (port 8083)
- **File**: `app/backend/enrollment-service/k8s/deployment.yaml`
- **Service Tag**: `enrollment-service`
- **Environment**: `dev`

### What These Changes Enable

1. **Automatic Library Injection**: The admission controller will automatically inject the Datadog Java library (v1.53.0) into your containers
2. **Service Tagging**: Each service is properly tagged for organization and filtering in Datadog
3. **Log Correlation**: Trace and span IDs are automatically injected into application logs
4. **Environment Separation**: All services are tagged with `env: dev` for environment-based filtering

### Jenkins Pipeline Changes

We also removed SonarCloud analysis stages from all Jenkins pipelines to streamline the build process:

#### Files Modified:
- `app/backend/auth-service/Jenkinsfile` (no SonarCloud stage was present)
- `app/backend/course-service/Jenkinsfile` (removed SonarCloud analysis stage)
- `app/backend/enrollment-service/Jenkinsfile` (removed SonarCloud analysis stage)

#### Benefits:
- Faster build times
- Reduced complexity
- Focus on core CI/CD pipeline stages

### Complete List of Modified Files

#### Kubernetes Deployment Files:
1. **`app/backend/auth-service/k8s/deployment.yaml`**
   - Added Datadog labels to metadata and pod template
   - Added admission controller annotation
   - Added `DD_LOGS_INJECTION` environment variable

2. **`app/backend/course-service/k8s/deployment.yaml`**
   - Added Datadog labels to metadata and pod template
   - Added admission controller annotation
   - Added `DD_LOGS_INJECTION` environment variable

3. **`app/backend/enrollment-service/k8s/deployment.yaml`**
   - Added Datadog labels to metadata and pod template
   - Added admission controller annotation
   - Added `DD_LOGS_INJECTION` environment variable

#### Jenkins Pipeline Files:
1. **`app/backend/course-service/Jenkinsfile`**
   - Removed SonarCloud analysis stage and quality gate checks

2. **`app/backend/enrollment-service/Jenkinsfile`**
   - Removed SonarCloud analysis stage

### Before and After Comparison

#### Before (Original deployment.yaml):
```yaml
metadata:
  labels:
    app: auth-service
    version: v1
spec:
  template:
    metadata:
      labels:
        app: auth-service
        version: v1
    spec:
      containers:
      - name: auth-service
        env:
        - name: MONGO_URI
          value: "..."
        - name: JWT_SECRET
          value: "..."
        - name: SERVER_PORT
          value: "8081"
```

#### After (With Datadog APM):
```yaml
metadata:
  labels:
    app: auth-service
    version: v1
    tags.datadoghq.com/env: dev
    tags.datadoghq.com/service: auth-service
    tags.datadoghq.com/version: v1
spec:
  template:
    metadata:
      labels:
        app: auth-service
        version: v1
        tags.datadoghq.com/env: dev
        tags.datadoghq.com/service: auth-service
        tags.datadoghq.com/version: v1
        admission.datadoghq.com/enabled: "true"
      annotations:
        admission.datadoghq.com/java-lib.version: v1.53.0
    spec:
      containers:
      - name: auth-service
        env:
        - name: MONGO_URI
          value: "..."
        - name: JWT_SECRET
          value: "..."
        - name: SERVER_PORT
          value: "8081"
        - name: DD_LOGS_INJECTION
          value: "true"
```

## Troubleshooting

### Common Issues

1. **Agent Pods Not Starting**
   ```bash
   kubectl describe pod <agent-pod> -n datadog-agent
   kubectl logs <agent-pod> -n datadog-agent
   ```

2. **API Key Issues**
   ```bash
   # Verify secret exists and has correct keys
   kubectl get secret datadog-secret -n datadog-agent -o yaml
   ```

3. **Network Connectivity**
   ```bash
   # Test connectivity from agent pod
   kubectl exec -n datadog-agent <agent-pod> -- curl -I https://app.datadoghq.com
   ```

### Useful Commands

```bash
# View agent logs
kubectl logs -n datadog-agent -l app=datadog-agent

# Check agent configuration
kubectl exec -n datadog-agent <agent-pod> -- agent config

# Restart agent pods
kubectl rollout restart daemonset/datadog-agent -n datadog-agent
```

## Next Steps

1. **Verify APM Data**: Check your Datadog dashboard for incoming traces from your services
2. **Configure Alerts**: Set up monitoring alerts for your applications
3. **Custom Metrics**: Add custom business metrics to your applications
4. **Log Correlation**: Verify that logs are correlated with traces using trace IDs

## Security Considerations

- Store API keys securely (consider using AWS Secrets Manager)
- Use RBAC to limit access to Datadog resources
- Regularly rotate API keys
- Monitor agent resource usage to prevent resource exhaustion

## Cost Optimization

- Configure sampling rates for high-traffic applications
- Use log filtering to reduce log ingestion
- Set up retention policies for logs and traces
- Monitor your Datadog usage in the billing dashboard

---

**Note**: This setup enables comprehensive monitoring of your microservices architecture with automatic trace correlation and log injection. Your applications will automatically start sending telemetry data to Datadog once the agent is running and your services are deployed.
