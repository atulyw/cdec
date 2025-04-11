# Day 13: Archiving, Compression, and Automation in Linux

## 1. Overview of Archiving

### What is Archiving?
- Process of combining multiple files into a single file
- Preserves file attributes and directory structure
- Common format: tar (Tape Archive)

### Common Use Cases
1. Backups
   - System backups
   - Database backups
   - Configuration backups
2. Data Transfer
   - Moving multiple files between systems
   - Sharing project files
3. Organization
   - Consolidating related files
   - Long-term storage

## 2. Working with tar

### Basic tar Commands
```bash
# Create an archive
tar -cvf archive.tar file1 file2 directory1

# Extract an archive
tar -xvf archive.tar

# List archive contents
tar -tvf archive.tar
```

### Common tar Options
- `-c`: Create archive
- `-x`: Extract archive
- `-v`: Verbose output
- `-f`: Specify archive file
- `-t`: List contents
- `-p`: Preserve permissions
- `-C`: Change directory

## 3. Introduction to Compression

### What is Compression?
- Reducing file size while preserving data
- Different algorithms for different needs
- Trade-off between compression ratio and speed

### Common Compression Tools
1. gzip
   - Fast compression
   - Moderate compression ratio
   - Widely used
2. bzip2
   - Better compression than gzip
   - Slower compression
   - Higher CPU usage
3. xz
   - Best compression ratio
   - Slowest compression
   - Highest CPU usage

## 4. Compression Tools

### gzip/gunzip
```bash
# Compress a file
gzip file.txt
# Creates file.txt.gz

# Decompress a file
gunzip file.txt.gz
# Creates file.txt

# View compressed file
zcat file.txt.gz
```

### bzip2/bunzip2
```bash
# Compress a file
bzip2 file.txt
# Creates file.txt.bz2

# Decompress a file
bunzip2 file.txt.bz2
# Creates file.txt

# View compressed file
bzcat file.txt.bz2
```

### xz/unxz
```bash
# Compress a file
xz file.txt
# Creates file.txt.xz

# Decompress a file
unxz file.txt.xz
# Creates file.txt

# View compressed file
xzcat file.txt.xz
```

## 5. Combining Archiving and Compression

### Using tar with Compression
```bash
# Create compressed tar archive (gzip)
tar -czvf archive.tar.gz files/

# Create compressed tar archive (bzip2)
tar -cjvf archive.tar.bz2 files/

# Create compressed tar archive (xz)
tar -cJvf archive.tar.xz files/

# Extract compressed tar archive
tar -xzvf archive.tar.gz
tar -xjvf archive.tar.bz2
tar -xJvf archive.tar.xz
```

### Compression Options Comparison Table
| NO. | NAME | OPTION | EXTENSION | UNZIP |
|-----|------|--------|-----------|-------|
| 1 | gzip | -z | .tar.gz | gunzip |
| 2 | bzip2 | -j | .tar.bz2 | bunzip2 |
| 3 | xz | -J | .tar.xz | unxz |

## 6. Introduction to CronTab

### What is CronTab?
- Time-based job scheduler in Unix-like operating systems
- Automates repetitive tasks
- System-wide and user-specific jobs

### CronTab Syntax
```
* * * * * command
│ │ │ │ │
│ │ │ │ └── Day of week (0-6) (Sunday=0)
│ │ │ └──── Month (1-12)
│ │ └────── Day of month (1-31)
│ └──────── Hour (0-23)
└────────── Minute (0-59)
```

### Special Characters
- `*`: Every value
- `,`: Value list separator
- `-`: Range of values
- `/`: Step values

### Examples
```bash
# Run every minute
* * * * * command

# Run every hour
0 * * * * command

# Run daily at midnight
0 0 * * * command

# Run weekly on Sunday
0 0 * * 0 command

# Run monthly on 1st
0 0 1 * * command
```

## 7. Managing Cron Jobs

### Basic CronTab Commands
```bash
# Edit crontab
crontab -e

# List crontab
crontab -l

# Remove all crontab entries
crontab -r

# View system-wide crontab
sudo cat /etc/crontab
```

### Common Automation Tasks
1. System Backups
```bash
# Daily backup at 2 AM
0 2 * * * tar -czf /backup/daily_backup.tar.gz /important/data
```

2. Log Rotation
```bash
# Weekly log rotation
0 0 * * 0 find /var/log -name "*.log" -mtime +7 -delete
```

3. System Updates
```bash
# Weekly system update
0 3 * * 0 apt-get update && apt-get upgrade -y
```

4. Disk Cleanup
```bash
# Monthly cleanup of temp files
0 0 1 * * find /tmp -type f -mtime +30 -delete
```

## Best Practices

### Archiving
- Use meaningful archive names
- Include date in backup names
- Verify archive integrity
- Document archive contents

### Compression
- Choose compression tool based on needs:
  - Speed: gzip
  - Balance: bzip2
  - Maximum compression: xz
- Consider CPU usage
- Check available disk space

### Cron Jobs
- Use absolute paths
- Log job output
- Test commands manually first
- Include error handling
- Document job purpose
- Regular maintenance and review

## Common Issues and Solutions

### Archiving Issues
- Permission problems
  - Solution: Use sudo or check file permissions
- Disk space issues
  - Solution: Check available space before archiving
- Corrupted archives
  - Solution: Verify archives after creation

### Compression Issues
- Memory usage
  - Solution: Monitor system resources
- Slow compression
  - Solution: Use faster compression tools
- Incompatible formats
  - Solution: Check tool availability

### Cron Job Issues
- Jobs not running
  - Solution: Check logs and permissions
- Wrong timing
  - Solution: Verify cron syntax
- Path issues
  - Solution: Use absolute paths
- Permission denied
  - Solution: Check user permissions 