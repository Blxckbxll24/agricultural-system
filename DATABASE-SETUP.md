# 🗄️ Database Setup Guide

Complete guide for setting up and configuring MySQL and MongoDB databases for the Agricultural IoT Monitoring System.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Local Development Setup](#local-development-setup)
5. [Docker Setup](#docker-setup)
6. [Connection Configuration](#connection-configuration)
7. [Database Initialization](#database-initialization)
8. [Health Checks](#health-checks)
9. [Troubleshooting](#troubleshooting)
10. [Platform-Specific Instructions](#platform-specific-instructions)

---

## Overview

The system uses two databases:
- **MySQL 8.0+**: Stores relational data (users, parcels, metadata)
- **MongoDB 7.0+**: Stores time-series sensor data

Both databases support connection retry logic with exponential backoff for enhanced reliability.

---

## Prerequisites

### Option 1: Docker (Recommended)
- Docker Desktop 20.10+
- Docker Compose 2.0+
- 4GB RAM available
- 10GB disk space

### Option 2: Local Installation
- MySQL 8.0+
- MongoDB 7.0+
- Node.js 18+

---

## Quick Start

### Using Docker (Recommended)

```bash
# Start all services including databases
docker-compose up -d

# Check that databases are healthy
docker-compose ps

# View logs
docker-compose logs -f mysql mongodb
```

The databases will be automatically initialized with:
- ✅ Tables and schemas
- ✅ Indexes for performance
- ✅ Sample data
- ✅ User accounts

**Default Credentials:**
- MySQL: `agri_user` / `agri_password123`
- MongoDB: `admin` / `mongopassword123`

---

## Local Development Setup

### MySQL Setup

#### Step 1: Install MySQL

**macOS (Homebrew):**
```bash
brew install mysql@8.0
brew services start mysql
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

**Windows:**
1. Download MySQL installer from [mysql.com](https://dev.mysql.com/downloads/installer/)
2. Run installer and choose "Developer Default"
3. Follow setup wizard

#### Step 2: Secure Installation

```bash
sudo mysql_secure_installation
```

Choose:
- Set root password: **YES**
- Remove anonymous users: **YES**
- Disallow root login remotely: **YES**
- Remove test database: **YES**
- Reload privilege tables: **YES**

#### Step 3: Create Database and User

```bash
# Login to MySQL as root
mysql -u root -p

# Run the following SQL commands:
CREATE DATABASE IF NOT EXISTS agricultural_system;

CREATE USER IF NOT EXISTS 'agri_user'@'localhost' IDENTIFIED BY 'agri_password123';
GRANT ALL PRIVILEGES ON agricultural_system.* TO 'agri_user'@'localhost';
FLUSH PRIVILEGES;

# Exit MySQL
EXIT;
```

#### Step 4: Initialize Schema

```bash
# From project root
mysql -u agri_user -p agricultural_system < scripts/01-create-mysql-tables.sql
mysql -u agri_user -p agricultural_system < scripts/02-seed-mysql-data.sql
```

#### Step 5: Verify Connection

```bash
mysql -u agri_user -p agricultural_system

# Inside MySQL
SHOW TABLES;
SELECT * FROM users;
EXIT;
```

### MongoDB Setup

#### Step 1: Install MongoDB

**macOS (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community
```

**Ubuntu/Debian:**
```bash
# Import MongoDB public GPG key
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg

# Add MongoDB repository
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Windows:**
1. Download MongoDB installer from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run installer and choose "Complete" setup
3. Install as a Windows Service

#### Step 2: Configure Authentication

```bash
# Connect to MongoDB without auth
mongosh

# Inside MongoDB shell
use admin
db.createUser({
  user: "admin",
  pwd: "mongopassword123",
  roles: [
    { role: "userAdminAnyDatabase", db: "admin" },
    { role: "readWriteAnyDatabase", db: "admin" }
  ]
})

exit
```

#### Step 3: Enable Authentication

**Linux/macOS:**
Edit `/etc/mongod.conf` or `/usr/local/etc/mongod.conf`:
```yaml
security:
  authorization: enabled
```

Restart MongoDB:
```bash
# Linux
sudo systemctl restart mongod

# macOS
brew services restart mongodb-community
```

**Windows:**
1. Edit `C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg`
2. Add security section as above
3. Restart MongoDB service from Services app

#### Step 4: Initialize Collections and Indexes

```bash
# Connect with authentication
mongosh -u admin -p mongopassword123 --authenticationDatabase admin

# Load initialization script
load('scripts/03-setup-mongodb-collections.js')

exit
```

#### Step 5: Verify Connection

```bash
mongosh -u admin -p mongopassword123 --authenticationDatabase admin

# Inside MongoDB shell
use agricultural_sensors
show collections
db.sensor_readings.countDocuments()
exit
```

---

## Docker Setup

### Starting Databases

```bash
# Start only databases
docker-compose up -d mysql mongodb

# Check health status
docker-compose ps

# Wait for healthy status
docker-compose logs -f mysql mongodb
```

### Accessing Docker Databases

**MySQL:**
```bash
# Connect to MySQL container
docker exec -it agricultural-mysql mysql -u agri_user -p
# Password: agri_password123

# Inside MySQL
USE agricultural_system;
SHOW TABLES;
SELECT * FROM users;
```

**MongoDB:**
```bash
# Connect to MongoDB container
docker exec -it agricultural-mongodb mongosh -u admin -p
# Password: mongopassword123

# Inside MongoDB
use agricultural_sensors
show collections
db.sensor_readings.find().limit(5)
```

### Managing Docker Databases

```bash
# Stop databases
docker-compose stop mysql mongodb

# Start databases
docker-compose start mysql mongodb

# Restart databases
docker-compose restart mysql mongodb

# View logs
docker-compose logs -f mysql mongodb

# Remove databases (⚠️ deletes data)
docker-compose down -v
```

---

## Connection Configuration

### Environment Variables

Each microservice uses environment variables for database configuration.

#### MySQL Services (auth-service, parcel-service)

Copy `.env.example` to `.env` in each service directory:

```bash
cd services/auth-service
cp .env.example .env

cd services/parcel-service
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=agri_user
DB_PASSWORD=agri_password123
DB_NAME=agricultural_system

# Connection Pool Settings
DB_CONNECTION_LIMIT=10
DB_CONNECT_TIMEOUT=10000
DB_ACQUIRE_TIMEOUT=10000

# Retry Configuration
DB_MAX_RETRIES=5
DB_INITIAL_RETRY_DELAY=1000
```

#### MongoDB Service (ingestion-service)

```bash
cd services/ingestion-service
cp .env.example .env
```

Edit `.env`:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://admin:mongopassword123@localhost:27017/agricultural_sensors?authSource=admin

# Connection Pool Settings
MONGODB_MAX_POOL_SIZE=50
MONGODB_MIN_POOL_SIZE=10
MONGODB_MAX_IDLE_TIME=30000
MONGODB_SERVER_SELECTION_TIMEOUT=5000
MONGODB_CONNECT_TIMEOUT=10000

# Retry Configuration
DB_MAX_RETRIES=5
DB_INITIAL_RETRY_DELAY=1000
```

### Connection Retry Logic

All services implement automatic retry with exponential backoff:

- **Max Retries**: 5 attempts (configurable)
- **Initial Delay**: 1 second
- **Backoff**: Exponential (1s, 2s, 4s, 8s, 16s)
- **Total Wait**: ~31 seconds max

This ensures services can connect even if databases start slowly.

---

## Database Initialization

### Automatic Initialization (Docker)

When using Docker Compose, databases are automatically initialized:

1. **MySQL**: Scripts in `scripts/` folder are executed on first run
   - `01-create-mysql-tables.sql` - Creates tables
   - `02-seed-mysql-data.sql` - Inserts sample data

2. **MongoDB**: JavaScript initialization script is executed
   - `03-setup-mongodb-collections.js` - Creates collections and indexes

### Manual Initialization

If databases already exist or you're not using Docker:

```bash
# MySQL
mysql -u agri_user -p agricultural_system < scripts/01-create-mysql-tables.sql
mysql -u agri_user -p agricultural_system < scripts/02-seed-mysql-data.sql

# MongoDB
mongosh -u admin -p mongopassword123 --authenticationDatabase admin scripts/03-setup-mongodb-collections.js
```

### Verification Scripts

Use these scripts to verify database setup:

```bash
# Check MySQL tables
mysql -u agri_user -p agricultural_system -e "SHOW TABLES;"

# Check MongoDB collections
mongosh -u admin -p mongopassword123 --authenticationDatabase admin --eval "db.getSiblingDB('agricultural_sensors').getCollectionNames()"
```

---

## Health Checks

### Service Health Endpoints

All microservices expose health check endpoints with database status:

```bash
# Auth Service
curl http://localhost:3001/health

# Parcel Service
curl http://localhost:3002/health

# Ingestion Service
curl http://localhost:3003/health
```

**Response Example:**
```json
{
  "status": "ok",
  "service": "auth-service",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "database": {
    "healthy": true,
    "message": "MySQL connection is healthy",
    "details": {
      "host": "localhost",
      "database": "agricultural_system",
      "connectionLimit": 10
    }
  },
  "uptime": 123.45,
  "memory": {
    "rss": 45678912,
    "heapTotal": 23456789,
    "heapUsed": 12345678
  }
}
```

### Manual Health Checks

**MySQL:**
```bash
# Direct connection test
mysql -u agri_user -p agricultural_system -e "SELECT 1;"

# Docker container
docker exec agricultural-mysql mysqladmin ping -h localhost -u agri_user -p
```

**MongoDB:**
```bash
# Direct connection test
mongosh -u admin -p mongopassword123 --authenticationDatabase admin --eval "db.adminCommand('ping')"

# Docker container
docker exec agricultural-mongodb mongosh --eval "db.adminCommand('ping')"
```

---

## Troubleshooting

### Common MySQL Issues

#### Issue: Connection Refused

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solutions:**

1. **Check if MySQL is running:**
   ```bash
   # Linux/macOS
   sudo systemctl status mysql  # or mysqld
   
   # macOS (Homebrew)
   brew services list
   
   # Windows
   # Check Services app for "MySQL80"
   ```

2. **Start MySQL:**
   ```bash
   # Linux
   sudo systemctl start mysql
   
   # macOS
   brew services start mysql
   
   # Docker
   docker-compose up -d mysql
   ```

3. **Check port binding:**
   ```bash
   # Linux/macOS
   sudo lsof -i :3306
   netstat -an | grep 3306
   
   # Windows
   netstat -ano | findstr :3306
   ```

#### Issue: Access Denied

**Symptoms:**
```
Error: Access denied for user 'agri_user'@'localhost'
```

**Solutions:**

1. **Verify credentials:**
   ```bash
   mysql -u agri_user -p
   # Enter password: agri_password123
   ```

2. **Recreate user:**
   ```sql
   DROP USER IF EXISTS 'agri_user'@'localhost';
   CREATE USER 'agri_user'@'localhost' IDENTIFIED BY 'agri_password123';
   GRANT ALL PRIVILEGES ON agricultural_system.* TO 'agri_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Check user exists:**
   ```sql
   SELECT user, host FROM mysql.user WHERE user = 'agri_user';
   ```

#### Issue: Database Does Not Exist

**Symptoms:**
```
Error: Unknown database 'agricultural_system'
```

**Solutions:**

1. **Create database:**
   ```sql
   CREATE DATABASE IF NOT EXISTS agricultural_system;
   ```

2. **Verify database exists:**
   ```sql
   SHOW DATABASES LIKE 'agricultural%';
   ```

3. **Re-run initialization scripts:**
   ```bash
   mysql -u agri_user -p < scripts/01-create-mysql-tables.sql
   ```

### Common MongoDB Issues

#### Issue: Connection Refused

**Symptoms:**
```
MongoServerSelectionError: connect ECONNREFUSED ::1:27017
```

**Solutions:**

1. **Check if MongoDB is running:**
   ```bash
   # Linux
   sudo systemctl status mongod
   
   # macOS
   brew services list
   
   # Windows
   # Check Services app for "MongoDB"
   ```

2. **Start MongoDB:**
   ```bash
   # Linux
   sudo systemctl start mongod
   
   # macOS
   brew services start mongodb-community
   
   # Docker
   docker-compose up -d mongodb
   ```

3. **Check MongoDB logs:**
   ```bash
   # Linux
   sudo tail -f /var/log/mongodb/mongod.log
   
   # macOS
   tail -f /usr/local/var/log/mongodb/mongo.log
   
   # Docker
   docker-compose logs mongodb
   ```

#### Issue: Authentication Failed

**Symptoms:**
```
MongoServerError: Authentication failed
```

**Solutions:**

1. **Verify credentials:**
   ```bash
   mongosh -u admin -p mongopassword123 --authenticationDatabase admin
   ```

2. **Recreate admin user:**
   ```javascript
   // Connect without auth
   mongosh
   
   use admin
   db.dropUser("admin")
   db.createUser({
     user: "admin",
     pwd: "mongopassword123",
     roles: ["root"]
   })
   ```

3. **Check authentication is enabled:**
   ```bash
   # Should show: authorization: enabled
   cat /etc/mongod.conf | grep authorization
   ```

#### Issue: Database/Collection Not Found

**Symptoms:**
```
Collection 'sensor_readings' not found
```

**Solutions:**

1. **Re-run initialization script:**
   ```bash
   mongosh -u admin -p mongopassword123 --authenticationDatabase admin scripts/03-setup-mongodb-collections.js
   ```

2. **Manually create collection:**
   ```javascript
   use agricultural_sensors
   db.createCollection("sensor_readings")
   ```

3. **Verify collections exist:**
   ```javascript
   use agricultural_sensors
   show collections
   ```

### Docker-Specific Issues

#### Issue: Containers Exit Immediately

**Solutions:**

1. **Check container logs:**
   ```bash
   docker-compose logs mysql
   docker-compose logs mongodb
   ```

2. **Remove volumes and restart:**
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

3. **Check disk space:**
   ```bash
   df -h
   docker system df
   ```

#### Issue: Slow Database Startup

Docker containers may take 10-30 seconds to become healthy.

**Solutions:**

1. **Wait for health checks:**
   ```bash
   docker-compose ps
   # Wait until status shows "healthy"
   ```

2. **Use wait-for-it script:**
   ```bash
   ./scripts/wait-for-it.sh localhost:3306 -- echo "MySQL ready"
   ./scripts/wait-for-it.sh localhost:27017 -- echo "MongoDB ready"
   ```

3. **Increase service startup timeout:**
   Edit `docker-compose.yml`:
   ```yaml
   services:
     mysql:
       healthcheck:
         retries: 10
         interval: 15s
   ```

---

## Platform-Specific Instructions

### macOS

#### Installation
```bash
# Install via Homebrew
brew install mysql@8.0 mongodb-community@7.0

# Start services
brew services start mysql
brew services start mongodb-community

# Verify
brew services list
```

#### Data Directories
- MySQL: `/usr/local/var/mysql`
- MongoDB: `/usr/local/var/mongodb`

#### Configuration Files
- MySQL: `/usr/local/etc/my.cnf`
- MongoDB: `/usr/local/etc/mongod.conf`

#### Logs
- MySQL: `/usr/local/var/mysql/*.log`
- MongoDB: `/usr/local/var/log/mongodb/mongo.log`

### Linux (Ubuntu/Debian)

#### Installation
```bash
# MySQL
sudo apt update
sudo apt install mysql-server

# MongoDB
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install mongodb-org

# Start services
sudo systemctl start mysql
sudo systemctl start mongod

# Enable on boot
sudo systemctl enable mysql
sudo systemctl enable mongod
```

#### Data Directories
- MySQL: `/var/lib/mysql`
- MongoDB: `/var/lib/mongodb`

#### Configuration Files
- MySQL: `/etc/mysql/my.cnf`
- MongoDB: `/etc/mongod.conf`

#### Logs
- MySQL: `/var/log/mysql/error.log`
- MongoDB: `/var/log/mongodb/mongod.log`

### Windows

#### Installation

**MySQL:**
1. Download from [mysql.com/downloads](https://dev.mysql.com/downloads/installer/)
2. Run installer, choose "Developer Default"
3. Configure as Windows Service

**MongoDB:**
1. Download from [mongodb.com/download](https://www.mongodb.com/try/download/community)
2. Run MSI installer
3. Choose "Complete" installation
4. Install as Windows Service

#### Data Directories
- MySQL: `C:\ProgramData\MySQL\MySQL Server 8.0\Data`
- MongoDB: `C:\Program Files\MongoDB\Server\7.0\data`

#### Configuration Files
- MySQL: `C:\ProgramData\MySQL\MySQL Server 8.0\my.ini`
- MongoDB: `C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg`

#### Logs
- MySQL: `C:\ProgramData\MySQL\MySQL Server 8.0\Data\*.err`
- MongoDB: `C:\Program Files\MongoDB\Server\7.0\log\mongod.log`

#### Managing Services

Use Services app (`services.msc`):
1. Press `Win + R`, type `services.msc`
2. Find "MySQL80" and "MongoDB"
3. Right-click to Start/Stop/Restart

Or use Command Prompt (as Administrator):
```cmd
REM MySQL
net start MySQL80
net stop MySQL80

REM MongoDB
net start MongoDB
net stop MongoDB
```

---

## Additional Resources

### Documentation
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [Docker Documentation](https://docs.docker.com/)

### Tools
- **MySQL Workbench**: GUI for MySQL management
- **MongoDB Compass**: GUI for MongoDB management
- **DBeaver**: Universal database tool

### Scripts Location
- MySQL initialization: `scripts/01-create-mysql-tables.sql`, `scripts/02-seed-mysql-data.sql`
- MongoDB initialization: `scripts/03-setup-mongodb-collections.js`
- Docker setup: `docker-compose.yml`
- Service configuration: `services/*/src/config/database.ts`

---

## Getting Help

If you encounter issues not covered in this guide:

1. **Check service logs:**
   ```bash
   # Docker
   docker-compose logs -f
   
   # Local services
   npm run dev  # in each service directory
   ```

2. **Verify environment variables:**
   ```bash
   # Check .env files exist
   ls -la services/*/.env
   ```

3. **Test connections manually:**
   ```bash
   # MySQL
   mysql -u agri_user -p agricultural_system
   
   # MongoDB
   mongosh -u admin -p --authenticationDatabase admin
   ```

4. **Check health endpoints:**
   ```bash
   curl http://localhost:3001/health
   curl http://localhost:3002/health
   curl http://localhost:3003/health
   ```

5. **Review other documentation:**
   - `README.md` - General project overview
   - `SETUP.md` - Frontend setup guide
   - `DOCKER-SETUP.md` - Docker deployment guide
   - `DOCUMENTATION.md` - Technical documentation

---

**Need more help?** Open an issue in the repository with:
- Your operating system
- Database versions
- Error messages
- Service logs
