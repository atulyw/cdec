# Day 13: Text Processing Commands

### The `find` Command

The `find` command is one of the most important and frequently used command-line utilities in Linux. It searches and locates files and directories based on specified conditions.

#### Basic Syntax
```bash
find <search_path> <options> <required-parameters>
```

#### Common Options and Parameters

| Option | Description | Example |
|--------|-------------|---------|
| `-name <file_name>` | Search for files with specified name | `find /etc -name passwd` |
| `-perm <mode>` | Search by permission bits | `find /home -perm 644` |
| `-size <N/+N/-N>` | Search by file size | `find / -size +100M` |
| `-user <name>` | Search by owner | `find / -user cbz` |
| `-uid <uid>` | Search by user ID | `find / -uid 1005` |
| `-group <grp_name>` | Search by group | `find / -group admin` |
| `-gid <gid>` | Search by group ID | `find / -gid 1006` |
| `-amin <n/+n/-n>` | Search by access time (minutes) | `find /boot -amin -1` |
| `-mmin <n/+n/-n>` | Search by modification time (minutes) | `find /etc -mmin -1` |
| `-atime <n/+n/-n>` | Search by access time (days) | `find / -atime -7` |
| `-mtime <n/+n/-n>` | Search by modification time (days) | `find / -mtime -7` |
| `-empty` | Search for empty files | `find / -empty` |
| `-executable` | Search for executable files | `find / -executable` |
| `-type <type>` | Search by file type | `find / -type f` |
| `-exec <cmd>` | Execute command on found files | `find / -exec rm {} \;` |

#### File Types for -type Option
- `f`: Regular file
- `d`: Directory
- `l`: Symbolic link
- `c`: Character device
- `b`: Block device
- `s`: Socket
- `p`: Named pipe

#### Practical Examples

1. **Find by Name**
```bash
# Find passwd file in /etc
find /etc -name passwd

# Find files ending with .txt
find /home -name "*.txt"

# Case-insensitive search
find /home -iname "*.txt"
```

2. **Find by Permissions**
```bash
# Find files with exact permissions
find /home -perm 644

# Find files with at least these permissions
find /home -perm -644

# Find executable files
find /home -perm /u=x
```

3. **Find by Size**
```bash
# Find files larger than 100MB
find / -size +100M

# Find files smaller than 1MB
find / -size -1M

# Find files exactly 100MB
find / -size 100M
```

4. **Find by Time**
```bash
# Find files modified in last 1 minute
find /etc -mmin -1

# Find files accessed in last 7 days
find / -atime -7

# Find files modified more than 30 days ago
find / -mtime +30
```

5. **Find by User/Group**
```bash
# Find files owned by user
find / -user cbz

# Find files owned by group
find / -group admin

# Find files with no owner
find / -nouser
```

6. **Combining Multiple Conditions**
```bash
# Find .txt files modified in last 7 days
find /home -name "*.txt" -mtime -7

# Find large files owned by specific user
find / -size +100M -user cbz

# Find empty directories
find / -type d -empty
```

7. **Executing Commands on Found Files**
```bash
# Copy found files
find / -name authorized_keys -exec cp -rv {} /home \;

# Remove found files
find / -type f -name passwd -exec rm -rf {} \;

# Change permissions of found files
find /home -type f -name "*.txt" -exec chmod 644 {} \;
```

#### Important Notes
- Always use quotes around patterns containing wildcards
- Be careful with `-exec` and `-delete` actions
- Use `-print` to explicitly print results
- Consider using `-ls` for detailed output
- Use `-maxdepth` to limit search depth
- Use `-prune` to exclude directories
- Always test commands before using destructive actions

### Text Processing Commands

#### 1. `sort` Command
The `sort` command sorts lines of text files alphabetically by default.

```bash
# Basic sorting
sort flower.txt

# Sort in reverse order
sort -r flower.txt

# Sort numerically
sort -n numbers.txt

# Sort by specific field
sort -k2 data.txt

# Remove duplicates while sorting
sort -u flower.txt
```

#### 2. `uniq` Command
The `uniq` command removes duplicate lines, but only continuous duplicates.

```bash
# Remove duplicates
uniq flower.txt

# Count occurrences of each line
uniq -c flower.txt

# Show only duplicate lines
uniq -d flower.txt

# Show only unique lines
uniq -u flower.txt

# Combine with sort for all duplicates
sort flower.txt | uniq
```

#### 3. `sed` Command (Stream Editor)
`sed` is a powerful stream editor for filtering and transforming text.

```bash
# Add # at start of each line
sed -i 's/^/#/' flower.txt

# Replace text
sed 's/old/new/g' file.txt

# Delete lines
sed '5d' file.txt

# Print specific lines
sed -n '1,3p' file.txt

# Multiple commands
sed -e 's/old/new/g' -e 's/foo/bar/g' file.txt
```

#### 4. `wc` Command (Word Count)
`wc` counts lines, words, and characters in text files.

```bash
# Count all (lines, words, characters)
wc flower.txt

# Count only lines
wc -l flower.txt

# Count only words
wc -w flower.txt

# Count only characters
wc -m flower.txt

# Count multiple files
wc *.txt
```

#### 5. `grep` Command
`grep` searches for patterns in text files.

```bash
# Basic search
grep "pattern" file.txt

# Case-insensitive search
grep -i "pattern" file.txt

# Show line numbers
grep -n "pattern" file.txt

# Count matches
grep -c "pattern" file.txt

# Invert match (show non-matching lines)
grep -v "pattern" file.txt

# Show context around match
grep -C 2 "pattern" file.txt
```

### Practical Examples

1. **Combining Commands**
```bash
# Find unique sorted lines
sort flower.txt | uniq

# Count unique lines
sort flower.txt | uniq | wc -l

# Search in sorted file
sort flower.txt | grep "pattern"

# Process and count
sed 's/old/new/g' file.txt | wc -l
```

2. **File Processing**
```bash
# Add comment to all lines
sed -i 's/^/#/' flower.txt

# Remove comments
sed -i 's/^#//' flower.txt

# Count non-empty lines
grep -c -v '^$' file.txt

# Find and replace with backup
sed -i.bak 's/old/new/g' file.txt
```

3. **Text Analysis**
```bash
# Count word frequency
sort file.txt | uniq -c | sort -nr

# Find duplicate lines
sort file.txt | uniq -d

# Count lines containing pattern
grep -c "pattern" file.txt

# Show context of matches
grep -C 2 "pattern" file.txt
```

### Important Notes
- `sort` can handle different data types (text, numbers)
- `uniq` only works on sorted input for non-continuous duplicates
- `sed` can modify files in-place with `-i` option
- `wc` provides different counting options
- `grep` has powerful pattern matching capabilities
- Always backup files before using `-i` with `sed`
- Use quotes around patterns in `grep` to prevent shell expansion
- Consider using `-i` with `grep` for case-insensitive searches
- Use `-n` with `sed` to suppress automatic printing
- Combine commands with pipes for complex operations
