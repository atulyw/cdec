# Kubernetes Theory Notes

## Table of Contents
1. [Introduction to Kubernetes](#introduction-to-kubernetes)
2. [Kubernetes Architecture](#kubernetes-architecture)
3. [Core Concepts](#core-concepts)
4. [Kubernetes Objects](#kubernetes-objects)
5. [Networking](#networking)
6. [Storage](#storage)
7. [Security](#security)
8. [Scaling and Load Balancing](#scaling-and-load-balancing)
9. [Monitoring and Logging](#monitoring-and-logging)
10. [Best Practices](#best-practices)

---

## Introduction to Kubernetes

### What is Kubernetes?
- **Kubernetes (K8s)** is an open-source container orchestration platform
- Originally developed by Google, now maintained by the Cloud Native Computing Foundation (CNCF)
- Automates deployment, scaling, and management of containerized applications
- Provides a platform for running distributed systems resiliently

### Key Benefits
- **Portability**: Run applications consistently across different environments
- **Scalability**: Automatically scale applications up or down based on demand
- **High Availability**: Distribute applications across multiple nodes for fault tolerance
- **Resource Efficiency**: Optimize resource utilization through intelligent scheduling
- **Self-healing**: Automatically restart failed containers and replace unhealthy nodes

### Container Orchestration
- **Containerization**: Packaging applications with dependencies into isolated units
- **Orchestration**: Coordinating multiple containers across multiple hosts
- **Service Discovery**: Automatically finding and connecting services
- **Load Balancing**: Distributing traffic across multiple instances
- **Rolling Updates**: Updating applications without downtime

---

## Kubernetes Architecture

### Control Plane Components

#### 1. API Server
- **Purpose**: Central communication hub for all Kubernetes components
- **Function**: Exposes REST API for cluster operations
- **Authentication**: Validates requests and manages access control
- **Storage**: Stores cluster state in etcd

#### 2. etcd
- **Purpose**: Distributed key-value store for cluster data
- **Function**: Stores all cluster configuration and state
- **Consistency**: Ensures data consistency across the cluster
- **Backup**: Critical for disaster recovery

#### 3. Scheduler
- **Purpose**: Assigns pods to nodes based on resource requirements
- **Function**: Watches for unscheduled pods and assigns them to nodes
- **Criteria**: Considers resource availability, constraints, and policies
- **Extensibility**: Supports custom scheduling policies

#### 4. Controller Manager
- **Purpose**: Runs controller processes that maintain cluster state
- **Controllers**: Node controller, replication controller, endpoints controller
- **Function**: Ensures desired state matches actual state
- **Reconciliation**: Continuously monitors and corrects deviations

### Worker Node Components

#### 1. Kubelet
- **Purpose**: Primary node agent that runs on each node
- **Function**: Manages pod lifecycle and container runtime
- **Communication**: Communicates with API server and container runtime
- **Health Checks**: Monitors container health and reports status

#### 2. Kube-proxy
- **Purpose**: Network proxy that maintains network rules
- **Function**: Implements network policies and service abstraction
- **Load Balancing**: Provides load balancing for services
- **Network Rules**: Manages iptables rules for pod communication

#### 3. Container Runtime
- **Purpose**: Software responsible for running containers
- **Examples**: containerd, CRI-O, Docker
- **Function**: Pulls container images and runs containers
- **Interface**: Implements Container Runtime Interface (CRI)

---

## Core Concepts

### Pods
- **Definition**: Smallest deployable unit in Kubernetes
- **Characteristics**: 
  - Contains one or more containers
  - Shares network namespace
  - Shares storage volumes
  - Has a unique IP address
- **Lifecycle**: Created, scheduled, running, succeeded/failed, terminated

### Namespaces
- **Purpose**: Provides isolation and organization within a cluster
- **Default Namespaces**: default, kube-system, kube-public, kube-node-lease
- **Resource Quotas**: Limit resource consumption per namespace
- **RBAC**: Control access permissions at namespace level

### Labels and Selectors
- **Labels**: Key-value pairs attached to objects for identification
- **Selectors**: Used to query and filter objects based on labels
- **Types**: Equality-based and set-based selectors
- **Use Cases**: Service discovery, deployment management, monitoring

### Annotations
- **Purpose**: Store non-identifying metadata about objects
- **Characteristics**: Not used for querying or filtering
- **Use Cases**: Documentation, tooling integration, deployment metadata

---

## Kubernetes Objects

### Workload Resources

#### 1. Deployments
- **Purpose**: Manage stateless applications with declarative updates
- **Features**: Rolling updates, rollbacks, scaling
- **Strategy**: Recreate or RollingUpdate
- **Replicas**: Maintains desired number of pod replicas

#### 2. StatefulSets
- **Purpose**: Manage stateful applications with stable identities
- **Features**: Ordered deployment, stable network identities, persistent storage
- **Use Cases**: Databases, message queues, distributed systems
- **Constraints**: Sequential pod creation and deletion

#### 3. DaemonSets
- **Purpose**: Ensure all nodes run a copy of a specific pod
- **Use Cases**: Log collection, monitoring, storage daemons
- **Features**: Automatic deployment to new nodes
- **Examples**: Fluentd, Prometheus Node Exporter

#### 4. Jobs and CronJobs
- **Jobs**: Run to completion tasks
- **CronJobs**: Scheduled jobs using cron syntax
- **Features**: Parallel execution, retry policies, completion tracking
- **Use Cases**: Batch processing, data analysis, maintenance tasks

### Service and Networking

#### 1. Services
- **Purpose**: Expose applications running on pods
- **Types**: ClusterIP, NodePort, LoadBalancer, ExternalName
- **Features**: Load balancing, service discovery, health checking
- **Endpoints**: Automatically updated based on pod labels

#### 2. Ingress
- **Purpose**: Manage external access to services
- **Features**: HTTP/HTTPS routing, SSL termination, name-based virtual hosting
- **Controllers**: NGINX, Traefik, HAProxy
- **Rules**: Define routing based on hostnames and paths

### Configuration and Storage

#### 1. ConfigMaps
- **Purpose**: Store non-confidential configuration data
- **Use Cases**: Environment variables, configuration files
- **Mounting**: Can be mounted as files or environment variables
- **Updates**: Changes require pod restart

#### 2. Secrets
- **Purpose**: Store sensitive information securely
- **Types**: Opaque, TLS, Docker registry
- **Encryption**: Encrypted at rest in etcd
- **Access**: RBAC-controlled access

#### 3. PersistentVolumes (PV) and PersistentVolumeClaims (PVC)
- **PV**: Storage provisioned by administrator
- **PVC**: Request for storage by user
- **Binding**: PVCs are bound to PVs based on criteria
- **Lifecycle**: Independent of pod lifecycle

---

## Networking

### Pod Networking
- **Pod Network**: Each pod gets a unique IP address
- **CNI**: Container Network Interface for network implementation
- **Overlay Networks**: Flannel, Calico, Weave Net
- **Cross-node Communication**: Pods can communicate across nodes

### Service Networking
- **ClusterIP**: Internal service accessible within cluster
- **NodePort**: Exposes service on node's IP and port
- **LoadBalancer**: Exposes service externally using cloud load balancer
- **ExternalName**: Maps service to external DNS name

### Network Policies
- **Purpose**: Control traffic flow between pods
- **Rules**: Ingress and egress rules based on labels
- **Implementation**: Requires network plugin support
- **Use Cases**: Security isolation, microservices communication

### DNS and Service Discovery
- **CoreDNS**: Default DNS server for Kubernetes
- **Service Names**: Automatically resolvable within cluster
- **FQDN**: Fully Qualified Domain Names for services
- **Headless Services**: Direct pod DNS resolution

---

## Storage

### Volume Types
- **emptyDir**: Temporary storage that exists with pod
- **hostPath**: Mounts host file system into pod
- **nfs**: Network File System storage
- **awsElasticBlockStore**: AWS EBS volumes
- **azureDisk**: Azure managed disks
- **gcePersistentDisk**: Google Cloud persistent disks

### Storage Classes
- **Purpose**: Define different types of storage
- **Provisioning**: Dynamic provisioning of storage
- **Parameters**: Storage-specific configuration
- **Default**: Marked as default storage class

### Volume Snapshots
- **Purpose**: Create point-in-time copies of volumes
- **Backup**: Enable backup and restore workflows
- **Consistency**: Application-consistent snapshots
- **Lifecycle**: Independent of volume lifecycle

---

## Security

### Authentication
- **Service Accounts**: Pod identity for API access
- **Tokens**: Bearer tokens for authentication
- **Certificates**: X.509 certificates for mutual TLS
- **External Providers**: OIDC, webhook authentication

### Authorization (RBAC)
- **Roles**: Define permissions within a namespace
- **ClusterRoles**: Define permissions across the cluster
- **RoleBindings**: Bind roles to users/groups/service accounts
- **ClusterRoleBindings**: Bind cluster roles across the cluster

### Admission Controllers
- **Purpose**: Intercept requests to API server
- **Validation**: Validate requests before persistence
- **Mutation**: Modify requests before processing
- **Examples**: PodSecurityPolicy, ResourceQuota, LimitRanger

### Pod Security Standards
- **Privileged**: Unrestricted access
- **Baseline**: Minimal restrictions
- **Restricted**: Maximum security restrictions
- **Implementation**: Pod Security Admission controller

### Network Security
- **Network Policies**: Control pod-to-pod communication
- **TLS**: Encrypt communication between components
- **mTLS**: Mutual TLS for service-to-service communication
- **Secrets**: Secure storage of certificates and keys

---

## Scaling and Load Balancing

### Horizontal Pod Autoscaling (HPA)
- **Purpose**: Automatically scale pods based on metrics
- **Metrics**: CPU, memory, custom metrics
- **Algorithm**: Target utilization-based scaling
- **Limits**: Minimum and maximum replica counts

### Vertical Pod Autoscaling (VPA)
- **Purpose**: Automatically adjust pod resource requests
- **Modes**: Off, Initial, Auto
- **Recommendations**: Based on historical usage
- **Constraints**: Cannot be used with HPA for same metric

### Cluster Autoscaling
- **Purpose**: Automatically add/remove nodes based on demand
- **Cloud Integration**: Works with cloud providers
- **Scaling**: Scale up when pods can't be scheduled
- **Scaling Down**: Remove nodes when underutilized

### Load Balancing
- **Service Load Balancing**: Distribute traffic across pods
- **External Load Balancers**: Cloud provider load balancers
- **Ingress Controllers**: Application-level load balancing
- **Session Affinity**: Sticky sessions for stateful applications

---

## Monitoring and Logging

### Metrics
- **Resource Metrics**: CPU, memory, network, disk usage
- **Custom Metrics**: Application-specific metrics
- **Metrics Server**: Aggregates resource usage data
- **Prometheus**: Popular monitoring solution

### Logging
- **Container Logs**: Standard output and error streams
- **Log Aggregation**: Centralized log collection
- **Tools**: Fluentd, Fluent Bit, ELK Stack
- **Retention**: Log rotation and retention policies

### Health Checks
- **Liveness Probes**: Detect application deadlocks
- **Readiness Probes**: Determine if pod is ready to serve traffic
- **Startup Probes**: Detect slow-starting applications
- **Configuration**: HTTP, TCP, or command-based checks

### Observability
- **Distributed Tracing**: Track requests across services
- **Jaeger**: Popular tracing solution
- **OpenTelemetry**: Standard for observability
- **Dashboards**: Grafana, Kibana for visualization

---

## Best Practices

### Application Design
- **Stateless Applications**: Design for horizontal scaling
- **Health Checks**: Implement proper health endpoints
- **Graceful Shutdown**: Handle SIGTERM signals
- **Resource Limits**: Set appropriate resource requests and limits

### Security
- **Principle of Least Privilege**: Minimal required permissions
- **Image Security**: Use trusted base images
- **Secret Management**: Use external secret management
- **Network Policies**: Implement network segmentation

### Resource Management
- **Resource Quotas**: Limit resource consumption
- **Limit Ranges**: Set default resource limits
- **Priority Classes**: Manage pod scheduling priority
- **Node Affinity**: Control pod placement

### Deployment Strategies
- **Rolling Updates**: Zero-downtime deployments
- **Blue-Green Deployment**: Risk-free deployments
- **Canary Deployment**: Gradual traffic shifting
- **Rollback Strategy**: Quick rollback mechanisms

### Monitoring and Alerting
- **Comprehensive Monitoring**: Monitor all components
- **Alerting Rules**: Set up meaningful alerts
- **SLA Monitoring**: Track service level agreements
- **Capacity Planning**: Monitor resource trends

### Backup and Disaster Recovery
- **etcd Backup**: Regular cluster state backups
- **Application Data**: Backup persistent volumes
- **Recovery Procedures**: Document recovery processes
- **Testing**: Regular disaster recovery testing

---

## Conclusion

Kubernetes provides a robust platform for running containerized applications at scale. Understanding these core concepts and best practices is essential for effectively managing Kubernetes clusters and applications. The platform continues to evolve with new features and capabilities, making it important to stay updated with the latest developments in the Kubernetes ecosystem.

### Key Takeaways
- Kubernetes automates container orchestration and management
- Understanding the architecture helps in troubleshooting and optimization
- Security should be implemented at multiple layers
- Monitoring and observability are crucial for production environments
- Following best practices ensures reliable and scalable applications 