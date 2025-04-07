# Day 12: Managing Users and Permissions in Linux

## Link Count Basics

### What is Link Count?
- Number of hard links pointing to a file
- Shown in `ls -l` output
- Indicates how many names point to the same data
- Important for file system management

### How to View Link Count
```bash
# Basic view
ls -l file.txt

# Detailed view with inode
ls -li file.txt

# Count links in current directory
ls -l | awk '{print $2}'
```

## Link Count for Directories

### Directory Link Count Rules
1. **Minimum Link Count: 2**
   - One for the directory itself
   - One for the '.' entry

2. **Additional Links**
   - One for each subdirectory's '..' entry
   - Example: Directory with 3 subdirectories has link count of 5

### Examples
```bash
# Create directory structure
mkdir -p parent/child1/child2

# View link counts
ls -ld parent
ls -ld parent/child1
ls -ld parent/child1/child2
```

## Link Count for Files

### Regular Files
- Default link count: 1
- Can be increased with hard links
- Cannot cross filesystem boundaries
- Must be on same partition

### Examples
```bash
# Create a file
echo "Hello" > file.txt

# Create hard link
ln file.txt file_link.txt

# View link counts
ls -l file.txt file_link.txt

# Expected output:
# Both files show link count: 2
# Same inode number
```

## Comparing Hard and Soft Links

### Hard Links
```bash
# Create hard link
ln original.txt hard_link.txt

# Characteristics:
# - Same inode number
# - Same file size
# - Same permissions
# - Must be on same filesystem
# - Cannot link to directories
# - Original file must exist
```

### Soft (Symbolic) Links
```bash
# Create soft link
ln -s original.txt soft_link.txt

# Characteristics:
# - Different inode number
# - Different file size
# - Different permissions
# - Can cross filesystems
# - Can link to directories
# - Can link to non-existent files
```


## Importance of sudo for Privilege Escalation

### Why sudo is Important
1. **Security**
   - Controlled access to root privileges
   - Audit trail of commands
   - Time-limited access

2. **Flexibility**
   - Granular permission control
   - User-specific access
   - Command-specific access

3. **Accountability**
   - Command logging
   - User tracking
   - Security monitoring

## Difference Between Regular User Commands and sudo Commands

### Regular User Commands
```bash
# Limited to user's permissions
ls /home
cat /etc/passwd
touch ~/file.txt
```

### sudo Commands
```bash
# Elevated privileges
sudo ls /root
sudo cat /etc/shadow
sudo touch /etc/file.txt
```

### Key Differences
1. **Access Level**
   - Regular: User's permissions
   - sudo: Root or specified privileges

2. **Authentication**
   - Regular: None needed
   - sudo: Password required

3. **Logging**
   - Regular: Basic system logs
   - sudo: Detailed command logs

## Configuring sudo Access

### sudoers File
```bash
# Location
/etc/sudoers

# Edit with
sudo visudo
```

### Understanding sudoers Syntax
```bash
# Basic format
who where=(as_whom) what

# Components:
# who: username or group (%groupname)
# where: hostname or ALL
# as_whom: user to run as or ALL
# what: commands or ALL
```

### Common Configuration Examples
```bash
# 1. Allow user to run all commands
username ALL=(ALL) ALL
# Explanation:
# - username: specific user
# - ALL: on all hosts
# - (ALL): as any user
# - ALL: any command

# 2. Allow specific commands
username ALL=(ALL) /usr/bin/ls, /usr/bin/cat
# Explanation:
# - Limited to ls and cat commands
# - Must use full paths
# - Commands separated by commas

# 3. Allow command without password
username ALL=(ALL) NOPASSWD: /usr/bin/ls
# Explanation:
# - NOPASSWD: no password required
# - Can be used for specific commands
# - Can be used for all commands (NOPASSWD: ALL)

# 4. Allow group access
%groupname ALL=(ALL) ALL
# Explanation:
# - % indicates a group
# - All members of group get access
# - Can be combined with other rules
```

### Advanced Configuration Examples
```bash
# 1. Allow specific commands with arguments
username ALL=(ALL) /usr/bin/apt-get update, /usr/bin/apt-get upgrade
# Note: Arguments must match exactly

# 2. Allow commands as specific user
username ALL=(john) /usr/bin/systemctl restart apache2
# Only allows running as user 'john'

# 3. Allow commands on specific host
username webserver=(ALL) /usr/bin/systemctl restart nginx
# Only works on host named 'webserver'

# 4. Allow commands with wildcards
username ALL=(ALL) /usr/bin/apt-get *
# Allows all apt-get commands

# 5. Allow commands with environment variables
username ALL=(ALL) env_keep="PATH,HOME" /usr/bin/git
# Preserves PATH and HOME environment variables

# 6. Allow commands with timeout
username ALL=(ALL) TIMEOUT=5 /usr/bin/apt-get update
# Password expires after 5 minutes

# 7. Allow commands with logging
username ALL=(ALL) LOG_INPUT:LOG_OUTPUT /usr/bin/rm
# Logs both input and output of rm command
```

### Security Best Practices
1. **Command Restrictions**
   - Use full paths
   - Avoid wildcards when possible
   - Limit command arguments
   - Use specific user targets

2. **Access Control**
   - Principle of least privilege
   - Regular access reviews
   - Document all changes
   - Monitor sudo logs

3. **Password Policies**
   - Use NOPASSWD sparingly
   - Set appropriate timeouts
   - Regular password changes
   - Strong password requirements

4. **Logging and Monitoring**
   - Enable command logging
   - Regular log reviews
   - Set up alerts
   - Document all changes

### Common Use Cases
1. **Web Server Management**
   ```bash
   # Allow web admin to manage nginx
   webadmin ALL=(ALL) /usr/bin/systemctl restart nginx, /usr/bin/systemctl status nginx
   ```

2. **Database Administration**
   ```bash
   # Allow DB admin to manage MySQL
   dbadmin ALL=(ALL) /usr/bin/systemctl restart mysql, /usr/bin/mysql
   ```

3. **Backup Operations**
   ```bash
   # Allow backup user to run backup scripts
   backup ALL=(ALL) NOPASSWD: /usr/local/bin/backup.sh
   ```

4. **Development Environment**
   ```bash
   # Allow developers to manage services
   %developers ALL=(ALL) /usr/bin/docker, /usr/bin/docker-compose
   ```

### Troubleshooting
1. **Common Issues**
   - Command not found (use full paths)
   - Permission denied (check command paths)
   - Password prompts (check NOPASSWD)
   - Group access not working (check group name)

2. **Debugging Steps**
   ```bash
   # Check sudo access
   sudo -l

   # Check sudoers syntax
   sudo visudo -c

   # View sudo logs
   sudo cat /var/log/auth.log | grep sudo
   ```

## Understanding Umask and Default Permissions

### Default Permissions
1. **Regular User Defaults**
   - Files: rw-rw-r-- (664)
   - Directories: rwxrwxr-x (775)

2. **Root User Defaults**
   - Files: rw-r--r-- (644)
   - Directories: rwxr-xr-x (755)

### Default Permission Table
| User Type | Directory | File |
|-----------|-----------|------|
| Root | 755 (rwxr-xr-x) | 644 (rw-r--r--) |
| Standard User | 775 (rwxrwxr-x) | 664 (rw-rw-r--) |

### Understanding Umask
```bash
# View current umask
umask

# Default umask values:
# Root user: 0022
# Standard user: 0002
```

### Calculating Permissions with Umask
1. **Root User Calculations**
   ```bash
   # Directory: 777 - 022 = 755
   # File: 666 - 022 = 644
   ```

2. **Standard User Calculations**
   ```bash
   # Directory: 777 - 002 = 775
   # File: 666 - 002 = 664
   ```

### Changing Umask Value

#### Temporary Change
```bash
# Set umask to 000
umask 000

# Create directory to test
mkdir demo

# Check permissions
ls -l
# Expected output: drwxrwxrwx. 2 root root 6 May 29 12:34 demo
```

#### Permanent Change
```bash
# Edit /etc/profile
vim /etc/profile

# Find and modify these lines:
if [ $UID -gt 199 ] && [ "`/usr/bin/id -gn`" = "`/usr/bin/id -un`" ]; then
    umask 002    # For standard users
else
    umask 000    # For root user
fi

# Save and apply changes
:wq
source /etc/profile

# Verify new umask
umask
# Expected output: 0000
```

### Common Umask Values and Their Effects
```bash
# 0000 (777 for directories, 666 for files)
umask 0000
# Results in: drwxrwxrwx for directories, -rw-rw-rw- for files

# 0022 (755 for directories, 644 for files)
umask 0022
# Results in: drwxr-xr-x for directories, -rw-r--r-- for files

# 0002 (775 for directories, 664 for files)
umask 0002
# Results in: drwxrwxr-x for directories, -rw-rw-r-- for files

# 0077 (700 for directories, 600 for files)
umask 0077
# Results in: drwx------ for directories, -rw------- for files
```

### Best Practices for Umask
1. **Security Considerations**
   - Use restrictive umask for sensitive data
   - Consider user roles and access needs
   - Regular umask audits
   - Document changes

2. **Common Use Cases**
   - Development environments (002)
   - Production servers (022)
   - Private directories (077)
   - Shared workspaces (002)

3. **Troubleshooting**
   ```bash
   # Check current umask
   umask

   # Check system-wide umask
   cat /etc/profile | grep umask

   # Check user-specific umask
   cat ~/.bashrc | grep umask

   # Verify permissions after umask change
   touch testfile
   mkdir testdir
   ls -l
   ```

### Important Notes
1. **Umask Calculation**
   - Directory permissions start at 777
   - File permissions start at 666
   - Umask is subtracted from these values

2. **Security Impact**
   - Lower umask = more permissive
   - Higher umask = more restrictive
   - Consider security implications

3. **Environment Variables**
   - Umask can be set in various files:
     - /etc/profile (system-wide)
     - ~/.bashrc (user-specific)
     - /etc/bashrc (bash-specific)

4. **Application to New Files**
   - Only affects newly created files
   - Does not modify existing files
   - Use chmod for existing files 