#!/bin/bash

# Development Environment Validation Script
# Validates that all required tools and configurations are in place

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   Development Environment Validation${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""

ERRORS=0
WARNINGS=0

# Function to check if a command exists
check_command() {
    local cmd=$1
    local required=$2
    local min_version=$3
    
    if command -v "$cmd" >/dev/null 2>&1; then
        local version=$(eval "$cmd --version 2>&1" | head -n1 || echo "unknown")
        echo -e "${GREEN}✓ $cmd is installed${NC}"
        echo -e "  Version: $version"
        return 0
    else
        if [ "$required" = "required" ]; then
            echo -e "${RED}✗ $cmd is NOT installed (required)${NC}"
            ERRORS=$((ERRORS + 1))
        else
            echo -e "${YELLOW}⚠ $cmd is NOT installed (optional)${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
        return 1
    fi
}

# Function to check Node.js version
check_node_version() {
    if command -v node >/dev/null 2>&1; then
        local version=$(node --version | sed 's/v//')
        local major=$(echo "$version" | cut -d. -f1)
        
        if [ "$major" -ge 18 ]; then
            echo -e "${GREEN}✓ Node.js version is sufficient (${version})${NC}"
            return 0
        else
            echo -e "${RED}✗ Node.js version ${version} is too old. Requires v18+${NC}"
            ERRORS=$((ERRORS + 1))
            return 1
        fi
    fi
}

# Function to check for .env files
check_env_files() {
    echo ""
    echo -e "${YELLOW}Checking environment configuration files...${NC}"
    
    local services=("auth-service" "parcel-service" "ingestion-service")
    local missing_count=0
    
    for service in "${services[@]}"; do
        local env_file="services/$service/.env"
        local example_file="services/$service/.env.example"
        
        if [ -f "$env_file" ]; then
            echo -e "${GREEN}✓ $env_file exists${NC}"
        else
            if [ -f "$example_file" ]; then
                echo -e "${YELLOW}⚠ $env_file missing (example file available)${NC}"
                echo -e "  Run: cp $example_file $env_file"
                WARNINGS=$((WARNINGS + 1))
            else
                echo -e "${RED}✗ $env_file and example missing${NC}"
                ERRORS=$((ERRORS + 1))
            fi
            missing_count=$((missing_count + 1))
        fi
    done
    
    if [ $missing_count -eq 0 ]; then
        echo -e "${GREEN}✓ All service .env files are configured${NC}"
    fi
}

# Function to check package.json and dependencies
check_dependencies() {
    echo ""
    echo -e "${YELLOW}Checking project dependencies...${NC}"
    
    if [ -f "package.json" ]; then
        echo -e "${GREEN}✓ Root package.json exists${NC}"
        
        if [ -d "node_modules" ]; then
            echo -e "${GREEN}✓ Root node_modules exists${NC}"
        else
            echo -e "${YELLOW}⚠ Root node_modules missing${NC}"
            echo -e "  Run: npm install"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo -e "${RED}✗ Root package.json missing${NC}"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Check service dependencies
    local services=("auth-service" "parcel-service" "ingestion-service")
    for service in "${services[@]}"; do
        if [ -f "services/$service/package.json" ]; then
            echo -e "${GREEN}✓ services/$service/package.json exists${NC}"
            
            if [ -d "services/$service/node_modules" ]; then
                echo -e "${GREEN}✓ services/$service/node_modules exists${NC}"
            else
                echo -e "${YELLOW}⚠ services/$service/node_modules missing${NC}"
                echo -e "  Run: cd services/$service && npm install"
                WARNINGS=$((WARNINGS + 1))
            fi
        fi
    done
}

# Function to check database availability
check_databases() {
    echo ""
    echo -e "${YELLOW}Checking database availability...${NC}"
    
    # Check MySQL
    if command -v nc >/dev/null 2>&1; then
        if nc -z localhost 3306 2>/dev/null; then
            echo -e "${GREEN}✓ MySQL port (3306) is accessible${NC}"
        else
            echo -e "${YELLOW}⚠ MySQL port (3306) is not accessible${NC}"
            echo -e "  Start MySQL or run: docker-compose up -d mysql"
            WARNINGS=$((WARNINGS + 1))
        fi
        
        # Check MongoDB
        if nc -z localhost 27017 2>/dev/null; then
            echo -e "${GREEN}✓ MongoDB port (27017) is accessible${NC}"
        else
            echo -e "${YELLOW}⚠ MongoDB port (27017) is not accessible${NC}"
            echo -e "  Start MongoDB or run: docker-compose up -d mongodb"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo -e "${YELLOW}⚠ nc (netcat) not available, skipping port checks${NC}"
    fi
}

# Function to check Docker setup
check_docker_setup() {
    echo ""
    echo -e "${YELLOW}Checking Docker setup...${NC}"
    
    if command -v docker >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Docker is installed${NC}"
        
        if docker info >/dev/null 2>&1; then
            echo -e "${GREEN}✓ Docker daemon is running${NC}"
            
            if [ -f "docker-compose.yml" ]; then
                echo -e "${GREEN}✓ docker-compose.yml exists${NC}"
                
                # Check if containers are running
                if docker ps --format '{{.Names}}' | grep -q agricultural; then
                    echo -e "${GREEN}✓ Docker containers are running${NC}"
                else
                    echo -e "${YELLOW}⚠ Docker containers are not running${NC}"
                    echo -e "  Run: docker-compose up -d"
                    WARNINGS=$((WARNINGS + 1))
                fi
            else
                echo -e "${RED}✗ docker-compose.yml missing${NC}"
                ERRORS=$((ERRORS + 1))
            fi
        else
            echo -e "${RED}✗ Docker daemon is not running${NC}"
            echo -e "  Start Docker Desktop or Docker daemon"
            ERRORS=$((ERRORS + 1))
        fi
    else
        echo -e "${YELLOW}⚠ Docker is not installed (optional for local development)${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
}

# Function to check ports availability
check_ports() {
    echo ""
    echo -e "${YELLOW}Checking port availability...${NC}"
    
    if command -v lsof >/dev/null 2>&1; then
        local ports=(3000 3001 3002 3003 3306 27017)
        for port in "${ports[@]}"; do
            if lsof -i ":$port" >/dev/null 2>&1; then
                echo -e "${YELLOW}⚠ Port $port is in use${NC}"
            else
                echo -e "${GREEN}✓ Port $port is available${NC}"
            fi
        done
    elif command -v netstat >/dev/null 2>&1; then
        local ports=(3000 3001 3002 3003 3306 27017)
        for port in "${ports[@]}"; do
            if netstat -an | grep ":$port" | grep LISTEN >/dev/null 2>&1; then
                echo -e "${YELLOW}⚠ Port $port is in use${NC}"
            else
                echo -e "${GREEN}✓ Port $port is available${NC}"
            fi
        done
    else
        echo -e "${YELLOW}⚠ lsof and netstat not available, skipping port checks${NC}"
    fi
}

# Main checks
echo -e "${YELLOW}1. Checking required tools...${NC}"
check_command "node" "required"
check_node_version
check_command "npm" "required"
check_command "git" "required"

echo ""
echo -e "${YELLOW}2. Checking optional development tools...${NC}"
check_command "docker" "optional"
check_command "docker-compose" "optional"
check_command "mysql" "optional"
check_command "mongosh" "optional"
check_command "curl" "optional"
check_command "nc" "optional"

check_env_files
check_dependencies
check_docker_setup
check_databases
check_ports

# Summary
echo ""
echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   Validation Summary${NC}"
echo -e "${BLUE}==================================================${NC}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ Environment is fully configured!${NC}"
    echo ""
    echo -e "${GREEN}You can now:${NC}"
    echo -e "  1. Start development: ${BLUE}npm run dev${NC}"
    echo -e "  2. Start with Docker: ${BLUE}docker-compose up -d${NC}"
    echo -e "  3. Run services: ${BLUE}./start-services.sh${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ Environment is configured with $WARNINGS warning(s)${NC}"
    echo -e "  Review warnings above for optional improvements"
    echo ""
    echo -e "${GREEN}You can proceed with:${NC}"
    echo -e "  1. Start development: ${BLUE}npm run dev${NC}"
    echo -e "  2. Start with Docker: ${BLUE}docker-compose up -d${NC}"
    exit 0
else
    echo -e "${RED}✗ Environment has $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    echo -e "  Fix the errors above before proceeding"
    echo ""
    echo -e "${YELLOW}Quick fixes:${NC}"
    echo -e "  • Install Node.js 18+: ${BLUE}https://nodejs.org/${NC}"
    echo -e "  • Install dependencies: ${BLUE}npm install${NC}"
    echo -e "  • Copy .env files: ${BLUE}cp services/*/\.env.example services/*/.env${NC}"
    echo -e "  • Start databases: ${BLUE}docker-compose up -d mysql mongodb${NC}"
    echo ""
    echo -e "For detailed setup instructions, see: ${BLUE}DATABASE-SETUP.md${NC}"
    exit 1
fi
