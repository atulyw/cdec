# Networking Fundamentals

## Overview of Networking Fundamentals

### What is a Network?
- A network is a collection of interconnected devices that can communicate with each other
- Enables sharing of resources, data, and services
- Can be wired or wireless

### Key Components
- **Nodes:** Devices connected to the network (computers, servers, routers)
- **Links:** Physical or wireless connections between nodes
- **Protocols:** Rules governing communication between devices

## Network Types and Protocols

### Common Network Types
1. **Local Area Network (LAN)**
   - Small geographical area (home, office)
   - High data transfer rates
   - Private ownership

2. **Wide Area Network (WAN)**
   - Large geographical area
   - Connects multiple LANs
   - Uses public/private infrastructure

3. **Wireless Local Area Network (WLAN)**
   - Uses wireless technology (Wi-Fi)
   - Flexible device placement
   - Security considerations important

### Essential Network Protocols
- **TCP/IP:** Foundation of internet communication
- **HTTP/HTTPS:** Web communication
- **FTP:** File transfer
- **SSH:** Secure remote access
- **DNS:** Domain name resolution
- **DHCP:** Automatic IP assignment

## IP Addressing Fundamentals

### IPv4 Address Structure
- 32-bit address (4 bytes)
- Written in dotted-decimal notation (e.g., 192.168.1.1)
- Each byte (octet) ranges from 0 to 255

### Understanding Netmasks
1. **What is a Netmask?**
   - A 32-bit number that divides an IP address into network and host portions
   - Written in the same format as IP addresses (e.g., 255.255.255.0)
   - Also known as subnet mask

2. **Netmask Representation**
   - Binary form: 1s represent network portion, 0s represent host portion
   - Example: 255.255.255.0 = 11111111.11111111.11111111.00000000
   - CIDR notation: /24 (number of 1s in the netmask)

3. **Why Netmasks are Important**
   - **Network Identification:** Helps identify which network a device belongs to
   - **Subnetting:** Enables division of large networks into smaller subnets
   - **Routing:** Essential for routers to determine where to send packets
   - **Broadcast Domains:** Defines the scope of broadcast messages
   - **Security:** Helps in implementing network segmentation and access control

4. **Common Netmask Values**
   - Class A: 255.0.0.0 (/8)
   - Class B: 255.255.0.0 (/16)
   - Class C: 255.255.255.0 (/24)
   - Custom: Various values for subnetting (e.g., 255.255.255.128, 255.255.255.192)

5. **Netmask Calculation Example**
   ```
   IP Address: 192.168.1.100
   Netmask:    255.255.255.0
   Network:    192.168.1.0
   Broadcast:  192.168.1.255
   Host Range: 192.168.1.1 to 192.168.1.254
   ```

6. **CIDR Notation**
   - Shorthand for netmask representation
   - Example: 192.168.1.0/24
   - Number after slash indicates number of network bits
   - Makes subnetting calculations easier

### IP Address Classes
1. **Class A**
   - Range: 1.0.0.0 to 126.255.255.255
   - First octet: Network ID
   - Last three octets: Host ID
   - Total networks: 126
   - Hosts per network: 16,777,214

2. **Class B**
   - Range: 128.0.0.0 to 191.255.255.255
   - First two octets: Network ID
   - Last two octets: Host ID
   - Total networks: 16,384
   - Hosts per network: 65,534

3. **Class C**
   - Range: 192.0.0.0 to 223.255.255.255
   - First three octets: Network ID
   - Last octet: Host ID
   - Total networks: 2,097,152
   - Hosts per network: 254

4. **Class D** (Multicast)
   - Range: 224.0.0.0 to 239.255.255.255
   - Used for multicast groups

5. **Class E** (Reserved)
   - Range: 240.0.0.0 to 255.255.255.255
   - Reserved for experimental use

### Reserved IP Addresses
1. **Network Address**
   - Host portion all zeros (e.g., 192.168.1.0)
   - Represents the network itself

2. **Broadcast Address**
   - Host portion all ones (e.g., 192.168.1.255)
   - Used to send to all hosts on network

3. **Loopback Address**
   - Range: 127.0.0.0 to 127.255.255.255
   - Most common: 127.0.0.1
   - Used for local testing

4. **APIPA (Automatic Private IP Addressing)**
   - Range: 169.254.0.0 to 169.254.255.255
   - Used when DHCP fails
   - Windows/Linux automatic fallback

5. **Private IP Ranges**
   - Class A: 10.0.0.0 to 10.255.255.255
   - Class B: 172.16.0.0 to 172.31.255.255
   - Class C: 192.168.0.0 to 192.168.255.255

### Total Possible IP Addresses
- Total IPv4 address space: 2^32 = 4,294,967,296 addresses
- Usable addresses after reservations: ~3.7 billion
- Private IP ranges: ~17.9 million addresses
- Public IP addresses: ~3.7 billion minus private ranges

## Using ifconfig and ip Commands

### ifconfig Command
```bash
# Display all network interfaces
ifconfig

# Display specific interface
ifconfig eth0

# Enable/disable interface
ifconfig eth0 up
ifconfig eth0 down

# Set IP address
ifconfig eth0 192.168.1.100 netmask 255.255.255.0
```

### ip Command (Modern Alternative)
```bash
# Show all interfaces
ip addr show

# Show specific interface
ip addr show eth0

# Set IP address
ip addr add 192.168.1.100/24 dev eth0

# Show routing table
ip route show
```

## Basic Network Configuration Steps

1. **Identify Network Interface**
   - List available interfaces
   - Check current configuration

2. **Configure IP Address**
   - Choose static or dynamic (DHCP)
   - Set subnet mask
   - Configure gateway

3. **Set DNS Servers**
   - Primary DNS
   - Secondary DNS

4. **Test Connectivity**
   - Ping gateway
   - Test DNS resolution
   - Check internet access

## Configuring Static IP with nmtui and nmcli

### Using nmtui (Text-based UI)
1. Launch nmtui:
   ```bash
   nmtui
   ```
2. Select "Edit a connection"
3. Choose interface
4. Configure:
   - IPv4 configuration
   - IP address
   - Gateway
   - DNS servers

### Using nmcli (Command Line)
```bash
# Show all connections
nmcli connection show

# Add new connection
nmcli connection add type ethernet con-name "static-eth0" ifname eth0

# Configure static IP
nmcli connection modify "static-eth0" ipv4.addresses "192.168.1.100/24"
nmcli connection modify "static-eth0" ipv4.gateway "192.168.1.1"
nmcli connection modify "static-eth0" ipv4.dns "8.8.8.8,8.8.4.4"
nmcli connection modify "static-eth0" ipv4.method manual

# Activate connection
nmcli connection up "static-eth0"
```

## Example: Configuring a Static IP Address and Verifying Network Connectivity

### Step 1: Configure Static IP
```bash
# Using nmcli
nmcli connection add type ethernet con-name "static-eth0" ifname eth0
nmcli connection modify "static-eth0" ipv4.addresses "192.168.1.100/24"
nmcli connection modify "static-eth0" ipv4.gateway "192.168.1.1"
nmcli connection modify "static-eth0" ipv4.dns "8.8.8.8,8.8.4.4"
nmcli connection modify "static-eth0" ipv4.method manual
nmcli connection up "static-eth0"
```

### Step 2: Verify Configuration
```bash
# Check IP address
ip addr show eth0

# Check routing table
ip route show

# Test connectivity
ping 192.168.1.1  # Gateway
ping 8.8.8.8      # Google DNS
ping google.com   # Test DNS resolution
```

### Step 3: Troubleshooting
- Check interface status
- Verify IP configuration
- Test network connectivity
- Check DNS resolution
- Review system logs if needed