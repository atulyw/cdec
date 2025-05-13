# AWS EC2 Complete Guide

## Table of Contents
1. [EC2 Dashboard Overview](#ec2-dashboard-overview)
2. [Instance Types](#instance-types)
3. [Instance Status Checks](#instance-status-checks)
4. [Amazon Machine Images (AMI)](#amazon-machine-images)
5. [Launch Templates](#launch-templates)
6. [Purchasing Options](#purchasing-options)

## EC2 Dashboard Overview

### Main Components
1. **Instances Dashboard**
   - Running instances
   - Instance state
   - Instance type
   - Public/Private IP
   - Key pair name
   - VPC ID
   - Security groups

2. **Quick Actions**
   - Launch instance
   - Connect to instance
   - Create AMI
   - Create launch template
   - View instance details

3. **Monitoring**
   - CPU utilization
   - Network in/out
   - Disk read/write
   - Status checks

## Instance Types

### General Purpose
1. **T4g/T3**
   - Burstable performance
   - Good for variable workloads
   - Cost-effective
   - Use cases: Web servers, development environments

2. **M6g/M5**
   - Balanced compute, memory, and networking
   - Consistent performance
   - Use cases: Application servers, databases

### Compute Optimized
1. **C6g/C5**
   - High-performance processors
   - Compute-intensive workloads
   - Use cases: Batch processing, high-traffic web servers

### Memory Optimized
1. **R6g/R5**
   - High memory-to-vCPU ratio
   - Use cases: In-memory databases, real-time big data

2. **X1/X1e**
   - Highest memory capacity
   - Use cases: SAP HANA, in-memory databases

### Storage Optimized
1. **I3/I3en**
   - High I/O performance
   - Use cases: NoSQL databases, data warehousing

2. **D2/D3**
   - Dense storage
   - Use cases: File servers, data warehousing

### Accelerated Computing
1. **P4/P3**
   - GPU instances
   - Use cases: Machine learning, graphics processing

2. **Inf1**
   - AWS Inferentia chips
   - Use cases: Machine learning inference

## Instance Status Checks

### System Status Checks
1. **Hardware Issues**
   - Physical host problems
   - Network connectivity
   - Power issues

2. **Software Issues**
   - Kernel problems
   - System configuration
   - File system issues

### Instance Status Checks
1. **Network Configuration**
   - Network interface status
   - IP configuration
   - Security group rules

2. **Instance Reachability**
   - Instance response
   - Instance state
   - Instance configuration

### Troubleshooting Status Checks
1. **Failed System Check**
   - Stop and start instance
   - Contact AWS support
   - Migrate to new hardware

2. **Failed Instance Check**
   - Check instance logs
   - Verify security groups
   - Check instance configuration

## Amazon Machine Images (AMI)

### AMI Types
1. **Public AMIs**
   - AWS-provided
   - Community-provided
   - Marketplace AMIs

2. **Private AMIs**
   - Custom-built
   - Organization-specific
   - Shared within account

3. **AWS Marketplace AMIs**
   - Third-party software
   - Licensed applications
   - Pre-configured solutions

### Creating AMIs
1. **From Running Instance**
   ```bash
   # Using AWS Console
   1. Select instance
   2. Actions > Image and templates > Create image
   3. Configure image details
   4. Create AMI
   ```

### Copying AMIs
1. **Same Region**
   ```bash
   # Using AWS Console
   1. Select AMI
   2. Actions > Copy AMI
   3. Configure copy settings
   4. Copy AMI
   ```

2. **Cross-Region**
   ```bash
   # Using AWS Console
   1. Select AMI
   2. Actions > Copy AMI
   3. Select destination region
   4. Configure copy settings
   5. Copy AMI
   ```

## Launch Templates

### Components
1. **Basic Configuration**
   - AMI ID
   - Instance type
   - Key pair
   - Security groups

2. **Advanced Configuration**
   - User data
   - IAM role
   - Storage configuration
   - Network settings

### Creating Launch Templates
1. **Using Console**
   ```bash
   1. EC2 Dashboard > Launch Templates
   2. Create launch template
   3. Configure template details
   4. Create template
   ```

## Purchasing Options

### On-Demand Instances
1. **Features**
   - Pay per second
   - No upfront commitment
   - Maximum flexibility

2. **Use Cases**
   - Development
   - Testing
   - Unpredictable workloads

### Reserved Instances
1. **Types**
   - Standard (up to 72% discount)
   - Convertible (up to 54% discount)
   - Scheduled (up to 65% discount)

2. **Payment Options**
   - All upfront
   - Partial upfront
   - No upfront

### Spot Instances
1. **Features**
   - Up to 90% discount
   - Bid-based pricing
   - Can be interrupted

2. **Use Cases**
   - Batch processing
   - Data analysis
   - Flexible workloads

### Dedicated Instances
1. **Types**
   - Dedicated Instances
   - Dedicated Hosts

2. **Use Cases**
   - Compliance requirements
   - Software licensing
   - Hardware isolation

### Savings Plans
1. **Types**
   - Compute Savings Plans
   - EC2 Instance Savings Plans

2. **Benefits**
   - Flexible instance family
   - Region flexibility
   - Automatic cost optimization 

# EC2 Instance Types: Detailed Guide

## General Purpose (T4g, T3, M6g, M5)

### T4g/T3 (Burstable Performance)
1. **Characteristics**
   - Burstable CPU performance
   - Baseline performance with ability to burst
   - Credits-based system
   - Cost-effective for variable workloads

2. **Use Cases**
   - Web servers
   - Development environments
   - Small databases
   - Low-latency interactive applications

3. **Performance Features**
   - CPU Credits
   - Unlimited mode option
   - Network performance up to 5 Gbps
   - EBS-optimized by default

### M6g/M5 (Balanced)
1. **Characteristics**
   - Balanced compute, memory, and networking
   - Consistent performance
   - No CPU credits needed
   - Higher baseline performance than T-series

2. **Use Cases**
   - Application servers
   - Backend servers
   - Small to medium databases
   - Microservices

3. **Performance Features**
   - Up to 40 Gbps network performance
   - Up to 19 Gbps EBS bandwidth
   - Support for EBS-optimized instances

## Compute Optimized (C6g, C5)

### Characteristics
1. **Processing Power**
   - High-performance processors
   - Highest compute performance
   - Optimized for compute-intensive tasks
   - Lower memory-to-vCPU ratio

2. **Use Cases**
   - High-traffic web servers
   - Batch processing
   - Media transcoding
   - Scientific modeling
   - Machine learning inference

3. **Performance Features**
   - Up to 50 Gbps network performance
   - Up to 19 Gbps EBS bandwidth
   - Support for EBS-optimized instances

## Memory Optimized (R6g, R5, X1, X1e)

### R6g/R5 (High Memory)
1. **Characteristics**
   - High memory-to-vCPU ratio
   - Optimized for memory-intensive applications
   - Cost-effective for memory-heavy workloads

2. **Use Cases**
   - In-memory databases
   - Real-time big data analytics
   - High-performance caching
   - Enterprise applications

3. **Performance Features**
   - Up to 50 Gbps network performance
   - Up to 19 Gbps EBS bandwidth
   - Support for EBS-optimized instances

### X1/X1e (Highest Memory)
1. **Characteristics**
   - Highest memory capacity
   - Optimized for in-memory databases
   - Highest memory-to-vCPU ratio

2. **Use Cases**
   - SAP HANA
   - In-memory databases
   - High-performance computing
   - Large-scale data processing

3. **Performance Features**
   - Up to 25 Gbps network performance
   - Up to 14 Gbps EBS bandwidth
   - Support for EBS-optimized instances

## Storage Optimized (I3, I3en, D2, D3)

### I3/I3en (High I/O)
1. **Characteristics**
   - High I/O performance
   - NVMe SSD storage
   - Optimized for I/O-intensive workloads

2. **Use Cases**
   - NoSQL databases
   - Data warehousing
   - High-frequency trading
   - Real-time analytics

3. **Performance Features**
   - Up to 16 TB NVMe storage
   - Up to 4 million IOPS
   - Up to 16 Gbps network performance

### D2/D3 (Dense Storage)
1. **Characteristics**
   - Dense storage capacity
   - HDD-based storage
   - Cost-effective for storage-heavy workloads

2. **Use Cases**
   - File servers
   - Data warehousing
   - Log processing
   - Big data analytics

3. **Performance Features**
   - Up to 48 TB HDD storage
   - Up to 1.8 million IOPS
   - Up to 25 Gbps network performance

## Accelerated Computing (P4, P3, Inf1)

### P4/P3 (GPU)
1. **Characteristics**
   - NVIDIA GPU instances
   - High-performance computing
   - Optimized for parallel processing

2. **Use Cases**
   - Machine learning
   - Deep learning
   - Graphics processing
   - Video encoding
   - 3D rendering

3. **Performance Features**
   - Up to 8 NVIDIA GPUs
   - Up to 400 Gbps network performance
   - Up to 19 Gbps EBS bandwidth

### Inf1 (Inferentia)
1. **Characteristics**
   - AWS Inferentia chips
   - Optimized for machine learning inference
   - Cost-effective inference

2. **Use Cases**
   - Machine learning inference
   - Real-time predictions
   - Natural language processing
   - Computer vision

3. **Performance Features**
   - Up to 16 Inferentia chips
   - Up to 100 Gbps network performance
   - Up to 19 Gbps EBS bandwidth

## Selection Guidelines

### Factors to Consider
1. **Workload Type**
   - CPU-intensive vs Memory-intensive
   - Storage requirements
   - Network requirements
   - GPU requirements

2. **Performance Requirements**
   - Baseline performance needs
   - Burst requirements
   - I/O requirements
   - Network throughput

3. **Cost Considerations**
   - On-demand vs Reserved pricing
   - Storage costs
   - Data transfer costs
   - Instance family pricing

### Best Practices
1. **Right-sizing**
   - Start with smaller instances
   - Monitor performance
   - Scale based on metrics
   - Use CloudWatch for monitoring

2. **Cost Optimization**
   - Use Reserved Instances for steady workloads
   - Use Spot Instances for flexible workloads
   - Consider Savings Plans
   - Monitor and adjust instance types 

# EC2 Instance Types Comparison Tables

## General Purpose Instances

| Instance Type | Characteristics | Use Cases | Performance Features |
|--------------|----------------|-----------|---------------------|
| **T4g/T3** | • Burstable CPU performance<br>• Credits-based system<br>• Cost-effective | • Web servers<br>• Development environments<br>• Small databases | • CPU Credits<br>• Up to 5 Gbps network<br>• EBS-optimized |
| **M6g/M5** | • Balanced compute/memory<br>• Consistent performance<br>• No CPU credits | • Application servers<br>• Backend servers<br>• Microservices | • Up to 40 Gbps network<br>• Up to 19 Gbps EBS<br>• EBS-optimized |

## Compute Optimized Instances

| Instance Type | Characteristics | Use Cases | Performance Features |
|--------------|----------------|-----------|---------------------|
| **C6g/C5** | • High-performance processors<br>• Highest compute performance<br>• Lower memory ratio | • High-traffic web servers<br>• Batch processing<br>• Media transcoding | • Up to 50 Gbps network<br>• Up to 19 Gbps EBS<br>• EBS-optimized |

## Memory Optimized Instances

| Instance Type | Characteristics | Use Cases | Performance Features |
|--------------|----------------|-----------|---------------------|
| **R6g/R5** | • High memory-to-vCPU ratio<br>• Memory-intensive optimized<br>• Cost-effective | • In-memory databases<br>• Real-time analytics<br>• High-performance caching | • Up to 50 Gbps network<br>• Up to 19 Gbps EBS<br>• EBS-optimized |
| **X1/X1e** | • Highest memory capacity<br>• Highest memory ratio<br>• Enterprise-grade | • SAP HANA<br>• In-memory databases<br>• Large-scale processing | • Up to 25 Gbps network<br>• Up to 14 Gbps EBS<br>• EBS-optimized |

## Storage Optimized Instances

| Instance Type | Characteristics | Use Cases | Performance Features |
|--------------|----------------|-----------|---------------------|
| **I3/I3en** | • High I/O performance<br>• NVMe SSD storage<br>• I/O-intensive optimized | • NoSQL databases<br>• Data warehousing<br>• High-frequency trading | • Up to 16 TB NVMe<br>• Up to 4M IOPS<br>• Up to 16 Gbps network |
| **D2/D3** | • Dense storage capacity<br>• HDD-based storage<br>• Cost-effective storage | • File servers<br>• Data warehousing<br>• Log processing | • Up to 48 TB HDD<br>• Up to 1.8M IOPS<br>• Up to 25 Gbps network |

## Accelerated Computing Instances

| Instance Type | Characteristics | Use Cases | Performance Features |
|--------------|----------------|-----------|---------------------|
| **P4/P3** | • NVIDIA GPU instances<br>• High-performance computing<br>• Parallel processing | • Machine learning<br>• Deep learning<br>• Graphics processing | • Up to 8 NVIDIA GPUs<br>• Up to 400 Gbps network<br>• Up to 19 Gbps EBS |
| **Inf1** | • AWS Inferentia chips<br>• ML inference optimized<br>• Cost-effective inference | • ML inference<br>• Real-time predictions<br>• NLP/Computer vision | • Up to 16 Inferentia chips<br>• Up to 100 Gbps network<br>• Up to 19 Gbps EBS |

## Instance Selection Matrix

| Workload Type | Recommended Instance Types | Key Considerations |
|--------------|---------------------------|-------------------|
| **Web Applications** | • T3/T4g (small)<br>• M5/M6g (medium)<br>• C5/C6g (high-traffic) | • CPU requirements<br>• Memory needs<br>• Network traffic |
| **Databases** | • R5/R6g (in-memory)<br>• I3/I3en (NoSQL)<br>• X1/X1e (large) | • Memory requirements<br>• I/O performance<br>• Storage needs |
| **Big Data** | • D2/D3 (storage)<br>• R5/R6g (processing)<br>• I3/I3en (analytics) | • Storage capacity<br>• Processing power<br>• Network bandwidth |
| **Machine Learning** | • P3/P4 (training)<br>• Inf1 (inference)<br>• C5/C6g (preprocessing) | • GPU requirements<br>• Memory needs<br>• Network performance |

## Cost Optimization Matrix

| Instance Type | Best For | Cost-Saving Options |
|--------------|----------|-------------------|
| **T3/T4g** | Variable workloads | • Unlimited mode<br>• Reserved instances<br>• Spot instances |
| **M5/M6g** | Steady workloads | • Reserved instances<br>• Savings plans<br>• Right-sizing |
| **C5/C6g** | Compute-intensive | • Reserved instances<br>• Spot instances<br>• Auto-scaling |
| **R5/R6g** | Memory-intensive | • Reserved instances<br>• Savings plans<br>• Right-sizing |
| **I3/I3en** | I/O-intensive | • Reserved instances<br>• Storage optimization<br>• Right-sizing |
| **P3/P4** | GPU workloads | • Spot instances<br>• Reserved instances<br>• Auto-scaling |
| **Inf1** | ML inference | • Reserved instances<br>• Savings plans<br>• Right-sizing | 