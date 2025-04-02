# Day 9: Managing Linux Permissions

## Understanding /etc/passwd File

The `/etc/passwd` file contains user account information. Each line has seven fields separated by colons:

1. Username
2. Password (x indicates password is stored in /etc/shadow)
3. User ID (UID)
4. Group ID (GID)
5. User description/comment
6. Home directory
7. Login shell

Example line:
```
ganesh:x:1000:1000:ganesh gaytonde:/home/atul:/bin/bash
```

## User Management Commands

### 1. adduser Command

The `adduser` command is used to create new user accounts.

#### Options:
- `-c`: Add a comment/description for the user
- `-d`: Specify home directory
- `-u`: Set user ID (UID)
- `-g`: Set primary group (must exist)
- `-s`: Set login shell

#### Examples:
```bash
# Create user with comment
adduser -c "John Doe" john

# Create user with specific home directory
adduser -d /home/custom/john john

# Create user with specific UID
adduser -u 1001 john

# Create user with specific group
adduser -g developers john

# Create user with specific shell
adduser -s /bin/bash john
```

### 2. usermod Command

The `usermod` command modifies existing user account properties.

#### Options:
- `-c`: Change user comment
- `-d`: Change home directory
- `-u`: Change user ID
- `-g`: Change primary group
- `-s`: Change login shell
- `-L`: Lock user account
- `-U`: Unlock user account

#### Examples:
```bash
# Change user comment
usermod -c "John Smith" john

# Change home directory
usermod -d /home/new/john john

# Change UID
usermod -u 1002 john

# Change primary group
usermod -g admin john

# Change login shell
usermod -s /bin/sh john

# Lock user account
usermod -L john

# Unlock user account
usermod -U john
```

### 3. passwd Command

The `passwd` command manages user passwords.

#### Options:
- `-l`: Lock user's password
- `-u`: Unlock user's password

#### Examples:
```bash
# Change password for current user
passwd

# Change password for specific user
passwd john

# Lock user's password
passwd -l john

# Unlock user's password
passwd -u john
```

### 4. userdel Command

The `userdel` command removes user accounts.

#### Options:
- `-r`: Remove home directory and mail spool

#### Examples:
```bash
# Remove user account
userdel john

# Remove user account and home directory
userdel -r john
```

## Best Practices
1. Always use `-r` with `userdel` to clean up user files
2. Use descriptive comments with `-c` option
3. Ensure groups exist before assigning them
4. Use absolute paths for home directories
5. Verify shell paths exist before assigning them
6. Lock accounts instead of deleting when temporary access is needed 