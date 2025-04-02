# Day 6: Linux File System Hierarchy

## Introduction to Linux File System Hierarchy

The Linux file system hierarchy follows the Filesystem Hierarchy Standard (FHS), which defines the directory structure and contents in Linux and Unix-like operating systems.

## Root Directory (/)

The root directory is the top-level directory of the file system hierarchy. All other directories are subdirectories of the root.

## Essential Directories

### 1. /bin (Binary)
- Contains essential command binaries
- Available to all users
- Examples: ls, cp, mv, cat, etc.
- Must be available for system boot

### 2. /sbin (System Binary)
- Contains system administration binaries
- Usually requires root privileges
- Examples: fdisk, mkfs, sysctl
- Essential for system boot and repair

### 3. /boot
- Contains files needed for system boot
- Includes:
  - Kernel files
  - Boot loader configuration
  - Initial RAM disk (initrd)
  - System map

### 4. /dev (Devices)
- Contains device files
- Represents hardware devices
- Examples:
  - /dev/sda (hard disk)
  - /dev/tty (terminal)
  - /dev/null (null device)
  - /dev/zero (zero device)

### 5. /etc (Etcetera)
- Contains system-wide configuration files
- Examples:
  - /etc/passwd (user accounts)
  - /etc/hosts (hostname resolution)
  - /etc/fstab (filesystem table)
  - /etc/network (network configuration)

### 6. /home
- Contains user home directories
- Each user has their own subdirectory
- Example: /home/username
- Contains user-specific files and configurations

### 7. /lib and /lib64
- Contains shared library files
- Essential for system boot and running commands
- /lib64 contains 64-bit libraries
- Examples:
  - /lib/modules (kernel modules)
  - /lib/firmware (device firmware)

### 8. /media
- Mount point for removable media
- Examples:
  - /media/cdrom
  - /media/usb
  - /media/floppy

### 9. /mnt (Mount)
- Temporary mount point for filesystems
- Used for manual mounting
- Common for network shares or temporary storage

### 10. /opt (Optional)
- Contains optional application software
- Third-party applications
- Each application in its own subdirectory
- Example: /opt/google/chrome

### 11. /proc (Process)
- Virtual filesystem showing system and process information
- Real-time system data
- Examples:
  - /proc/cpuinfo (CPU information)
  - /proc/meminfo (memory information)
  - /proc/pid (process information)

### 12. /root
- Home directory for root user
- Not in /home for security reasons

### 13. /run
- Runtime variable data
- Created at boot
- Contains:
  - Process IDs
  - System information
  - Temporary files

### 14. /srv (Service)
- Contains data for services provided by the system
- Examples:
  - /srv/www (web server data)
  - /srv/ftp (FTP server data)

### 15. /sys (System)
- Virtual filesystem for system information
- Interface to kernel data structures
- Hardware information
- Device configuration

### 16. /tmp (Temporary)
- Temporary files
- Cleared on system boot
- World-writable directory
- Short-term storage

### 17. /usr (Unix System Resources)
- Secondary hierarchy for user data
- Contains:
  - /usr/bin (user commands)
  - /usr/sbin (system commands)
  - /usr/lib (libraries)
  - /usr/share (shared data)
  - /usr/local (local software)
  - /usr/include (header files)

### 18. /var (Variable)
- Variable data files
- Examples:
  - /var/log (log files)
  - /var/cache (cache files)
  - /var/spool (spool files)
  - /var/mail (mail files)
  - /var/run (runtime data)

## Special Directories

### /lost+found
- Created by filesystem check (fsck)
- Contains recovered files after system crash
- One per partition

### /proc/sys
- Kernel parameters
- Can be modified to change system behavior
- Examples:
  - /proc/sys/net/ipv4/ip_forward
  - /proc/sys/vm/swappiness

## Best Practices
1. Keep /home on separate partition
2. Regular backup of /etc
3. Monitor /var/log for system issues
4. Clean /tmp regularly
5. Maintain proper permissions
6. Document custom mount points
7. Regular filesystem maintenance 