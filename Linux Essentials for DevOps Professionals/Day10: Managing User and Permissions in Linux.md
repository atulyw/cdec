# Day 10: Password Security and Group Management

## Understanding /etc/shadow File

The `/etc/shadow` file contains encrypted passwords and account expiration information. Each line has nine fields:

1. Username
   - Login name of the user
   - Must match username in /etc/passwd

2. Encrypted Password
   - Password hash (starts with $6$ for SHA-512)
   - $1$ for MD5
   - $2a$ for Blowfish
   - $5$ for SHA-256
   - !! or * means account is locked
   - Empty field means no password required

3. Last Password Change
   - Days since epoch (Jan 1, 1970)
   - 0 means change required at next login
   - Empty means password aging disabled

4. Minimum Password Age
   - Minimum days between password changes
   - 0 means no minimum
   - Empty means no minimum

5. Maximum Password Age
   - Days until password expires
   - 99999 means never expires
   - Empty means no maximum

6. Password Warning Period
   - Days before expiration to warn user
   - 0 means no warning
   - Empty means no warning

7. Password Inactivity Period
   - Days after expiration until account is disabled
   - 0 means disabled immediately
   - Empty means no inactivity period

8. Account Expiration Date
   - Days since epoch when account expires
   - Empty means never expires
   - After expiration, account is disabled

9. Reserved Field
   - Reserved for future use
   - Currently unused

Example line with explanation:

```john:$6$xyz123...:18000:0:99999:7:::```

- Username: john
- Password: SHA-512 encrypted
- Last change: 18000 days since epoch
- Min age: 0 (no minimum)
- Max age: 99999 (never expires)
- Warning: 7 days
- Inactivity: disabled
- Expiration: never
- Reserved: unused

## Linux Groups

### Introduction to Groups
- Groups are collections of users
- Used for permission management
- Each user belongs to at least one group (primary group)
- Users can belong to multiple secondary groups

### Fields of /etc/group
Each line contains four fields:
1. Group name
2. Password (x indicates password in /etc/gshadow)
3. Group ID (GID)
4. Group members (comma-separated)

Example:
```
developers:x:1001:john,jane,bob
```

### Fields of /etc/gshadow
Each line contains four fields:
1. Group name
2. Encrypted group password
3. Group administrators
4. Group members

Example:
```
developers:$6$xyz123...:admin:john,jane,bob
```

### Types of Groups
1. Primary Group
   - Default group for user
   - Created with user account
   - User's files are owned by this group

2. Secondary Groups
   - Additional groups user belongs to
   - Used for resource sharing
   - User can belong to multiple secondary groups

3. System Groups
   - Used by system services
   - Usually have UIDs < 1000
   - Not meant for regular users

### Group Management Commands

#### Creating Groups
```bash
# Create new group
groupadd developers

# Create group with specific GID
groupadd -g 1001 developers

# Create system group
groupadd -r systemgroup
```

#### Deleting Groups
```bash
# Delete group
groupdel developers

# Note: Cannot delete primary group of existing users
```

#### Modifying Groups
```bash
# Change group name
groupmod -n newname oldname

# Change group ID
groupmod -g 1002 developers
```

#### Managing Group Memberships
```bash
# Add user to group
usermod -a -G developers john

# Remove user from group
gpasswd -d john developers

# Set group administrators
gpasswd -A john developers
```

#### Viewing and Editing Group Information
```bash
# View group information
getent group developers

# Edit group
groupmod -n newname oldname

# List user's groups
groups username
```

## Best Practices
1. Use strong group passwords when needed
2. Regularly audit group memberships
3. Use meaningful group names
4. Document group purposes
5. Implement least privilege principle
6. Regular security audits of group permissions
7. Monitor group changes in system logs 