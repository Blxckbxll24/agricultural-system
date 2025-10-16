# Scripts Directory

This directory contains utility scripts for database setup, validation, and health checks.

## Available Scripts

### Database Initialization

#### `01-create-mysql-tables.sql`
Creates MySQL database tables for the agricultural system.
- Creates `parcels` table for parcel management
- Creates `deleted_parcels` table for soft delete tracking
- Creates `users` table for authentication
- Creates `sensor_data_external` table for external sensor data

**Usage:**
```bash
mysql -u agri_user -p agricultural_system < scripts/01-create-mysql-tables.sql
```

#### `02-seed-mysql-data.sql`
Seeds initial data into MySQL database.
- Creates default admin and operator users
- Creates sample parcels
- Inserts test data

**Usage:**
```bash
mysql -u agri_user -p agricultural_system < scripts/02-seed-mysql-data.sql
```

#### `03-setup-mongodb-collections.js`
Initializes MongoDB collections and indexes.
- Creates `sensor_readings` collection with schema validation
- Creates `sensor_statistics` collection
- Creates indexes for optimal query performance
- Inserts sample sensor data

**Usage:**
```bash
mongosh -u admin -p mongopassword123 --authenticationDatabase admin scripts/03-setup-mongodb-collections.js
```

### Health Check and Validation

#### `check-db-health.sh`
Comprehensive database health check script.

**Features:**
- Checks MySQL connectivity and health
- Checks MongoDB connectivity and health
- Validates database existence
- Counts tables/collections
- Checks microservices health endpoints
- Checks Docker container status

**Usage:**
```bash
./scripts/check-db-health.sh
```

**Output:**
- ✓ Green checkmarks for healthy components
- ✗ Red X for unhealthy components
- ⚠ Yellow warnings for missing optional components

**Exit Codes:**
- `0` - All databases are healthy
- `1` - Some databases are unhealthy

#### `validate-environment.sh`
Validates development environment setup.

**Features:**
- Checks required tools (Node.js, npm, git)
- Checks optional tools (Docker, MySQL client, MongoDB shell)
- Validates Node.js version (requires v18+)
- Checks .env files existence
- Validates dependencies installation
- Checks database port availability
- Checks Docker container status
- Validates port availability for services

**Usage:**
```bash
./scripts/validate-environment.sh
```

**Output:**
- ✓ Green checkmarks for correct setup
- ✗ Red X for errors
- ⚠ Yellow warnings for optional issues

**Exit Codes:**
- `0` - Environment is ready
- `1` - Environment has critical errors

## Quick Start

### First Time Setup

```bash
# 1. Validate your environment
./scripts/validate-environment.sh

# 2. Initialize databases (if using Docker)
docker-compose up -d mysql mongodb

# 3. Check database health
./scripts/check-db-health.sh

# 4. Initialize schemas (if not using Docker)
mysql -u agri_user -p agricultural_system < scripts/01-create-mysql-tables.sql
mysql -u agri_user -p agricultural_system < scripts/02-seed-mysql-data.sql
mongosh -u admin -p --authenticationDatabase admin scripts/03-setup-mongodb-collections.js
```

### Regular Health Checks

```bash
# Quick health check
./scripts/check-db-health.sh

# Check specific service
curl http://localhost:3001/health  # Auth service
curl http://localhost:3002/health  # Parcel service
curl http://localhost:3003/health  # Ingestion service
```

## Troubleshooting

### Script Permission Denied

If you get "Permission denied" error:
```bash
chmod +x scripts/*.sh
```

### Database Connection Failed

1. Check if databases are running:
   ```bash
   # For Docker
   docker-compose ps
   
   # For local installations
   sudo systemctl status mysql
   sudo systemctl status mongod
   ```

2. Verify credentials in .env files

3. Check firewall rules:
   ```bash
   sudo ufw status  # Linux
   ```

### MySQL Client Not Found

Install MySQL client:
```bash
# Ubuntu/Debian
sudo apt install mysql-client

# macOS
brew install mysql-client

# Or use Docker
docker exec -it agricultural-mysql mysql -u agri_user -p
```

### MongoDB Shell Not Found

Install MongoDB shell:
```bash
# Ubuntu/Debian
sudo apt install mongodb-mongosh

# macOS
brew install mongosh

# Or use Docker
docker exec -it agricultural-mongodb mongosh -u admin -p
```

## Additional Resources

- **DATABASE-SETUP.md** - Comprehensive database setup guide
- **DOCKER-SETUP.md** - Docker deployment guide
- **SETUP.md** - Frontend setup guide
- **README.md** - Project overview

## Contributing

When adding new scripts:
1. Make scripts executable: `chmod +x script.sh`
2. Add proper error handling
3. Include usage comments at the top
4. Update this README
5. Test on all platforms (Linux, macOS, Windows with WSL)
