# AWS RDS with MariaDB - Complete Guide

## Table of Contents
1. [Benefits of AWS RDS](#benefits-of-aws-rds)
2. [Setting up MariaDB on RDS](#setting-up-mariadb-on-rds)
3. [Accessing MariaDB from EC2 Instance](#accessing-mariadb-from-ec2-instance)
4. [Creating Tables in MariaDB](#creating-tables-in-mariadb)
5. [Creating Users in MariaDB](#creating-users-in-mariadb)

---

## Benefits of AWS RDS

### 1. **Managed Database Service**
- **Automated Administration**: AWS handles database setup, patching, backups, and monitoring
- **No Infrastructure Management**: No need to manage servers, storage, or networking
- **High Availability**: Multi-AZ deployments for automatic failover
- **Scalability**: Easy scaling of compute and storage resources

### 2. **Security Features**
- **Encryption at Rest**: Automatic encryption of data stored in RDS
- **Encryption in Transit**: SSL/TLS encryption for data in transit
- **IAM Integration**: Fine-grained access control using AWS IAM
- **VPC Support**: Run databases in private subnets within VPC
- **Security Groups**: Network-level access control

### 3. **Backup and Recovery**
- **Automated Backups**: Point-in-time recovery with configurable retention
- **Manual Snapshots**: On-demand backups for long-term storage
- **Cross-Region Replication**: Backup replication to different regions
- **Fast Recovery**: Quick restore from snapshots

### 4. **Performance and Monitoring**
- **Performance Insights**: Real-time database performance monitoring
- **CloudWatch Integration**: Comprehensive monitoring and alerting
- **Read Replicas**: Scale read operations across multiple instances
- **Parameter Groups**: Optimize database performance

### 5. **Cost Benefits**
- **Pay-as-you-go**: Only pay for what you use
- **Reserved Instances**: Significant discounts for predictable workloads
- **No upfront costs**: No hardware procurement or setup costs
- **Automated scaling**: Scale resources based on demand

---

## Setting up MariaDB on RDS

### Prerequisites
- AWS Account with appropriate permissions
- VPC with public and private subnets
- Security groups configured
- EC2 instance for database access

### Step-by-Step Setup

#### 1. **Create RDS Instance**
```bash
# Using AWS CLI
aws rds create-db-instance \
    --db-instance-identifier my-mariadb-instance \
    --db-instance-class db.t3.micro \
    --engine mariadb \
    --master-username admin \
    --master-user-password YourPassword123! \
    --allocated-storage 20 \
    --vpc-security-group-ids sg-xxxxxxxxx \
    --db-subnet-group-name my-db-subnet-group \
    --backup-retention-period 7 \
    --storage-encrypted \
    --deletion-protection
```

#### 2. **AWS Console Setup**
1. **Navigate to RDS Console**
   - Go to AWS Console → RDS → Databases
   - Click "Create database"

2. **Choose Configuration**
   - **Engine type**: MariaDB
   - **Version**: Latest stable version (e.g., 10.6)
   - **Template**: Free tier (for testing) or Production

3. **Settings**
   - **DB instance identifier**: `my-mariadb-instance`
   - **Master username**: `admin`
   - **Master password**: Strong password (8+ characters, mixed case, numbers, symbols)

4. **Instance Configuration**
   - **DB instance class**: Choose based on workload (t3.micro for testing)
   - **Storage**: 20 GB (minimum for MariaDB)
   - **Storage type**: General Purpose SSD (gp2)

5. **Connectivity**
   - **VPC**: Choose your VPC
   - **Subnet group**: Create or select existing
   - **Public access**: Yes (for EC2 access)
   - **VPC security group**: Create new or select existing
   - **Availability Zone**: No preference (for single AZ)

6. **Database Authentication**
   - **Database authentication options**: Password authentication

7. **Additional Configuration**
   - **Initial database name**: `mydatabase`
   - **Backup retention period**: 7 days
   - **Backup window**: Default
   - **Maintenance window**: Default
   - **Enable encryption**: Yes
   - **Enable deletion protection**: Yes (recommended)

#### 3. **Security Group Configuration**
```bash
# Create security group for RDS
aws ec2 create-security-group \
    --group-name rds-mariadb-sg \
    --description "Security group for MariaDB RDS instance"

# Add inbound rule for MariaDB (port 3306)
aws ec2 authorize-security-group-ingress \
    --group-name rds-mariadb-sg \
    --protocol tcp \
    --port 3306 \
    --source-group sg-xxxxxxxxx  # EC2 security group ID
```

#### 4. **Subnet Group Creation**
```bash
# Create DB subnet group
aws rds create-db-subnet-group \
    --db-subnet-group-name my-db-subnet-group \
    --db-subnet-group-description "Subnet group for MariaDB RDS" \
    --subnet-ids subnet-xxxxxxxxx subnet-yyyyyyyyy
```

---

## Accessing MariaDB from EC2 Instance

### Prerequisites
- EC2 instance in the same VPC as RDS
- MariaDB client installed on EC2
- Proper security group configuration

### Step 1: Install MariaDB Client on EC2

#### For Amazon Linux 2 / RHEL / CentOS:
```bash
# Update package manager
sudo yum update -y

# Install MariaDB client
sudo yum install mariadb105 -y
```

#### For Ubuntu/Debian:
```bash
# Update package manager
sudo apt update

# Install MariaDB client
sudo apt install mariadb-client -y
```

### Step 2: Connect to MariaDB RDS

#### Basic Connection:
```bash
# Connect using hostname, username, and password
mysql -h your-rds-endpoint.region.rds.amazonaws.com \
      -u admin \
      -p \
      -P 3306
```

#### Connection with Database:
```bash
# Connect to specific database
mysql -h your-rds-endpoint.region.rds.amazonaws.com \
      -u admin \
      -p \
      -D mydatabase
```

#### Connection Parameters:
- `-h`: RDS endpoint hostname
- `-u`: Username (admin)
- `-p`: Password (will prompt)
- `-P`: Port (3306 for MariaDB)
- `-D`: Database name

### Step 3: Test Connection
```sql
-- Test basic connection
SHOW DATABASES;

-- Check MariaDB version
SELECT VERSION();

-- Show current user
SELECT USER();

-- Show current database
SELECT DATABASE();
```

### Step 4: SSL Connection (Recommended)
```bash
# Connect with SSL
mysql -h your-rds-endpoint.region.rds.amazonaws.com \
      -u admin \
      -p \
      --ssl-ca=/path/to/rds-ca-2019-root.pem
```

### Step 5: Connection from Application
```python
# Python example with mysql-connector-python
import mysql.connector

config = {
    'host': 'your-rds-endpoint.region.rds.amazonaws.com',
    'user': 'admin',
    'password': 'YourPassword123!',
    'database': 'mydatabase',
    'port': 3306,
    'ssl_ca': '/path/to/rds-ca-2019-root.pem'
}

connection = mysql.connector.connect(**config)
cursor = connection.cursor()
```

---

## Creating Tables in MariaDB

### Basic Table Creation

#### 1. **Simple Table**
```sql
-- Create a basic users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. **Table with Foreign Key**
```sql
-- Create categories table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- Create products table with foreign key
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

#### 3. **Table with Indexes**
```sql
-- Create orders table with indexes
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered') DEFAULT 'pending',
    INDEX idx_user_id (user_id),
    INDEX idx_order_date (order_date),
    INDEX idx_status (status)
);
```

### Advanced Table Features

#### 4. **Table with Constraints**
```sql
-- Create employees table with various constraints
CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(10) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    salary DECIMAL(10,2) CHECK (salary > 0),
    hire_date DATE NOT NULL,
    department_id INT,
    manager_id INT,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (manager_id) REFERENCES employees(id)
);
```

#### 5. **Table with Triggers**
```sql
-- Create audit table
CREATE TABLE audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    action VARCHAR(20) NOT NULL,
    record_id INT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for user changes
DELIMITER //
CREATE TRIGGER user_audit_trigger
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, action, record_id)
    VALUES ('users', 'UPDATE', NEW.id);
END//
DELIMITER ;
```

### Data Types in MariaDB

#### Common Data Types:
- **INT**: Integer values
- **VARCHAR(n)**: Variable-length string (max n characters)
- **TEXT**: Long text data
- **DECIMAL(m,d)**: Fixed-point decimal numbers
- **TIMESTAMP**: Date and time
- **DATE**: Date only
- **TIME**: Time only
- **ENUM**: Enumeration of values
- **BOOLEAN**: True/false values

### Table Management Commands

#### View Tables:
```sql
-- Show all tables in current database
SHOW TABLES;

-- Show table structure
DESCRIBE table_name;
-- or
SHOW CREATE TABLE table_name;
```

#### Modify Tables:
```sql
-- Add column
ALTER TABLE users ADD COLUMN phone VARCHAR(15);

-- Modify column
ALTER TABLE users MODIFY COLUMN email VARCHAR(150);

-- Drop column
ALTER TABLE users DROP COLUMN phone;

-- Add index
ALTER TABLE users ADD INDEX idx_email (email);

-- Drop index
ALTER TABLE users DROP INDEX idx_email;
```

#### Drop Tables:
```sql
-- Drop table (permanent)
DROP TABLE table_name;

-- Drop table if exists
DROP TABLE IF EXISTS table_name;
```

---

## Creating Users in MariaDB

### User Management Overview

MariaDB uses a sophisticated user management system with:
- **User accounts**: Username and host combinations
- **Privileges**: Specific permissions for databases, tables, and operations
- **Roles**: Groups of privileges (MariaDB 10.0.5+)

### Creating Basic Users

#### 1. **Create User Account**
```sql
-- Create user with password
CREATE USER 'newuser'@'localhost' IDENTIFIED BY 'password123';

-- Create user for any host
CREATE USER 'newuser'@'%' IDENTIFIED BY 'password123';

-- Create user for specific host/IP
CREATE USER 'newuser'@'192.168.1.100' IDENTIFIED BY 'password123';
```

#### 2. **Grant Privileges**
```sql
-- Grant all privileges on specific database
GRANT ALL PRIVILEGES ON database_name.* TO 'newuser'@'localhost';

-- Grant specific privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON database_name.* TO 'newuser'@'localhost';

-- Grant privileges on specific table
GRANT SELECT, INSERT ON database_name.table_name TO 'newuser'@'localhost';

-- Grant all privileges on all databases (superuser - use carefully)
GRANT ALL PRIVILEGES ON *.* TO 'newuser'@'localhost' WITH GRANT OPTION;
```

#### 3. **Apply Privileges**
```sql
-- Apply privilege changes
FLUSH PRIVILEGES;
```

### Advanced User Management

#### 4. **Create User with Specific Authentication**
```sql
-- Create user with SHA256 password
CREATE USER 'secureuser'@'localhost' IDENTIFIED BY 'password123' 
REQUIRE SSL;

-- Create user with specific authentication plugin
CREATE USER 'pluginuser'@'localhost' IDENTIFIED VIA mysql_native_password 
USING PASSWORD('password123');
```

#### 5. **Create User with Resource Limits**
```sql
-- Create user with connection limits
CREATE USER 'limiteduser'@'localhost' IDENTIFIED BY 'password123'
WITH MAX_USER_CONNECTIONS 10
MAX_QUERIES_PER_HOUR 1000
MAX_UPDATES_PER_HOUR 100
MAX_CONNECTIONS_PER_HOUR 50;
```

### User Privileges

#### Common Privileges:
- **ALL PRIVILEGES**: All privileges
- **SELECT**: Read data
- **INSERT**: Insert data
- **UPDATE**: Update data
- **DELETE**: Delete data
- **CREATE**: Create databases/tables
- **DROP**: Drop databases/tables
- **ALTER**: Modify table structure
- **INDEX**: Create/drop indexes
- **GRANT OPTION**: Grant privileges to others

#### Grant Specific Privileges:
```sql
-- Grant read-only access
GRANT SELECT ON database_name.* TO 'readonly_user'@'localhost';

-- Grant write access
GRANT INSERT, UPDATE, DELETE ON database_name.* TO 'write_user'@'localhost';

-- Grant administrative access to specific database
GRANT ALL PRIVILEGES ON database_name.* TO 'admin_user'@'localhost';

-- Grant global privileges (use carefully)
GRANT PROCESS, RELOAD, SHUTDOWN ON *.* TO 'super_user'@'localhost';
```

### User Management Commands

#### View Users:
```sql
-- Show all users
SELECT User, Host FROM mysql.user;

-- Show current user
SELECT USER();

-- Show user privileges
SHOW GRANTS FOR 'username'@'host';
```

#### Modify Users:
```sql
-- Change password
ALTER USER 'username'@'host' IDENTIFIED BY 'newpassword';

-- Rename user
RENAME USER 'olduser'@'host' TO 'newuser'@'host';

-- Lock/unlock user
ALTER USER 'username'@'host' ACCOUNT LOCK;
ALTER USER 'username'@'host' ACCOUNT UNLOCK;
```

#### Remove Users:
```sql
-- Drop user
DROP USER 'username'@'host';

-- Drop user if exists
DROP USER IF EXISTS 'username'@'host';
```

### Best Practices for User Management

#### 1. **Security Best Practices**
```sql
-- Use strong passwords
CREATE USER 'secureuser'@'localhost' IDENTIFIED BY 'ComplexPassword123!';

-- Limit host access
CREATE USER 'appuser'@'192.168.1.%' IDENTIFIED BY 'password123';

-- Require SSL for sensitive operations
GRANT ALL PRIVILEGES ON sensitive_db.* TO 'secureuser'@'localhost' REQUIRE SSL;
```

#### 2. **Principle of Least Privilege**
```sql
-- Grant only necessary privileges
GRANT SELECT, INSERT ON application_db.logs TO 'logger'@'localhost';
GRANT SELECT ON application_db.reports TO 'reporter'@'localhost';
```

#### 3. **Regular Maintenance**
```sql
-- Review user privileges regularly
SHOW GRANTS FOR 'username'@'host';

-- Remove unused users
DROP USER 'unused_user'@'localhost';

-- Update passwords regularly
ALTER USER 'username'@'host' IDENTIFIED BY 'NewPassword123!';
```

### Troubleshooting User Issues

#### Common Issues:
1. **Access Denied**: Check username, password, and host
2. **Host Not Allowed**: Verify host in user creation
3. **Insufficient Privileges**: Check granted privileges
4. **Connection Issues**: Verify network connectivity and security groups

#### Diagnostic Commands:
```sql
-- Check user authentication
SELECT User, Host, plugin FROM mysql.user WHERE User = 'username';

-- Check user privileges
SHOW GRANTS FOR 'username'@'host';

-- Check current user and privileges
SELECT USER(), CURRENT_USER();
SHOW GRANTS;
```

---

## Additional Resources

### AWS RDS Documentation
- [RDS User Guide](https://docs.aws.amazon.com/rds/)
- [MariaDB on RDS](https://docs.aws.amazon.com/rds/latest/UserGuide/CHAP_MariaDB.html)
- [RDS Best Practices](https://docs.aws.amazon.com/rds/latest/UserGuide/CHAP_BestPractices.html)

### MariaDB Documentation
- [MariaDB Knowledge Base](https://mariadb.com/kb/)
- [MariaDB User Manual](https://mariadb.com/kb/en/documentation/)

### Security Best Practices
- Use strong passwords
- Enable SSL/TLS encryption
- Implement least privilege access
- Regular security updates
- Monitor access logs
- Use VPC and security groups
- Enable automated backups

### Performance Optimization
- Use appropriate instance types
- Configure parameter groups
- Implement read replicas
- Monitor performance metrics
- Optimize queries and indexes
- Use connection pooling 


### RDS Configuration Groups

#### Parameter Groups vs Option Groups

| Feature          | **Parameter Group**                              | **Option Group**                                    |
| ---------------- | ------------------------------------------------ | --------------------------------------------------- |
| What it controls | Engine settings (variables) like memory, timeout | Extra features (plugins/tools) like TDE, S3 restore |
| Common engines   | All RDS engines                                  | Oracle, SQL Server, MySQL                           |
| Reboot required? | Sometimes                                        | Often                                               |
| Example          | `max_connections = 1000`                         | `TDE` encryption, `SSIS`                            |

**Parameter Groups** are used to configure database engine parameters like memory allocation, connection limits, and query timeouts. They are available for all RDS engines and may require a reboot depending on the parameter being changed.

**Option Groups** are used to enable additional features and plugins that extend the database functionality, such as Transparent Data Encryption (TDE), SQL Server Integration Services (SSIS), or Oracle Advanced Security. They are primarily available for Oracle, SQL Server, and MySQL engines.
