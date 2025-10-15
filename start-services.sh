#!/bin/bash

echo "🚀 Starting IoT Agricultural System with Docker Compose"
echo "=================================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: docker-compose is not installed."
    exit 1
fi

echo ""
echo "📦 Building and starting all services..."
echo ""

# Start all services with docker-compose
docker-compose up --build -d

echo ""
echo "⏳ Waiting for services to be healthy..."
echo ""

# Wait for MySQL to be ready
echo "Waiting for MySQL..."
until docker exec agricultural-mysql mysqladmin ping -h localhost --silent; do
    printf '.'
    sleep 2
done
echo " ✅ MySQL is ready"

# Wait for MongoDB to be ready
echo "Waiting for MongoDB..."
until docker exec agricultural-mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
    printf '.'
    sleep 2
done
echo " ✅ MongoDB is ready"

# Wait for services to start
echo "Waiting for microservices to start..."
sleep 10

echo ""
echo "✅ All services are running!"
echo ""
echo "=================================================="
echo "📊 Service URLs:"
echo "=================================================="
echo "Frontend:           http://localhost:3000"
echo "Auth Service:       http://localhost:3001"
echo "Parcel Service:     http://localhost:3002"
echo "Ingestion Service:  http://localhost:3003"
echo ""
echo "=================================================="
echo "🗄️  Database Connections:"
echo "=================================================="
echo "MySQL:    localhost:3306"
echo "  User:   agri_user"
echo "  Pass:   agri_password123"
echo "  DB:     agricultural_system"
echo ""
echo "MongoDB:  localhost:27017"
echo "  User:   admin"
echo "  Pass:   mongopassword123"
echo "  DB:     agricultural_sensors"
echo ""
echo "=================================================="
echo "📝 Useful Commands:"
echo "=================================================="
echo "View logs:          docker-compose logs -f"
echo "Stop services:      docker-compose down"
echo "Restart services:   docker-compose restart"
echo "View status:        docker-compose ps"
echo ""
echo "🎉 System is ready! Open http://localhost:3000 in your browser"
