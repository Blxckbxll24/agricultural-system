#!/bin/bash

# Database Health Check Script
# Checks connectivity and health of MySQL and MongoDB databases

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MYSQL_HOST="${DB_HOST:-localhost}"
MYSQL_PORT="${DB_PORT:-3306}"
MYSQL_USER="${DB_USER:-agri_user}"
MYSQL_PASSWORD="${DB_PASSWORD:-agri_password123}"
MYSQL_DATABASE="${DB_NAME:-agricultural_system}"

MONGODB_URI="${MONGODB_URI:-mongodb://admin:mongopassword123@localhost:27017/agricultural_sensors?authSource=admin}"
MONGODB_HOST="${MONGODB_HOST:-localhost}"
MONGODB_PORT="${MONGODB_PORT:-27017}"

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   Database Health Check - Agricultural System${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check MySQL
check_mysql() {
    echo -e "${YELLOW}Checking MySQL...${NC}"
    
    # Check if mysql client is installed
    if ! command_exists mysql && ! command_exists docker; then
        echo -e "${RED}✗ MySQL client not found and Docker not available${NC}"
        echo -e "  Install MySQL client or use Docker"
        return 1
    fi
    
    # Check if port is open
    if command_exists nc; then
        if ! nc -z "$MYSQL_HOST" "$MYSQL_PORT" 2>/dev/null; then
            echo -e "${RED}✗ MySQL port $MYSQL_PORT is not accessible${NC}"
            return 1
        fi
        echo -e "${GREEN}✓ MySQL port is accessible${NC}"
    fi
    
    # Try to connect using Docker if mysql client is not available
    if ! command_exists mysql; then
        echo -e "${YELLOW}  Using Docker to check MySQL...${NC}"
        if docker ps | grep -q agricultural-mysql; then
            if docker exec agricultural-mysql mysqladmin ping -h localhost -u "$MYSQL_USER" --password="$MYSQL_PASSWORD" >/dev/null 2>&1; then
                echo -e "${GREEN}✓ MySQL is responding to ping${NC}"
                
                # Check database exists
                if docker exec agricultural-mysql mysql -u "$MYSQL_USER" --password="$MYSQL_PASSWORD" -e "USE $MYSQL_DATABASE" 2>/dev/null; then
                    echo -e "${GREEN}✓ Database '$MYSQL_DATABASE' exists${NC}"
                    
                    # Count tables
                    TABLE_COUNT=$(docker exec agricultural-mysql mysql -u "$MYSQL_USER" --password="$MYSQL_PASSWORD" "$MYSQL_DATABASE" -sNe "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$MYSQL_DATABASE'")
                    echo -e "${GREEN}✓ Database has $TABLE_COUNT tables${NC}"
                else
                    echo -e "${RED}✗ Database '$MYSQL_DATABASE' not found${NC}"
                    return 1
                fi
                return 0
            else
                echo -e "${RED}✗ MySQL is not responding${NC}"
                return 1
            fi
        else
            echo -e "${RED}✗ MySQL Docker container not running${NC}"
            return 1
        fi
    else
        # Check connection
        if mysqladmin ping -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" --password="$MYSQL_PASSWORD" >/dev/null 2>&1; then
            echo -e "${GREEN}✓ MySQL is responding to ping${NC}"
            
            # Check database exists
            if mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" --password="$MYSQL_PASSWORD" -e "USE $MYSQL_DATABASE" 2>/dev/null; then
                echo -e "${GREEN}✓ Database '$MYSQL_DATABASE' exists${NC}"
                
                # Count tables
                TABLE_COUNT=$(mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" --password="$MYSQL_PASSWORD" "$MYSQL_DATABASE" -sNe "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$MYSQL_DATABASE'")
                echo -e "${GREEN}✓ Database has $TABLE_COUNT tables${NC}"
            else
                echo -e "${RED}✗ Database '$MYSQL_DATABASE' not found${NC}"
                return 1
            fi
        else
            echo -e "${RED}✗ MySQL is not responding${NC}"
            return 1
        fi
    fi
    
    return 0
}

# Function to check MongoDB
check_mongodb() {
    echo ""
    echo -e "${YELLOW}Checking MongoDB...${NC}"
    
    # Check if mongosh is installed
    if ! command_exists mongosh && ! command_exists docker; then
        echo -e "${RED}✗ MongoDB shell (mongosh) not found and Docker not available${NC}"
        echo -e "  Install MongoDB shell or use Docker"
        return 1
    fi
    
    # Check if port is open
    if command_exists nc; then
        if ! nc -z "$MONGODB_HOST" "$MONGODB_PORT" 2>/dev/null; then
            echo -e "${RED}✗ MongoDB port $MONGODB_PORT is not accessible${NC}"
            return 1
        fi
        echo -e "${GREEN}✓ MongoDB port is accessible${NC}"
    fi
    
    # Try to connect using Docker if mongosh is not available
    if ! command_exists mongosh; then
        echo -e "${YELLOW}  Using Docker to check MongoDB...${NC}"
        if docker ps | grep -q agricultural-mongodb; then
            if docker exec agricultural-mongodb mongosh --quiet --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
                echo -e "${GREEN}✓ MongoDB is responding to ping${NC}"
                
                # Check database exists
                DBS=$(docker exec agricultural-mongodb mongosh --quiet --eval "db.getMongo().getDBNames()" | grep agricultural_sensors || true)
                if [ -n "$DBS" ]; then
                    echo -e "${GREEN}✓ Database 'agricultural_sensors' exists${NC}"
                    
                    # Count collections
                    COLL_COUNT=$(docker exec agricultural-mongodb mongosh --quiet agricultural_sensors --eval "db.getCollectionNames().length" 2>/dev/null || echo "0")
                    echo -e "${GREEN}✓ Database has $COLL_COUNT collections${NC}"
                else
                    echo -e "${YELLOW}⚠ Database 'agricultural_sensors' not found (will be created on first use)${NC}"
                fi
                return 0
            else
                echo -e "${RED}✗ MongoDB is not responding${NC}"
                return 1
            fi
        else
            echo -e "${RED}✗ MongoDB Docker container not running${NC}"
            return 1
        fi
    else
        # Check connection
        if mongosh "$MONGODB_URI" --quiet --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
            echo -e "${GREEN}✓ MongoDB is responding to ping${NC}"
            
            # Check database exists
            DBS=$(mongosh "$MONGODB_URI" --quiet --eval "db.getMongo().getDBNames()" | grep agricultural_sensors || true)
            if [ -n "$DBS" ]; then
                echo -e "${GREEN}✓ Database 'agricultural_sensors' exists${NC}"
                
                # Count collections
                COLL_COUNT=$(mongosh "$MONGODB_URI" --quiet --eval "db.getCollectionNames().length" 2>/dev/null || echo "0")
                echo -e "${GREEN}✓ Database has $COLL_COUNT collections${NC}"
            else
                echo -e "${YELLOW}⚠ Database 'agricultural_sensors' not found (will be created on first use)${NC}"
            fi
        else
            echo -e "${RED}✗ MongoDB is not responding${NC}"
            return 1
        fi
    fi
    
    return 0
}

# Function to check microservices health endpoints
check_services() {
    echo ""
    echo -e "${YELLOW}Checking Microservices Health Endpoints...${NC}"
    
    if ! command_exists curl; then
        echo -e "${YELLOW}⚠ curl not found, skipping service health checks${NC}"
        return 0
    fi
    
    # Auth Service
    if curl -sf http://localhost:3001/health >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Auth Service (port 3001) is healthy${NC}"
    else
        echo -e "${YELLOW}⚠ Auth Service (port 3001) is not responding${NC}"
    fi
    
    # Parcel Service
    if curl -sf http://localhost:3002/health >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Parcel Service (port 3002) is healthy${NC}"
    else
        echo -e "${YELLOW}⚠ Parcel Service (port 3002) is not responding${NC}"
    fi
    
    # Ingestion Service
    if curl -sf http://localhost:3003/health >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Ingestion Service (port 3003) is healthy${NC}"
    else
        echo -e "${YELLOW}⚠ Ingestion Service (port 3003) is not responding${NC}"
    fi
}

# Function to check Docker containers
check_docker() {
    echo ""
    echo -e "${YELLOW}Checking Docker Containers...${NC}"
    
    if ! command_exists docker; then
        echo -e "${YELLOW}⚠ Docker not found, skipping container checks${NC}"
        return 0
    fi
    
    # Check if docker-compose is running
    if docker ps --format '{{.Names}}' | grep -q agricultural; then
        echo -e "${GREEN}✓ Docker containers are running${NC}"
        
        # List agricultural containers
        docker ps --filter "name=agricultural" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    else
        echo -e "${YELLOW}⚠ No agricultural Docker containers found${NC}"
        echo -e "  Run: docker-compose up -d"
    fi
}

# Main execution
MYSQL_OK=0
MONGODB_OK=0

check_mysql && MYSQL_OK=1 || MYSQL_OK=0
check_mongodb && MONGODB_OK=1 || MONGODB_OK=0
check_services
check_docker

# Summary
echo ""
echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   Health Check Summary${NC}"
echo -e "${BLUE}==================================================${NC}"

if [ $MYSQL_OK -eq 1 ]; then
    echo -e "${GREEN}✓ MySQL: Healthy${NC}"
else
    echo -e "${RED}✗ MySQL: Unhealthy${NC}"
fi

if [ $MONGODB_OK -eq 1 ]; then
    echo -e "${GREEN}✓ MongoDB: Healthy${NC}"
else
    echo -e "${RED}✗ MongoDB: Unhealthy${NC}"
fi

echo ""

if [ $MYSQL_OK -eq 1 ] && [ $MONGODB_OK -eq 1 ]; then
    echo -e "${GREEN}All databases are healthy!${NC}"
    exit 0
else
    echo -e "${RED}Some databases are unhealthy. See above for details.${NC}"
    echo -e "${YELLOW}Refer to DATABASE-SETUP.md for troubleshooting.${NC}"
    exit 1
fi
