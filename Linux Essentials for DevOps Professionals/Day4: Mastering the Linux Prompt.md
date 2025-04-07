# Day 4: Mastering the Linux Prompt

## Understanding the Linux Command Prompt

### What is Command Prompt?
- Text-based interface for interacting with Linux system
- Also known as terminal, shell, or command line
- Primary way to execute commands and manage system

### Basic Components
1. **Terminal Emulator**
   - Software that provides command prompt interface
   - Examples: GNOME Terminal, Konsole, xterm

2. **Shell**
   - Command interpreter
   - Processes commands
   - Common shells: bash, zsh, fish

3. **Command Prompt**
   - Shows current directory
   - User information
   - System status

## Decoding the Structure of the Command Prompt

### Basic Prompt Format
```bash
username@hostname:current_directory$
```

### Components Breakdown
1. **Username**
   - Current user's login name
   - Shows who is executing commands

2. **Hostname**
   - Name of the computer
   - Network identification

3. **Current Directory**
   - Present working directory
   - Shows location in file system

4. **Prompt Symbol**
   - $ for regular users
   - \# for root user

### Example
```bash
labex@servername:/home/john$
```

## Effective Command Prompt Usage

### Basic Navigation
1. **Directory Navigation**
   ```bash
   cd /path/to/directory    # Change directory
   cd ..                    # Go up one level
   cd ~                     # Go to home directory
   cd -                     # Go to previous directory
   ```
   **Examples:**
   ```bash
   cd /home/user/documents  # Navigate to documents folder
   cd ..                    # Move up to parent directory
   cd ~/Downloads          # Go to Downloads in home directory
   cd -                    # Return to previous directory
   ```

2. **File Operations**
   ```bash
   ls                       # List files
   ls -l                    # Detailed list
   ls -a                    # Show hidden files
   ls -h                    # Human-readable sizes
   ```
   **Examples:**
   ```bash
   ls                      # Show all files
   ls -l                   # Show detailed list with permissions
   ls -la                  # Show all files including hidden ones
   ls -lh                  # Show sizes in human-readable format
   ls *.txt                # Show only text files
   ```

3. **File Management**
   ```bash
   cp file1 file2          # Copy files
   mv file1 file2          # Move/rename files
   rm file                 # Remove file
   mkdir directory         # Create directory
   rmdir directory         # Remove directory
   ```
   **Examples:**
   ```bash
   cp document.txt backup.txt           # Copy file
   cp -r folder1 folder2                # Copy directory recursively
   mv oldname.txt newname.txt           # Rename file
   mv file.txt /path/to/destination/    # Move file
   rm file.txt                          # Remove file
   rm -rf directory                     # Remove directory and contents
   mkdir new_project                    # Create directory
   mkdir -p parent/child/grandchild     # Create nested directories
   rmdir empty_directory                # Remove empty directory
   ```

### Command History
```bash
history                   # Show command history
!n                       # Execute nth command
!!                       # Execute last command
Ctrl + R                 # Search command history
```
**Examples:**
```bash
history | grep cd        # Show all cd commands in history
!5                       # Execute command number 5 from history
!!                       # Repeat last command
!$                       # Use last argument of previous command
```

### Command Completion
- Tab key for file/directory completion
- Double tab for options
- Path completion


## Introduction to Linux Basic Commands

### File System Commands
```bash
pwd                      # Print working directory
ls                       # List directory contents
cd                       # Change directory
mkdir                    # Make directory
rmdir                    # Remove directory
touch                    # Create empty file
cp                       # Copy files
mv                       # Move/rename files
rm                       # Remove files
```
**Examples:**
```bash
pwd                      # Shows: /home/user/current/directory
touch newfile.txt        # Create empty file
touch file1.txt file2.txt # Create multiple files
touch -t 202403151200 file.txt  # Create file with specific timestamp
```

### File Content Commands
```bash
cat                      # Display file content
less                     # View file content
more                     # View file content
head                     # Show first few lines
tail                     # Show last few lines
grep                     # Search text in files
```
**Examples:**
```bash
cat file.txt             # Display entire file
cat file1.txt file2.txt  # Concatenate multiple files
less large_file.txt      # View file with navigation
head -n 5 file.txt       # Show first 5 lines
tail -f log.txt          # Follow log file in real-time
```

### System Commands
```bash
clear                    # Clear screen
date                     # Show date and time
cal                      # Show calendar
who                      # Show logged-in users
```
**Examples:**
```bash
cal 2024                   # Show calendar for 2024
cal -3                     # Show 3 months
who -u                     # Show users with idle time
w                          # Show system load and users
```



### System Information Commands
```bash
uname -a                 # System information
hostname                 # Show hostname
uptime                   # Show uptime
free                     # Memory usage
df                       # Disk usage
du                       # Directory size
```
**Examples:**
```bash
uname -a                 # Show all system information
free -h                  # Show memory in human-readable format
df -h                    # Show disk usage in human-readable format
du -sh *                 # Show directory sizes in current location
```
