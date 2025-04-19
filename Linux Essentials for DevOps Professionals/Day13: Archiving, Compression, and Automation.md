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


## Method 1: Using systemctl
```bash
# Check service status
systemctl status cron.service

# Start the service
systemctl start cron.service

# Stop the service
systemctl stop cron.service

# Restart the service
systemctl restart cron.service

# Enable service to start on boot
systemctl enable cron.service

# Disable service from starting on boot
systemctl disable cron.service
```

## Method 2: Using service command
```bash
apt update
apt install cron
# Check service status
service cron status

# Start the service
service cron start

# Stop the service
service cron stop

# Restart the service
service cron restart
```

## Differences Between systemctl and service

### systemctl
- Modern command (part of systemd)
- More detailed status information
- Can manage service dependencies
- Supports enable/disable for boot time
- Works on newer Linux distributions
- Provides more control over service lifecycle
- Can show service logs: `journalctl -u cron.service`

### service
- Traditional command
- Simpler output
- Works on older Linux distributions
- More portable across different init systems
- Limited functionality compared to systemctl
- No built-in boot time management

## Managing Crontab Jobs

### Viewing and Editing Crontab
```bash
# Edit crontab
crontab -e

# List current crontab entries
crontab -l

# Edit system-wide crontab
sudo vim /etc/crontab
```

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

### Simple Bash Shell Examples
```bash
# Create multiple directories using brace expansion
* * * * * bash -c 'mkdir -p /path/to/dir{1..10}'

# Create files with numbered names
* * * * * bash -c 'touch /path/to/file{1..5}.txt'

# Copy files with pattern matching
* * * * * bash -c 'cp /source/file{1..3}.txt /destination/'

# Create dated directories
* * * * * bash -c 'mkdir -p /backup/$(date +%Y%m%d)'

```
### Crontab Time Syntax Examples

#### * (Every value)
```bash
# Run every minute
* * * * * touch /tmp/minute_file.txt

# Run every hour
0 * * * * mkdir -p /tmp/hourly_dir

# Run every day
0 0 * * * tar -czf /backup/daily.tar.gz /data

# Run every month
0 0 1 * * touch /tmp/monthly_file.txt

# Run every day of week
0 0 * * 0 mkdir -p /tmp/weekly_dir
```

#### , (Value list separator)
```bash
# Run at 2 AM and 2 PM
0 2,14 * * * touch /tmp/twice_daily.txt

# Run on Monday and Friday
0 0 * * 1,5 mkdir -p /tmp/weekly_backup

# Run on 1st and 15th of month
0 0 1,15 * * tar -czf /backup/biweekly.tar.gz /data

# Run at 9 AM, 12 PM, and 3 PM
0 9,12,15 * * * touch /tmp/three_times.txt

# Run on weekends (Saturday and Sunday)
0 0 * * 6,0 mkdir -p /tmp/weekend_backup
```

#### - (Range of values)
```bash
# Run every hour from 9 AM to 5 PM
0 9-17 * * * touch /tmp/business_hours.txt

# Run every day from Monday to Friday
0 0 * * 1-5 mkdir -p /tmp/workday_backup

# Run every 5 days from 1st to 10th
0 0 1-10/5 * * tar -czf /backup/first_ten_days.tar.gz /data

# Run every minute for 10 minutes (0-9)
0-9 * * * * touch /tmp/minute_$(date +%M).txt

# Run every hour from midnight to 6 AM
0 0-6 * * * mkdir -p /tmp/nightly_backup
```

#### / (Step values)
```bash
# Run every 5 minutes
*/5 * * * * touch /tmp/five_min.txt

# Run every 2 hours
0 */2 * * * mkdir -p /tmp/two_hour_backup

# Run every 3 days
0 0 */3 * * tar -czf /backup/three_day.tar.gz /data

# Run every 30 minutes
*/30 * * * * touch /tmp/half_hour.txt

# Run every 4 hours
0 */4 * * * mkdir -p /tmp/four_hour_backup
```

#### Specific Day of Month Examples
```bash
# Run on 2nd Saturday of every month at 10 AM
0 10 8-14 * 6 root /opt/myscript.sh
# Explanation:
# - 0: At minute 0
# - 10: At 10 AM
# - 8-14: Between 8th and 14th of month
# - *: Every month
# - 6: On Saturday (0=Sunday, 1=Monday, ..., 6=Saturday)
# - root: Run as root user
# This matches the 2nd Saturday because:
# - 1st Saturday falls on 1-7
# - 2nd Saturday falls on 8-14
# - 3rd Saturday falls on 15-21
# - 4th Saturday falls on 22-28
# - 5th Saturday falls on 29-31

# Run on 4th Saturday of every month at 10 AM
0 10 22-28 * 6 root /opt/myscript.sh
# Explanation:
# - 0: At minute 0
# - 10: At 10 AM
# - 22-28: Between 22nd and 28th of month
# - *: Every month
# - 6: On Saturday
# - root: Run as root user
# This matches the 4th Saturday because:
# - 22-28 always contains the 4th Saturday
# - Works even in months with 31 days
# - Ensures consistent 4th Saturday execution

# Run on 1st Saturday of every month at 10 AM
0 10 1-7 * 6 root /opt/myscript.sh

# Run on 3rd Saturday of every month at 10 AM
0 10 15-21 * 6 root /opt/myscript.sh

# Run on 5th Saturday of every month at 10 AM (if exists)
0 10 29-31 * 6 root /opt/myscript.sh
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



### 20 Practical Tasks with Basic Commands

1. **File Cleanup Task**
   - Delete all .tmp files older than 7 days from /tmp directory
   - Command: `find /tmp -name "*.tmp" -mtime +7 -delete`

2. **Log Rotation Task**
   - Compress and archive log files older than 30 days
   - Command: `find /var/log -name "*.log" -mtime +30 -exec gzip {} \;`

3. **Backup Task**
   - Create a daily backup of important documents
   - Command: `tar -czf /backup/docs_$(date +%Y%m%d).tar.gz /important/docs`

4. **Disk Space Monitor**
   - Alert if disk usage exceeds 90%
   - Command: `df -h | awk '$5 > 90 {print $1 " is " $5 " full"}' | mail -s "Disk Alert" admin@example.com`

5. **Process Monitor**
   - Check if critical service is running, restart if not
   - Command: `pgrep -f "critical_service" || systemctl restart critical_service`

6. **File System Check**
   - Run fsck on specific partition weekly
   - Command: `fsck -f /dev/sda1`

7. **Network Check**
   - Ping important servers every 5 minutes
   - Command: `ping -c 1 server1.example.com || echo "Server down" | mail -s "Alert" admin@example.com`

8. **Database Backup**
   - Create MySQL database backup daily
   - Command: `mysqldump -u user -p'pass' database > /backup/db_$(date +%Y%m%d).sql`

9. **File Synchronization**
   - Sync files between two directories hourly
   - Command: `rsync -av /source/ /destination/`

10. **System Update**
    - Update package list and upgrade packages weekly
    - Command: `apt-get update && apt-get upgrade -y`

11. **Log Analysis**
    - Count error messages in log file daily
    - Command: `grep "ERROR" /var/log/app.log | wc -l > /var/log/error_count.log`

12. **File Permission Fix**
    - Reset permissions on web directory daily
    - Command: `chmod -R 755 /var/www/html`

13. **Cache Cleanup**
    - Clear application cache weekly
    - Command: `rm -rf /var/cache/app/*`

14. **User Account Check**
    - List users who haven't logged in for 90 days
    - Command: `last | grep "Never logged in" > /var/log/inactive_users.log`

15. **System Load Monitor**
    - Record system load every 5 minutes
    - Command: `uptime >> /var/log/system_load.log`

16. **File Count Monitor**
    - Count files in specific directory daily
    - Command: `find /data -type f | wc -l > /var/log/file_count.log`

17. **DNS Check**
    - Verify DNS resolution for important domains
    - Command: `nslookup example.com || echo "DNS failed" | mail -s "DNS Alert" admin@example.com`

18. **File Size Monitor**
    - Alert if specific file exceeds size limit
    - Command: `find /data -type f -size +100M -exec ls -lh {} \; | mail -s "Large Files" admin@example.com`

19. **Service Status Check**
    - Check and log status of all running services
    - Command: `systemctl list-units --type=service --state=running > /var/log/services.log`

20. **File Integrity Check**
    - Generate and verify checksums of important files
    - Command: `sha256sum /important/file > /var/log/checksums.log`
