# Day 15: Linux Process Management

## Understanding Processes

### Process Types
1. **Shell Jobs (Interactive Processes)**
   - Commands started from the command line
   - Associated with the shell that started them
   - Also known as interactive processes

2. **Daemons**
   - Processes that provide services
   - Typically start at system boot
   - Often run with root privileges

### Process States
| State | Symbol | Description |
|-------|--------|-------------|
| Running | R | Process is active and using CPU time |
| Sleeping | S | Process is waiting for an event |
| Uninterruptable Sleep | D | Process in sleep state that cannot be stopped (usually waiting for I/O) |
| Stopped | T | Process has been stopped (e.g., by Ctrl+Z) |
| Zombie | Z | Process has stopped but parent hasn't cleaned it up |

## Process Management Commands

### 1. Process Control
```bash
# Start process in background
command &

# Stop current job temporarily
Ctrl+Z

# Send EOF to current job
Ctrl+D

# Cancel current interactive job
Ctrl+C

# Continue stopped job in background
bg

# Bring background job to foreground
fg

# List current jobs
jobs
```

#### Job Control Commands
| Command | Description |
|---------|-------------|
| `command &` | Starts the command immediately in the background |
| `Ctrl+Z` | Stops the job temporarily for management (can be moved to background) |
| `Ctrl+D` | Sends EOF character to current job to stop waiting for input |
| `Ctrl+C` | Cancels the current interactive job |
| `bg` | Continues a stopped job in the background |
| `fg` | Brings the last background job to the foreground |
| `jobs` | Shows currently running jobs from current shell |

#### Examples of Job Control
```bash
# Example 1: Running and managing background jobs
$ sleep 100 &
[1] 1234
$ sleep 200 &
[2] 1235
$ jobs
[1]-  Running                 sleep 100 &
[2]+  Running                 sleep 200 &

# Example 2: Stopping and resuming jobs
$ sleep 300
^Z
[3]+  Stopped                 sleep 300
$ bg %3
[3]+ sleep 300 &
$ fg %1
sleep 100
^C
```

### 2. Process Monitoring

#### `ps` Command
```bash
# Show all processes (standard syntax)
ps -e

# Show all processes (BSD syntax)
ps aux

# Show process tree
ps axjf

# Show process threads
ps -eLf

# Show specific process
ps -C sshd -o pid=11288
```

#### Examples of Process Monitoring
```bash
# Example 1: Viewing all processes
$ ps aux | head -5
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.1  51696  4000 ?        Ss   Feb05   0:02 /sbin/init
root         2  0.0  0.0      0     0 ?        S    Feb05   0:00 [kthreadd]
root         3  0.0  0.0      0     0 ?        S    Feb05   0:00 [ksoftirqd/0]
root         5  0.0  0.0      0     0 ?        S<   Feb05   0:00 [kworker/0:0H]

# Example 2: Viewing process tree
$ ps axjf | head -5
 PPID   PID  PGID   SID TTY      TPGID STAT   UID   TIME COMMAND
    0     1     1     1 ?           -1 Ss       0   0:02 /sbin/init
    1     2     0     0 ?           -1 S        0   0:00 [kthreadd]
    2     3     0     0 ?           -1 S        0   0:00  \_ [ksoftirqd/0]
    2     5     0     0 ?           -1 S<       0   0:00  \_ [kworker/0:0H]
```

#### `top` Command
```bash
# Interactive process monitoring
top
```

#### Example of top Output
```bash
top - 14:30:45 up 2 days,  3:45,  2 users,  load average: 0.15, 0.10, 0.05
Tasks: 120 total,   2 running, 118 sleeping,   0 stopped,   0 zombie
%Cpu(s):  2.3 us,  1.2 sy,  0.0 ni, 96.5 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
KiB Mem :  2048000 total,   500000 free,   800000 used,   748000 buff/cache
KiB Swap:  1048576 total,  1048576 free,        0 used.  1100000 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
 1234 root      20   0  300000  50000   4000 R   2.0  2.4   0:00.05 top
 1235 user      20   0  400000  60000   5000 S   1.0  2.9   0:00.03 firefox
```

### 3. Process Priority Management

#### `nice` and `renice`
```bash
# Start process with specific priority
nice -n 10 command

# Change priority of running process
renice -n -10 -p PID
```

#### Examples of Priority Management
```bash
# Example 1: Starting process with low priority
$ nice -n 10 sleep 100 &
[1] 1234
$ ps -l
F S   UID   PID  PPID  C PRI  NI ADDR SZ WCHAN  TTY          TIME CMD
0 S  1000  1234  1233  0  90  10 -  26973 hrtime pts/0    00:00:00 sleep

# Example 2: Changing priority of running process
$ renice -n -10 -p 1234
1234 (process ID) old priority 10, new priority -10
$ ps -l
F S   UID   PID  PPID  C PRI  NI ADDR SZ WCHAN  TTY          TIME CMD
0 S  1000  1234  1233  0  70 -10 -  26973 hrtime pts/0    00:00:00 sleep
```

### 4. Process Termination

#### `kill` Command
```bash
# List available signals
kill -l

# Send TERM signal (default)
kill PID

# Force kill process
kill -9 PID

# Send HUP signal (reload config)
kill -1 PID
```

#### Examples of Process Termination
```bash
# Example 1: Listing signals
$ kill -l
 1) SIGHUP       2) SIGINT       3) SIGQUIT      4) SIGILL
 5) SIGTRAP      6) SIGABRT      7) SIGBUS       8) SIGFPE
 9) SIGKILL     10) SIGUSR1     11) SIGSEGV     12) SIGUSR2
13) SIGPIPE     14) SIGALRM     15) SIGTERM     16) SIGSTKFLT

# Example 2: Terminating processes
$ sleep 100 &
[1] 1234
$ kill 1234
[1]+  Terminated              sleep 100
```

### 5. Process Information

#### Examples of Process Information Commands
```bash
# Example 1: Finding processes with pgrep
$ pgrep -a sleep
1234 sleep 100
1235 sleep 200

# Example 2: Getting PID with pidof
$ pidof sleep
1234 1235

# Example 3: Viewing process tree
$ pstree
systemd─┬─NetworkManager───2*[{NetworkManager}]
        ├─accounts-daemon───2*[{accounts-daemon}]
        ├─acpid
        ├─avahi-daemon───avahi-daemon
        ├─cron
        ├─dbus-daemon
        └─sshd───sshd───bash───pstree
```

### 6. System Information

#### `uptime` Command
```bash
# Show system uptime and load
uptime
```

#### Example of uptime Output
```bash
$ uptime
 14:30:45 up 2 days,  3:45,  2 users,  load average: 0.15, 0.10, 0.05
```

## Important Signals
| Signal | Number | Short Name | Description | Example Usage |
|--------|--------|------------|-------------|---------------|
| SIGHUP | 1 | HUP | Hang up signal. Used to reload configuration files of running processes. Commonly used with daemons to apply new settings without restarting. | `kill -1 $(pidof nginx)`<br>Reloads Nginx configuration |
| SIGINT | 2 | INT | Interrupt signal. Sent when user presses Ctrl+C. Gracefully terminates the process. | `kill -2 PID`<br>Same as pressing Ctrl+C |
| SIGQUIT | 3 | QUIT | Quit signal. Similar to SIGINT but also generates a core dump. Used for debugging. | `kill -3 PID`<br>Terminates with core dump |
| SIGKILL | 9 | KILL | Force kill signal. Cannot be caught or ignored. Immediately terminates the process. Use as last resort. | `kill -9 PID`<br>Force terminates unresponsive process |
| SIGTERM | 15 | TERM | Termination signal. Default signal sent by kill command. Requests graceful shutdown. | `kill PID`<br>Same as `kill -15 PID` |
| SIGSTOP | 19 | STOP | Stop signal. Pauses process execution. Cannot be caught or ignored. | `kill -19 PID`<br>Pauses process execution |
| SIGTSTP | 20 | TSTP | Terminal stop signal. Sent when user presses Ctrl+Z. Can be caught by process. | `kill -20 PID`<br>Same as pressing Ctrl+Z |
| SIGCONT | 18 | CONT | Continue signal. Resumes a stopped process. | `kill -18 PID`<br>Resumes stopped process |

### Signal Usage Examples

#### 1. Graceful Process Management
```bash
# Start a process
$ sleep 1000 &
[1] 1234

# Try graceful termination first
$ kill 1234
[1]+  Terminated              sleep 1000

# If process is unresponsive, force kill
$ kill -9 1234
[1]+  Killed                  sleep 1000
```

#### 2. Configuration Reload
```bash
# Reload Apache configuration
$ kill -1 $(pidof apache2)
# Apache will reload its configuration files

# Reload Nginx configuration
$ kill -1 $(pidof nginx)
# Nginx will reload its configuration files
```

#### 3. Process Control
```bash
# Start a process
$ sleep 1000 &
[1] 1234

# Stop the process (Ctrl+Z equivalent)
$ kill -20 1234
[1]+  Stopped                 sleep 1000

# Resume the process
$ kill -18 1234
[1]+  Running                 sleep 1000 &
```

#### 4. Debugging with Core Dumps
```bash
# Start a process
$ sleep 1000 &
[1] 1234

# Generate core dump (for debugging)
$ kill -3 1234
[1]+  Quit (core dumped)      sleep 1000
```

### Best Practices for Signal Usage
1. Always try SIGTERM (15) before SIGKILL (9)
2. Use SIGKILL (9) only as a last resort
3. Use SIGHUP (1) for configuration reloads
4. Use SIGSTOP (19) or SIGTSTP (20) to pause processes
5. Use SIGCONT (18) to resume stopped processes
6. Use SIGQUIT (3) for debugging purposes
7. Avoid using SIGKILL (9) on critical system processes
8. Check process status after sending signals
9. Use `kill -l` to list all available signals
10. Consider process dependencies before sending signals

## Best Practices
1. Always try SIGTERM (15) before SIGKILL (9)
2. Use `kill -9` only as a last resort
3. Monitor system load with `uptime`
4. Use `top` for real-time process monitoring
5. Be careful when changing process priorities
6. Always check process status before termination
7. Use `jobs` to manage background processes
8. Consider using `nohup` for long-running processes
9. Monitor system resources regularly
10. Keep track of process dependencies 