# Linux Partitions and File Systems

## Overview
A file system is an organized structure of data-holding files and directories residing on storage devices. The process of adding new file systems into existing directories is called mounting, and the directory is called a mount point.

## Hard Disk Representation
Different types of hard disks have different representations for their partitions in Linux:
- SCSI/SATA drives: `/dev/sda`, `/dev/sdb`, etc.
- IDE drives: `/dev/hda`, `/dev/hdb`, etc.
- Virtual drives: `/dev/vda`, `/dev/vdb`, etc.

These representations are special files called block devices, stored in the `/dev` directory.

## Xen Virtualization and Drive Representation

### Xen Virtualization Overview
Xen is a type-1 hypervisor that provides virtualization services for multiple operating systems. It's widely used in cloud environments, including AWS EC2, and provides efficient resource utilization and isolation.

### Xen Drive Naming Convention

1. **Xen Virtual Block Devices**
   - Primary format: `/dev/xvd[a-z]`
   - Example: `/dev/xvda`, `/dev/xvdb`
   - Used in AWS EC2 instances
   - Supports up to 26 virtual drives (a-z)

2. **Xen Drive Types**
   - Root volume: `/dev/xvda`
   - Additional volumes: `/dev/xvdb` through `/dev/xvdz`
   - Ephemeral storage: `/dev/xvdb` (in some configurations)
   - EBS volumes: `/dev/xvdf` through `/dev/xvdz`

3. **AWS EC2 Specific**
   - Instance store volumes: `/dev/xvdb` through `/dev/xvde`
   - EBS volumes: `/dev/xvdf` through `/dev/xvdz`
   - Root volume: `/dev/xvda`

### Xen Virtualization Features

1. **Paravirtualization (PV)**
   - Better performance than full virtualization
   - Requires modified guest OS
   - Uses `/dev/xvd*` naming convention
   - Direct access to hardware

2. **Hardware Virtual Machine (HVM)**
   - Full virtualization
   - Supports unmodified guest OS
   - Uses `/dev/xvd*` or `/dev/sd*` naming
   - Hardware-assisted virtualization

### Cloud Provider Implementations

1. **Amazon Web Services (AWS)**
   - Uses Xen for EC2 instances
   - Standardized drive naming
   - Automatic device mapping
   - EBS volume attachment

2. **Other Cloud Providers**
   - Rackspace
   - Linode
   - DigitalOcean
   - Custom implementations

### Working with Xen Virtual Drives

1. **Identifying Xen Drives**
   ```bash
   # List block devices
   lsblk
   
   # View detailed information
   fdisk -l /dev/xvda
   ```

2. **Mounting Xen Volumes**
   ```bash
   # Mount EBS volume
   mount /dev/xvdf /mnt/data
   
   # Add to fstab
   /dev/xvdf    /mnt/data    ext4    defaults    0    0
   ```

3. **Performance Considerations**
   - Use appropriate instance types
   - Consider I/O requirements
   - Monitor disk performance
   - Use EBS optimization when needed

### Best Practices for Xen Virtualization

1. **Drive Management**
   - Use consistent naming conventions
   - Document drive mappings
   - Monitor disk usage
   - Implement proper backup strategies

2. **Performance Optimization**
   - Choose appropriate instance types
   - Use EBS-optimized instances
   - Implement proper I/O scheduling
   - Monitor disk performance

3. **Security Considerations**
   - Implement proper access controls
   - Use encrypted volumes
   - Regular security updates
   - Monitor for unauthorized access

4. **Backup and Recovery**
   - Regular snapshots
   - Cross-region backups
   - Document recovery procedures
   - Test recovery processes

### Common Issues and Solutions

1. **Drive Not Visible**
   ```bash
   # Check kernel messages
   dmesg | grep xvd
   
   # Rescan SCSI bus
   echo 1 > /sys/class/scsi_host/host*/scan
   ```

2. **Performance Issues**
   ```bash
   # Check I/O statistics
   iostat -x 1
   
   # Monitor disk usage
   df -h
   ```

3. **Mount Problems**
   ```bash
   # Check filesystem
   fsck /dev/xvdf
   
   # Verify mount options
   mount | grep xvd
   ```

### Monitoring and Maintenance

1. **Performance Monitoring**
   ```bash
   # Disk I/O monitoring
   iostat -x 1
   
   # Disk usage monitoring
   df -h
   ```

2. **Health Checks**
   ```bash
   # Check filesystem health
   fsck /dev/xvda
   
   # Monitor disk errors
   dmesg | grep xvd
   ```

3. **Regular Maintenance**
   - Update system regularly
   - Monitor disk usage
   - Check for errors
   - Perform regular backups

## Partitioning Schemes

### 1. MBR (Master Boot Record)
- Traditional partitioning scheme
- Size limit: 2TB
- MBR size: 512 bytes
  - 64 bytes for partition table
  - 16 bytes per partition
- Maximum partitions:
  - 4 primary partitions, or
  - 3 primary + 1 extended partition

### 2. GPT (GUID Partition Table)
- Modern partitioning scheme
- Size limit: 8 ZB (zettabytes)
- No limit on number of primary partitions
- More robust and flexible than MBR

## Types of Partitions

### 1. Primary Partition
- Can contain operating system
- Maximum 4 in MBR scheme
- One primary partition can be marked as "active" (boot partition)

### 2. Extended Partition
- Breaks the 4-partition limit
- Can contain multiple logical partitions
- Only one extended partition allowed
- Acts as a container for logical partitions

### 3. Logical Partition
- Created inside extended partition
- RHEL 6: Maximum 12 logical partitions
- RHEL 7: Maximum 60 logical partitions
- Requires extended partition to exist first

## Visual Representation of Partition Types

![Partition Layout: Primary, Extended, and Logical Partitions](./partition-diagram.png)

*Figure: Example of a 10GB hard disk with three primary partitions (1GB each) and one extended partition (7GB) containing multiple logical partitions. Note the reserved sectors for metadata and inode tables, and the maximum number of logical partitions (e.g., 60 in RHEL 7).*

```
+------------------+------------------+------------------+------------------+
|   Primary 1      |   Primary 2      |   Primary 3      |   Extended       |
|   (Bootable)     |                  |                  |   Partition      |
+------------------+------------------+------------------+------------------+
                                                          |
                                                          v
+------------------+------------------+------------------+------------------+
|   Logical 1      |   Logical 2      |   Logical 3      |   Logical 4      |
|   (Inside        |   (Inside        |   (Inside        |   (Inside        |
|    Extended)     |    Extended)     |    Extended)     |    Extended)     |
+------------------+------------------+------------------+------------------+
```

### Partition Layout Explanation

1. **Primary Partitions**
   - Up to 4 primary partitions allowed
   - First primary partition often used for boot
   - Each primary partition can be formatted independently
   - Can be used for different operating systems

2. **Extended Partition**
   - Acts as a container for logical partitions
   - Only one extended partition allowed
   - Cannot be formatted directly
   - Used to overcome the 4-partition limit

3. **Logical Partitions**
   - Created inside extended partition
   - Numbered starting from 5
   - Can be formatted independently
   - Used for data storage and organization

### Common Partition Schemes

1. **Basic Setup**
   ```
   /dev/sda1 (Primary) - /boot
   /dev/sda2 (Primary) - /
   /dev/sda3 (Primary) - /home
   /dev/sda4 (Extended)
   ```

2. **Advanced Setup**
   ```
   /dev/sda1 (Primary) - /boot
   /dev/sda2 (Primary) - /
   /dev/sda3 (Extended)
   ├── /dev/sda5 (Logical) - /home
   ├── /dev/sda6 (Logical) - /var
   └── /dev/sda7 (Logical) - /opt
   ```

3. **Multi-Boot Setup**
   ```
   /dev/sda1 (Primary) - Windows
   /dev/sda2 (Primary) - Linux /
   /dev/sda3 (Extended)
   ├── /dev/sda5 (Logical) - Linux /home
   ├── /dev/sda6 (Logical) - Linux swap
   └── /dev/sda7 (Logical) - Data
   ```

### Best Practices for Partition Layout

1. **System Partitions**
   - Keep /boot as primary partition
   - Use primary partition for root (/)
   - Consider separate /home partition
   - Plan for swap space

2. **Data Partitions**
   - Use logical partitions for data
   - Separate user data from system
   - Consider backup requirements
   - Plan for future growth

3. **Multi-Boot Considerations**
   - Keep boot partition primary
   - Use logical partitions for data
   - Consider OS compatibility
   - Plan partition order

## Managing MBR Partitions

### Using fdisk
1. Open partition editor:
   ```bash
   fdisk /dev/sdb
   ```

2. Common fdisk commands:
   - `m`: Show help menu
   - `n`: Create new partition
   - `d`: Delete partition
   - `p`: Print partition table
   - `t`: Change partition type
   - `w`: Write changes and exit
   - `q`: Quit without saving

3. Creating a partition:
   ```bash
   Command (m for help): n
   Partition type:
      p   primary
      e   extended
   Select (default p): p
   Partition number (1-4): 1
   First sector: [default]
   Last sector: +2G
   ```

## File Systems

### Common Linux File Systems

1. **XFS**
   - High-performance filesystem
   - Excellent for large files
   - Default in RHEL 7
   - Used by NASA for 300TB servers

2. **ext2**
   - Introduced in 1993
   - First default Linux filesystem
   - Size limit: 16GB to 2TB
   - No journaling
   - Common in flash storage

3. **ext3**
   - Introduced in 2001
   - Includes journaling
   - Backward compatible with ext2
   - Can upgrade from ext2 without backup

4. **ext4**
   - Introduced in 2008
   - Maximum file size: 16TB
   - Optional journaling
   - Backward compatible with ext3

5. **vfat**
   - Microsoft extended FAT filesystem
   - Good for compatibility

### Creating File Systems
```bash
# XFS filesystem
mkfs.xfs /dev/sdb1

# ext4 filesystem
mkfs -t ext4 /dev/sdb1
```

## Mounting Partitions

### Temporary Mounting
```bash
mount /dev/sdb1 /mount_point
```

### Permanent Mounting
1. Edit `/etc/fstab`:
   ```
   /dev/sdb1 /mount_point ext4 defaults 0 0
   ```
   Format: `<device> <mount_point> <filesystem> <options> <dump> <fsck>`

2. Apply changes:
   ```bash
   mount -a
   ```

### Unmounting Partitions
```bash
# Temporary unmount
umount /dev/sdb1

# Permanent unmount
# Remove entry from /etc/fstab and run:
mount -a
```

## Useful Commands

### View Partition Information
```bash
# List block devices
lsblk

# View filesystem information
blkid

# View mounted filesystems
df -hT

# Update partition table
partprobe
```

## Best Practices

1. **Partition Planning**
   - Plan partition layout before installation
   - Consider future growth
   - Separate system and data partitions

2. **File System Selection**
   - Use XFS for large files
   - Use ext4 for general purpose
   - Consider journaling requirements

3. **Mount Points**
   - Use meaningful mount point names
   - Follow Linux filesystem hierarchy
   - Consider security implications

4. **Backup**
   - Backup partition table
   - Keep track of mount points
   - Document filesystem types

## Reference
[Linux Partitioning Guide](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volume-types.html)

## Complete Partition Management Process

### Step 1: Check Available Disks
```bash
# List all block devices
lsblk

# Example output:
NAME   MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
sda      8:0    0   20G  0 disk 
├─sda1   8:1    0    1G  0 part /boot
└─sda2   8:2    0   19G  0 part /
sdb      8:16   0   10G  0 disk 
```

### Step 2: Create Partition Using fdisk
```bash
# Open fdisk for the target disk
fdisk /dev/sdb

# Common fdisk commands and process:
Command (m for help): n        # Create new partition
Partition type:
   p   primary (0 primary, 0 extended, 4 free)
   e   extended
Select (default p): p         # Select primary partition
Partition number (1-4): 1     # First partition
First sector (2048-20971519, default 2048): [Enter]  # Accept default
Last sector, +sectors or +size{K,M,G} (2048-20971519, default 20971519): +5G  # Create 5GB partition

# Verify partition creation
Command (m for help): p

# Save changes and exit
Command (m for help): w
```

### Step 3: Update Partition Table
```bash
# Update kernel's partition table
partprobe /dev/sdb

# Verify partition was created
lsblk
```

### Step 4: Create File System
```bash
# For ext4 filesystem
mkfs -t ext4 /dev/sdb1

# For XFS filesystem
mkfs.xfs /dev/sdb1

# Verify filesystem creation
blkid /dev/sdb1
```

### Step 5: Create Mount Point
```bash
# Create directory for mounting
mkdir /mnt/mydata

# Verify directory creation
ls -ld /mnt/mydata
```

### Step 6: Mount Partition
```bash
# Temporary mount
mount /dev/sdb1 /mnt/mydata

# Verify mount
df -hT /mnt/mydata
```

### Step 7: Permanent Mount
```bash
# Edit /etc/fstab
vim /etc/fstab

# Add the following line:
/dev/sdb1    /mnt/mydata    ext4    defaults    0    0

# Apply changes
mount -a

# Verify permanent mount
df -hT
```

### Step 8: Verify Everything
```bash
# Check partition
lsblk /dev/sdb

# Check filesystem
blkid /dev/sdb1

# Check mount point
df -hT /mnt/mydata

# Check directory permissions
ls -ld /mnt/mydata
```

### Step 9: Testing the Setup
```bash
# Create test file
touch /mnt/mydata/test.txt

# Write to test file
echo "Test successful" > /mnt/mydata/test.txt

# Verify file
cat /mnt/mydata/test.txt
```

### Step 10: Unmounting (if needed)
```bash
# Unmount partition
umount /mnt/mydata

# Verify unmount
df -hT | grep mydata
```

### Common Issues and Solutions

1. **Partition Not Showing**
   ```bash
   # Run partprobe
   partprobe /dev/sdb
   
   # Check kernel messages
   dmesg | tail
   ```

2. **Mount Point Busy**
   ```bash
   # Check what's using the mount point
   lsof /mnt/mydata
   
   # Force unmount if necessary
   umount -f /mnt/mydata
   ```

3. **Filesystem Errors**
   ```bash
   # Check filesystem
   fsck /dev/sdb1
   
   # Repair filesystem
   fsck -y /dev/sdb1
   ```

4. **Permission Issues**
   ```bash
   # Check mount options
   mount | grep mydata
   
   # Remount with different options
   mount -o remount,rw /mnt/mydata
   ```

### Best Practices for Partition Management

1. **Before Creating Partitions**
   - Backup important data
   - Plan partition sizes
   - Choose appropriate filesystem
   - Document partition layout

2. **During Partition Creation**
   - Double-check disk selection
   - Verify partition sizes
   - Use appropriate partition types
   - Save changes only when sure

3. **After Partition Creation**
   - Verify filesystem creation
   - Test mount points
   - Check permissions
   - Document mount options

4. **Regular Maintenance**
   - Monitor disk usage
   - Check filesystem health
   - Update /etc/fstab if needed
   - Keep backups current 

## Understanding /etc/fstab

The `/etc/fstab` file is a system configuration file that contains information about various file systems and their mount points. It's used by the `mount` command to determine which file systems to mount and how to mount them.

### /etc/fstab File Format

Each line in `/etc/fstab` contains six fields, separated by whitespace:

```
<device>    <mount_point>    <filesystem_type>    <options>    <dump>    <fsck>
```

### Field-by-Field Explanation

1. **Device Field** (`<device>`)
   - Can be specified in multiple ways:
     - Device path: `/dev/sdb1`
     - UUID: `UUID=123e4567-e89b-12d3-a456-426614174000`
     - Label: `LABEL=MyData`
     - Network share: `//server/share`
   - Best Practice: Use UUID or LABEL for better reliability
   - Example: `UUID=123e4567-e89b-12d3-a456-426614174000`

2. **Mount Point** (`<mount_point>`)
   - Directory where the filesystem will be mounted
   - Must exist before mounting
   - Common mount points:
     - `/` (root)
     - `/boot`
     - `/home`
     - `/mnt/mydata`
   - Example: `/mnt/mydata`

3. **Filesystem Type** (`<filesystem_type>`)
   - Type of filesystem to be mounted
   - Common types:
     - `ext4`: Linux extended filesystem
     - `xfs`: XFS filesystem
     - `swap`: Swap partition
     - `vfat`: FAT filesystem
     - `nfs`: Network File System
     - `auto`: Auto-detect filesystem type
   - Example: `ext4`

4. **Mount Options** (`<options>`)
   - Comma-separated list of mount options
   - Common options:
     - `defaults`: Default options (rw,suid,dev,exec,auto,nouser,async)
     - `ro`: Read-only
     - `rw`: Read-write
     - `noexec`: Prevent execution of binaries
     - `nosuid`: Ignore set-user-id and set-group-id bits
     - `nodev`: Prevent device file interpretation
     - `sync`: Synchronous I/O
     - `async`: Asynchronous I/O
     - `user`: Allow any user to mount
     - `nouser`: Only root can mount
   - Example: `defaults,noexec`

5. **Dump Field** (`<dump>`)
   - Used by dump utility to determine if filesystem should be backed up
   - Values:
     - `0`: Filesystem should not be backed up
     - `1`: Filesystem should be backed up
   - Example: `0`

6. **File System Check Order** (`<fsck>`)
   - Order in which fsck checks filesystems at boot
   - Values:
     - `0`: Don't check
     - `1`: Check first (usually root filesystem)
     - `2`: Check after root filesystem
   - Example: `0`

### Example /etc/fstab Entries

1. **Standard Root Partition**:
   ```
   UUID=123e4567-e89b-12d3-a456-426614174000    /    ext4    defaults    0    1
   ```

2. **Home Directory**:
   ```
   UUID=987fcdeb-51a2-43d7-89ab-1234567890ab    /home    ext4    defaults    0    2
   ```

3. **Swap Partition**:
   ```
   UUID=abcdef12-3456-7890-abcd-ef1234567890    none    swap    sw    0    0
   ```

4. **NFS Mount**:
   ```
   server:/shared    /mnt/shared    nfs    defaults    0    0
   ```

5. **USB Drive with Specific Options**:
   ```
   UUID=5678abcd-ef12-3456-7890-abcdef123456    /mnt/usb    vfat    defaults,noexec,nodev    0    0
   ```

### Best Practices for /etc/fstab

1. **Device Identification**
   - Use UUID or LABEL instead of device paths
   - More reliable across reboots
   - Prevents issues with device order changes

2. **Mount Options**
   - Use appropriate options for security
   - Consider performance implications
   - Document non-standard options

3. **File System Check**
   - Set appropriate check order
   - Consider filesystem type
   - Account for network filesystems

4. **Backup and Recovery**
   - Keep backup of /etc/fstab
   - Document changes
   - Test changes before reboot

### Common Issues and Solutions

1. **Mount Failure**
   ```bash
   # Check fstab syntax
   mount -a
   
   # View mount errors
   dmesg | tail
   ```

2. **Incorrect UUID**
   ```bash
   # List all UUIDs
   blkid
   
   # Update fstab with correct UUID
   vim /etc/fstab
   ```

3. **Permission Issues**
   ```bash
   # Check mount options
   mount | grep <mount_point>
   
   # Remount with correct options
   mount -o remount,rw <mount_point>
   ```

### Maintenance Commands

1. **View Current Mounts**
   ```bash
   # List all mounted filesystems
   mount
   
   # Show fstab entries
   cat /etc/fstab
   ```

2. **Test fstab Configuration**
   ```bash
   # Test mount all entries
   mount -a
   
   # Check for errors
   systemctl status local-fs.target
   ```

3. **Update fstab**
   ```bash
   # Backup current fstab
   cp /etc/fstab /etc/fstab.backup
   
   # Edit fstab
   vim /etc/fstab
   ``` 