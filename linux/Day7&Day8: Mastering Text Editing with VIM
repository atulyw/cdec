# Day 7: File Copy and Vim Editor

## File Copy Command

### Basic Syntax
```bash
cp -rv /etc/ssh/sshd_config .
```
- `-r`: Recursive copy (for directories)
- `-v`: Verbose output (shows what's being copied)
- `.`: Copy to current directory

## Vim Editor

Vim is a powerful text editor with three main modes:

### 1. Command Mode (Default)
- Default mode when opening Vim
- Used for navigation and commands

#### Line Operations
- `dd`: Delete current line
- `<n>dd`: Delete n lines from current cursor
  - `2dd`: Delete 2 lines
  - `10dd`: Delete 10 lines
- `yy`: Copy (yank) current line
- `<n>yy`: Copy n lines
  - `2yy`: Copy 2 lines
- `p`: Paste copied/deleted lines
- `<n>p`: Paste n times
  - `10p`: Paste 10 times
- `u`: Undo
- `Ctrl + r`: Redo

#### Word Operations
- `dw`: Delete current word
- `<n>dw`: Delete n words
  - `7dw`: Delete 7 words

#### Navigation
- `gg`: Move to first line
- `<n>gg`: Move to specific line
  - `20gg`: Move to line 20
  - `102gg`: Move to line 102
- `G`: Move to last line
- `M`: Move to middle of screen
- `H`: Move to top of screen
- `L`: Move to bottom of screen

#### Search Operations
- `/<word>`: Search for word
  - `n`: Find next occurrence
  - `N`: Find previous occurrence

### 2. Insert Mode
- Used for text input
- Enter with: `i`, `I`, `a`, `A`, `o`, `O`
- Exit with: `Esc` or `Esc+Esc`

#### Insert Mode Commands
- `i`: Insert at cursor
- `I`: Insert at beginning of line
- `a`: Insert after cursor
- `A`: Insert at end of line
- `o`: Insert new line below
- `O`: Insert new line above
- `r`: Replace single character
- `R`: Replace multiple characters

### 3. Ex Mode (Command Line Mode)
- Enter with `:`
- Used for file operations and advanced commands

#### File Operations
- `:q`: Quit
- `:q!`: Force quit
- `:w`: Save
- `:w!`: Force save
- `:wq`: Save and quit
- `:wq!`: Force save and quit
- `:x`: Save and quit
- `:x!`: Force save and quit

#### Display Options
- `:set nu`: Show line numbers
- `:set nonu`: Hide line numbers
- `:<n>`: Move to line n

#### Search and Replace
- `:%s/<old>/<new>/g`: Replace all occurrences
  - Example: `:%s/sshd/cbz/g`

#### External Commands
- `:!<command>`: Execute shell command
  - Examples:
    ```vim
    :!touch file1.txt
    :!touch file{1..100}.txt
    :!mkdir dir2
    :!ls
    ```

### Visual Mode
- `v`: Select character by character
- `V`: Select line by line
- `Ctrl+v`: Select block
- Can use `yy`, `cc`, `dd` in visual mode

## Best Practices
1. Always save work before quitting
2. Use undo/redo for safety
3. Use visual mode for block operations
4. Use search for navigation
5. Use line numbers for reference
6. Use external commands when needed
7. Regular saving during editing

## Quick Reference Table

| Category | Command | Description |
|----------|---------|-------------|
| **File Operations** | `:w` | Save file |
| | `:q` | Quit |
| | `:wq` | Save and quit |
| | `:q!` | Force quit |
| **Line Operations** | `dd` | Delete current line |
| | `yy` | Copy current line |
| | `p` | Paste |
| | `u` | Undo |
| | `Ctrl + r` | Redo |
| **Navigation** | `gg` | Move to first line |
| | `G` | Move to last line |
| | `:set nu` | Show line numbers |
| | `/<word>` | Search for word |
| **Insert Mode** | `i` | Insert at cursor |
| | `I` | Insert at line start |
| | `a` | Insert after cursor |
| | `A` | Insert at line end |
| | `o` | Insert new line below |
| | `O` | Insert new line above |
| **Visual Mode** | `v` | Select character |
| | `V` | Select line |
| | `Ctrl+v` | Select block |
| **Search/Replace** | `:%s/old/new/g` | Replace all occurrences |
| **External** | `:!command` | Execute shell command | 