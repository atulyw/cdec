# Amazon EBS (Elastic Block Store) Notes

## Overview
Amazon EBS provides different volume types that differ in performance characteristics and price, allowing you to tailor storage performance and cost to your application needs.

## EBS Volume Types Comparison Table

| Volume Type | Use Case | Max IOPS | Max Throughput | Min Size | Max Size | Boot Volume | Multi-Attach | Durability |
|-------------|----------|-----------|----------------|-----------|-----------|-------------|--------------|------------|
| gp3 | General purpose | 16,000 | 1,000 MiB/s | 1 GiB | 16 TiB | Yes | No | 99.8-99.9% |
| io2 Block Express | High IOPS | 256,000 | 4,000 MiB/s | 4 GiB | 16 TiB | Yes | Yes | 99.999% |
| st1 | Throughput focused | 500 | 500 MiB/s | 125 GiB | 16 TiB | No | No | 99.8-99.9% |
| sc1 | Cold storage | 250 | 250 MiB/s | 125 GiB | 16 TiB | No | No | 99.8-99.9% |
| standard (Magnetic) | Legacy | 40-200 | 40-90 MiB/s | 1 GiB | 1 TiB | Yes | No | 99.8-99.9% |

## Volume Types

### 1. Solid State Drive (SSD) Volumes
SSD-backed volumes are optimized for transactional workloads involving frequent read/write operations with small I/O size, where IOPS is the dominant performance attribute.

#### A. General Purpose SSD (gp3)
- **Volume Type**: gp3
- **Durability**: 99.8% - 99.9% (0.1% - 0.2% annual failure rate)
- **Use Cases**:
  - Transactional workloads
  - Virtual desktops
  - Medium-sized, single-instance databases
  - Low-latency interactive applications
  - Boot volumes
  - Development and test environments
- **Volume Size**: 1 GiB - 16 TiB
- **Max IOPS**: 16,000 (64 KiB I/O)
- **Max Throughput**: 1,000 MiB/s
- **Multi-attach**: Not supported
- **Boot Volume**: Supported

#### B. Provisioned IOPS SSD (io2 Block Express)
- **Volume Type**: io2 Block Express
- **Durability**: 99.999% (0.001% annual failure rate)
- **Use Cases**:
  - Workloads requiring sub-millisecond latency
  - Sustained IOPS performance
  - More than 64,000 IOPS or 1,000 MiB/s throughput
- **Volume Size**: 4 GiB - 16 TiB
- **Max IOPS**: 256,000 (16 KiB I/O)
- **Max Throughput**: 4,000 MiB/s
- **Multi-attach**: Supported
- **Boot Volume**: Supported

### 2. Hard Disk Drive (HDD) Volumes
HDD-backed volumes are optimized for large streaming workloads where throughput is the dominant performance attribute.

#### A. Throughput Optimized HDD (st1)
- **Volume Type**: st1
- **Durability**: 99.8% - 99.9% (0.1% - 0.2% annual failure rate)
- **Use Cases**:
  - Big data
  - Data warehouses
  - Log processing
- **Volume Size**: 125 GiB - 16 TiB
- **Max IOPS**: 500 (1 MiB I/O)
- **Max Throughput**: 500 MiB/s
- **Multi-attach**: Not supported
- **Boot Volume**: Not supported

#### B. Cold HDD (sc1)
- **Volume Type**: sc1
- **Durability**: 99.8% - 99.9% (0.1% - 0.2% annual failure rate)
- **Use Cases**:
  - Throughput-oriented storage for infrequently accessed data
  - Scenarios where lowest storage cost is important
- **Volume Size**: 125 GiB - 16 TiB
- **Max IOPS**: 250 (1 MiB I/O)
- **Max Throughput**: 250 MiB/s
- **Multi-attach**: Not supported
- **Boot Volume**: Not supported

### 3. Previous Generation Volumes

#### Magnetic (standard)
- **Volume Type**: standard
- **Use Cases**: Workloads where data is infrequently accessed
- **Volume Size**: 1 GiB - 1 TiB
- **Max IOPS**: 40-200
- **Max Throughput**: 40-90 MiB/s
- **Boot Volume**: Supported

## Important Considerations

1. **Performance Factors**:
   - Instance configuration
   - I/O characteristics
   - Workload demand
   - EBS-optimized instances recommended for full IOPS utilization

2. **Best Practices**:
   - Use EBS-optimized instances for better performance
   - Consider workload requirements when choosing volume type
   - Monitor volume performance and adjust as needed
   - Use appropriate volume size for your workload

3. **Cost Considerations**:
   - Different volume types have different pricing
   - Consider both performance needs and cost when selecting volume type
   - Monitor unused volumes to avoid unnecessary costs

## EBS Snapshots and Disaster Recovery

### EBS Snapshots Overview
- Point-in-time copies of EBS volumes
- Stored in Amazon S3
- Incremental backups (only changed blocks are saved)
- Can be used to create new EBS volumes
- Can be shared across AWS accounts and regions

### Snapshot Features
1. **Incremental Backups**
   - Only stores blocks that have changed since last snapshot
   - Reduces storage costs and backup time
   - Maintains complete volume history

2. **Encryption**
   - Snapshots of encrypted volumes are automatically encrypted
   - Can encrypt unencrypted volumes during snapshot creation
   - Uses AWS KMS for key management

3. **Lifecycle Management**
   - Automated snapshot creation and deletion
   - Retention policies based on age and count
   - Cost optimization through automated cleanup

### Disaster Recovery Scenarios

1. **Volume Recovery**
   - Create new volume from snapshot
   - Restore data to new or existing volume
   - Cross-region recovery possible
   - Point-in-time recovery

2. **Application Recovery**
   - Quick recovery of application data
   - Consistent backup of running applications
   - Minimal downtime during recovery
   - Application state preservation

3. **Data Migration**
   - Move volumes between regions
   - Share data across accounts
   - Create development/test environments
   - Scale storage across regions

### Best Practices for EBS Recovery

1. **Backup Strategy**
   - Regular automated snapshots
   - Multiple snapshot copies across regions
   - Retention policy based on RPO (Recovery Point Objective)
   - Test recovery procedures regularly

2. **Performance Optimization**
   - Schedule snapshots during low-activity periods
   - Use appropriate snapshot frequency
   - Monitor snapshot creation impact
   - Consider application consistency

3. **Cost Management**
   - Implement lifecycle policies
   - Delete unnecessary snapshots
   - Use appropriate storage tiers
   - Monitor snapshot storage usage

### Software-Level Issue Resolution

1. **Data Corruption Recovery**
   - Restore from last known good snapshot
   - Compare current state with snapshot
   - Identify and fix corrupted data
   - Maintain data integrity

2. **Application State Recovery**
   - Restore application to consistent state
   - Recover configuration files
   - Maintain application dependencies
   - Preserve user data

3. **Testing and Validation**
   - Regular recovery testing
   - Validate application functionality
   - Verify data consistency
   - Document recovery procedures

### Monitoring and Maintenance

1. **Health Checks**
   - Monitor volume performance
   - Check snapshot completion status
   - Verify backup integrity
   - Track storage usage

2. **Automation**
   - Automated snapshot creation
   - Scheduled cleanup tasks
   - Cross-region replication
   - Alert notifications

3. **Documentation**
   - Recovery procedures
   - Snapshot schedules
   - Retention policies
   - Contact information

## Reference
[Amazon EBS Volume Types Documentation](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volume-types.html)
[Amazon EBS Snapshots Documentation](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-snapshots.html) 