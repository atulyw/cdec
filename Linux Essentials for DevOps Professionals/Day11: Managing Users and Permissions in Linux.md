# Day 11: Managing Users and Permissions in Linux

## Importance of File Permissions in Linux

### Why File Permissions Matter
- Security: Control access to system resources
- Privacy: Protect sensitive data
- System Integrity: Prevent unauthorized modifications
- Multi-user Environment: Manage shared resources

### Basic Concepts
1. **Three Types of Users**
   - Owner (u): File creator/owner
   - Group (g): Users in same group
   - Others (o): All other users

2. **Permission Levels**
   - Read (r): View file contents
   - Write (w): Modify file contents
   - Execute (x): Run file as program

## Explanation of rwx Permissions

### Permission Types and Applications
| Permission | Letter | Number | Applied to Files | Applied to Directories |
|------------|---------|---------|------------------|----------------------|
| Read | r | 4 | Open a file | List contents of directory |
| Write | w | 2 | Change contents of a file | Create and delete files, modify permissions |
| Execute | x | 1 | Run a program file | Change to the directory |

### Read Permission (r)
- **Files:**
  - View file contents
  - Copy file
  - List directory contents
- **Directories:**
  - List directory contents
  - View file names and metadata

### Write Permission (w)
- **Files:**
  - Modify file contents
  - Delete file
  - Rename file
- **Directories:**
  - Create new files
  - Delete files
  - Rename files

### Execute Permission (x)
- **Files:**
  - Run as program
  - Execute script
- **Directories:**
  - Access directory contents
  - Change into directory
  - Search directory

## How Permissions are Displayed with ls -l

### Basic Format
```bash
-rwxr-xr-- 1 user group size date filename
```

### Detailed Breakdown of ls -l Output
1. **File Type and Permissions (-rwxr-xr--)**
   - First character: File type (-, d, l, b, c, s, p)
   - Next 9 characters: Permissions in 3 groups of 3
   - Each group represents: Owner, Group, Others
   - Each permission is: r (read), w (write), x (execute)

2. **Link Count (1)**
   - Number of hard links to the file
   - For directories: Number of subdirectories + 2
   - For regular files: Usually 1
   - For directories: Minimum 2 (for . and ..)

3. **User (user)**
   - Owner of the file
   - Can be username or UID
   - Usually the creator of the file
   - Can be changed with chown

4. **Group (group)**
   - Group owner of the file
   - Can be group name or GID
   - Default group of the owner
   - Can be changed with chgrp

5. **Size (size)**
   - File size in bytes
   - For directories: Size of directory entry
   - Can be human-readable with -h option
   - Examples: 1024, 2048, 4096

6. **Date (date)**
   - Last modification date
   - Format: MMM DD HH:MM
   - For older files: MMM DD YYYY
   - Can be customized with --time-style

7. **Filename (filename)**
   - Name of the file or directory
   - Can include path if not current directory
   - Special characters: . (current), .. (parent)
   - Hidden files start with .

### Example with Real Values
```bash
-rwxr-xr-- 1 john developers 4096 Mar 15 14:30 script.sh
```
Breaking down this example:
- `-`: Regular file
- `rwxr-xr--`: Permissions
  - Owner (john): read, write, execute
  - Group (developers): read, execute
  - Others: read only
- `1`: One hard link
- `john`: Owner username
- `developers`: Group name
- `4096`: File size in bytes
- `Mar 15 14:30`: Last modified date and time
- `script.sh`: Filename

## Changing File Ownership and Group

### Changing File Owner (chown)
```bash
# Basic syntax
chown user file

# Examples
chown john script.sh           # Change owner to john
chown john:developers file.txt # Change both owner and group
chown -R john /home/project   # Recursive change for directories
chown --reference=file1 file2 # Copy ownership from file1 to file2
```

### Changing File Group (chgrp)
```bash
# Basic syntax
chgrp group file

# Examples
chgrp developers script.sh    # Change group to developers
chgrp -R developers /home/project  # Recursive change for directories
chgrp --reference=file1 file2 # Copy group from file1 to file2
```

### Common Options
```bash
-R, --recursive    # Change files and directories recursively
-v, --verbose      # Print what is being done
-f, --silent       # Suppress error messages
--reference=RFILE  # Use RFILE's owner/group instead of specifying USER:GROUP
```

### Examples with Different Scenarios
```bash
# Change owner and group for multiple files
chown john:developers file1.txt file2.txt

# Change ownership of all files in current directory
chown -R john:developers .

# Change group for all .txt files
chgrp developers *.txt

# Change ownership with verbose output
chown -v john file.txt
```

### Important Notes
1. **Root Privileges**
   - Usually requires sudo or root access
   - Example: `sudo chown john file.txt`

2. **Recursive Changes**
   - Use -R option carefully
   - Can affect many files at once
   - Consider using find for selective changes

3. **Preserving Permissions**
   - chown/chgrp don't affect file permissions
   - Only changes ownership/group

4. **Common Use Cases**
   - Moving files between users
   - Setting up shared directories
   - Fixing ownership issues
   - System maintenance


### Common ls -l Options
```bash
ls -l -h              # Human-readable sizes
ls -l --time-style=long-iso  # ISO date format
ls -l -d              # List directories only
ls -l -a              # Include hidden files
ls -l -R              # Recursive listing
ls -l -t              # Sort by modification time
ls -l -r              # Reverse sort order
```

## Breaking Down the Permission String

### Example: -rwxr-xr--
1. **First Character (-)**
   - Indicates regular file
   - Different characters for different file types

2. **Owner Permissions (rwx)**
   - r: Read permission
   - w: Write permission
   - x: Execute permission

3. **Group Permissions (r-x)**
   - r: Read permission
   - -: No write permission
   - x: Execute permission

4. **Others Permissions (r--)**
   - r: Read permission
   - -: No write permission
   - -: No execute permission

### Common Permission Combinations
```bash
-rw-------  # Owner read/write only (600)
-rw-r--r--  # Owner read/write, others read (644)
-rwxr-xr-x  # Owner read/write/execute, others read/execute (755)
-rwx------  # Owner read/write/execute only (700)
```


## Introduction to File Types

### File Type Symbols and Examples
| File Type | Symbol | Example | Description |
|-----------|---------|---------|-------------|
| Normal/Regular File | - | /etc/passwd | Standard files containing data |
| Directory | d | /home | Container for files and subdirectories |
| Link File | l | /etc/grub.conf | Symbolic link to another file |
| Block Device File | b | /dev/vdb | Storage devices like hard drives |
| Character Device File | c | /dev/pts/0 | Character-based devices like terminals |
| Socket File | s | /dev/log | Inter-process communication |
| Normal Pipe File | p | /dev/initctl | First In First Out (FIFO) communication |

### Regular Files (-)
- Text files
- Binary files
- Scripts
- Documents
- Images
- Archives

### Directories (d)
- Container for files
- Special type of file
- Contains file entries
- Can be nested

### Symbolic Links (l)
- Pointers to other files
- Shortcuts or aliases
- Can be broken if target is deleted
- Cross-filesystem links possible

### Special Files
1. **Block Devices (b)**
2. **Character Devices (c)**
3. **Sockets (s)**
4. **Named Pipes (p)**

### Working with Special Files
1. **Viewing Special Files**
   ```bash
   ls -l /dev/sda*              # List block devices
   ls -l /dev/tty*              # List terminal devices
   ls -l /var/run/*.sock        # List sockets
   ls -l /tmp/*.pipe           # List named pipes
   ```


### Best Practices
1. Use appropriate permissions
2. Regular permission audits
3. Principle of least privilege
4. Regular backup of important files
5. Monitor system logs
6. Keep system updated
7. Document custom file types 

## Changing File Permissions (chmod)

### Using Symbolic Notation (Alphabetical)
```bash
# Basic syntax
chmod [who][operator][permission] file

# Who can be:
u (user/owner)
g (group)
o (others)
a (all)

# Operators:
+ (add permission)
- (remove permission)
= (set permission)

# Permissions:
r (read)
w (write)
x (execute)
```

### Examples of Symbolic Notation
```bash
# Add execute permission for owner
chmod u+x script.sh

# Add read and write for group
chmod g+rw file.txt

# Remove write permission for others
chmod o-w file.txt

# Set specific permissions for all
chmod a=rx file.txt

# Multiple changes at once
chmod u+w,g-x,o=r file.txt

# Recursive changes
chmod -R g+w directory/
```

### Using Numeric Notation
```bash
# Basic syntax
chmod [number] file

# Permission numbers:
r = 4
w = 2
x = 1

# Common combinations:
7 = rwx (4+2+1)
6 = rw- (4+2)
5 = r-x (4+1)
4 = r-- (4)
3 = -wx (2+1)
2 = -w- (2)
1 = --x (1)
0 = --- (0)
```

### Examples of Numeric Notation
```bash
# Set read/write/execute for owner, read/execute for others
chmod 755 script.sh

# Set read/write for owner, read for others
chmod 644 file.txt

# Set read/write for owner only
chmod 600 secret.txt

# Set read/write/execute for owner, read/write for group
chmod 760 shared.txt

# Recursive changes with numeric notation
chmod -R 755 directory/
```

### Common chmod Options
```bash
-R, --recursive    # Change files and directories recursively
-v, --verbose      # Print what is being done
-f, --silent       # Suppress error messages
--reference=RFILE  # Use RFILE's mode instead of MODE
```

### Common Permission Combinations
```bash
# File permissions
chmod 644 file.txt    # -rw-r--r-- (common for files)
chmod 755 script.sh   # -rwxr-xr-x (common for executables)
chmod 600 secret.txt  # -rw------- (private files)

# Directory permissions
chmod 755 directory/  # drwxr-xr-x (common for directories)
chmod 750 shared/     # drwxr-x--- (group access)
chmod 700 private/    # drwx------ (private directory)
```

### Important Notes
1. **Root Privileges**
   - Some operations may require sudo
   - Example: `sudo chmod 777 file.txt`

2. **Security Considerations**
   - Avoid using 777 (full permissions)
   - Use minimum required permissions
   - Be careful with recursive changes

3. **Common Use Cases**
   - Making scripts executable
   - Setting up shared directories
   - Protecting sensitive files
   - Fixing permission issues

4. **Best Practices**
   - Use numeric notation for precise control
   - Use symbolic notation for relative changes
   - Document permission changes
   - Regular permission audits

### Best Practices
1. Use appropriate permissions
2. Regular permission audits
3. Principle of least privilege
4. Regular backup of important files
5. Monitor system logs
6. Keep system updated
7. Document custom file types 