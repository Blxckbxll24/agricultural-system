# IoT Agricultural Monitoring System - Complete Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Services](#services)
5. [Frontend Application](#frontend-application)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [Deployment](#deployment)
9. [Development Setup](#development-setup)
10. [Environment Variables](#environment-variables)
11. [Security](#security)
12. [Monitoring & Maintenance](#monitoring--maintenance)

---

## System Overview

The IoT Agricultural Monitoring System is a comprehensive full-stack application designed to monitor and manage agricultural parcels using IoT sensors. The system provides real-time data visualization, historical analysis, and parcel management capabilities.

### Key Features
- **Real-time Sensor Monitoring**: Track temperature, humidity, rainfall, and solar radiation
- **Parcel Management**: Create, update, and manage agricultural parcels with geolocation
- **Interactive Maps**: Visualize parcel locations using Leaflet maps
- **Historical Data Analysis**: View trends and patterns through interactive charts
- **User Authentication**: Secure JWT-based authentication system
- **Responsive Dashboard**: Mobile-first design with dark theme
- **Microservices Architecture**: Scalable and maintainable service-oriented design

---

## Architecture

### System Architecture Diagram

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 15)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Dashboard   │  │   Parcels    │  │    Login     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST
                              │
┌─────────────────────────────┼─────────────────────────────┐
│                             │                              │
│  ┌──────────────────────────┼──────────────────────────┐  │
│  │              API Gateway / Load Balancer             │  │
│  └──────────────────────────┬──────────────────────────┘  │
│                             │                              │
│  ┌──────────────┬───────────┼───────────┬──────────────┐  │
│  │              │            │           │              │  │
│  ▼              ▼            ▼           ▼              │  │
│ ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐        │  │
│ │  Auth  │  │ Parcel │  │Ingestion│ │ Future │        │  │
│ │Service │  │Service │  │ Service │ │Services│        │  │
│ │:3001   │  │:3002   │  │  :3003  │ │        │        │  │
│ └────────┘  └────────┘  └────────┘  └────────┘        │  │
│     │           │            │                          │  │
│     │           │            │                          │  │
│  ┌──┼───────────┼────────────┼──────────────────────┐  │  │
│  │  │           │            │                       │  │  │
│  │  ▼           ▼            ▼                       │  │  │
│  │ ┌─────────────────┐  ┌──────────────────┐       │  │  │
│  │ │  MySQL Database │  │ MongoDB Database │       │  │  │
│  │ │   (Relational)  │  │  (Time-Series)   │       │  │  │
│  │ └─────────────────┘  └──────────────────┘       │  │  │
│  │                                                   │  │  │
│  └───────────────────────────────────────────────────┘  │  │
│                    Data Layer                            │  │
└──────────────────────────────────────────────────────────┘
\`\`\`

### Architecture Principles

1. **Microservices**: Each service handles a specific domain (auth, parcels, sensor data)
2. **Database Separation**: MySQL for relational data, MongoDB for time-series sensor data
3. **Stateless Services**: All services are stateless for horizontal scalability
4. **JWT Authentication**: Token-based authentication for secure API access
5. **Container-Ready**: All services are containerized with Docker
6. **Kubernetes-Ready**: Deployment manifests for orchestration

---

## Technology Stack

### Frontend
- **Framework**: Next.js 15.5.4 (App Router)
- **React**: 19.1.0
- **UI Library**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts 2.15.4
- **Maps**: Leaflet (via dynamic import)
- **Forms**: React Hook Form + Zod validation
- **State Management**: React hooks + SWR (implicit)
- **Theme**: next-themes for dark mode support

### Backend Services
- **Runtime**: Node.js with Express 5.1.0
- **Language**: TypeScript 5.x
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Password Hashing**: bcryptjs 3.0.2
- **Validation**: express-validator 7.2.1
- **Security**: helmet 8.1.0, cors 2.8.5
- **Rate Limiting**: express-rate-limit 8.1.0

### Databases
- **MySQL**: 8.0+ (Relational data)
- **MongoDB**: 6.x+ (Time-series sensor data)

### DevOps
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions
- **Package Manager**: pnpm

---

## Services

### 1. Auth Service (Port 3001)

**Purpose**: Handles user authentication and authorization

**Responsibilities**:
- User registration and login
- JWT token generation and validation
- Password hashing and verification
- Token refresh mechanisms

**Technology**:
- Express.js server
- MySQL database for user storage
- bcryptjs for password hashing
- JWT for token management

**Key Files**:
\`\`\`
services/auth-service/
├── src/
│   ├── controllers/auth.controller.ts    # Auth logic
│   ├── routes/auth.routes.ts             # API routes
│   ├── middleware/auth.middleware.ts     # JWT validation
│   ├── middleware/rate-limit.middleware.ts # Rate limiting
│   ├── config/database.ts                # MySQL connection
│   └── index.ts                          # Server entry point
├── Dockerfile
└── package.json
\`\`\`

**Database Tables**:
- `users`: Stores user credentials and profile information

---

### 2. Parcel Service (Port 3002)

**Purpose**: Manages agricultural parcel data

**Responsibilities**:
- CRUD operations for parcels
- Parcel status management (active/inactive/deleted)
- Geolocation data handling
- Crop type tracking
- Statistics and analytics

**Technology**:
- Express.js server
- MySQL database for parcel storage
- JWT authentication middleware

**Key Files**:
\`\`\`
services/parcel-service/
├── src/
│   ├── controllers/parcel.controller.ts  # Parcel logic
│   ├── routes/parcel.routes.ts           # API routes
│   ├── middleware/auth.middleware.ts     # JWT validation
│   ├── config/database.ts                # MySQL connection
│   └── index.ts                          # Server entry point
├── Dockerfile
└── package.json
\`\`\`

**Database Tables**:
- `parcels`: Stores parcel information including location, crop type, and status

---

### 3. Ingestion Service (Port 3003)

**Purpose**: Handles IoT sensor data ingestion and retrieval

**Responsibilities**:
- Receive sensor readings from IoT devices
- Store time-series data in MongoDB
- Provide current and historical sensor data
- Support multiple sensor types (temperature, humidity, rain, solar radiation)
- Data aggregation and querying

**Technology**:
- Express.js server
- MongoDB for time-series data
- Efficient querying with indexes

**Key Files**:
\`\`\`
services/ingestion-service/
├── src/
│   ├── controllers/ingestion.controller.ts  # Data ingestion
│   ├── controllers/sensor.controller.ts     # Data retrieval
│   ├── routes/ingestion.routes.ts           # Ingestion routes
│   ├── routes/sensor.routes.ts              # Query routes
│   ├── config/database.ts                   # MongoDB connection
│   └── index.ts                             # Server entry point
├── Dockerfile
└── package.json
\`\`\`

**MongoDB Collections**:
- `sensor_readings`: Time-series sensor data with indexes on timestamp and sensor_type

---

## Frontend Application

### Application Structure

\`\`\`
app/
├── dashboard/
│   └── page.tsx              # Main dashboard page
├── parcels/
│   └── page.tsx              # Parcel management page
├── login/
│   └── page.tsx              # Login page
├── layout.tsx                # Root layout
├── globals.css               # Global styles
└── page.tsx                  # Root redirect

components/
├── dashboard/
│   ├── dashboard-header.tsx  # Dashboard navigation
│   ├── metrics-grid.tsx      # Real-time metrics cards
│   ├── sensor-charts.tsx     # Historical charts
│   ├── parcel-map.tsx        # Leaflet map wrapper
│   └── crop-distribution.tsx # Pie chart
├── parcels/
│   ├── parcel-list.tsx       # Active parcels table
│   └── deleted-parcel-list.tsx # Deleted parcels
├── auth/
│   └── login-form.tsx        # Login form component
├── map/
│   └── leaflet-map.tsx       # Leaflet map implementation
└── ui/                       # shadcn/ui components
\`\`\`

### Key Pages

#### Dashboard (`/dashboard`)
- **Metrics Grid**: Displays average temperature, humidity, rainfall, and solar radiation
- **Sensor Charts**: Line chart for temperature, bar chart for humidity
- **Crop Distribution**: Pie chart showing parcel distribution by crop type
- **Parcel Map**: Interactive map with markers for each active parcel

**Data Flow**:
1. Fetches current sensor readings from Ingestion Service
2. Fetches historical data for charts
3. Fetches parcel data from Parcel Service
4. Updates every 10-30 seconds

#### Parcels Page (`/parcels`)
- **Active Parcels Table**: List of all active parcels with actions
- **Deleted Parcels Table**: Soft-deleted parcels with restore option
- **Create/Edit Forms**: Modal dialogs for parcel management

**Features**:
- Create new parcels with geolocation
- Edit existing parcels
- Soft delete (mark as deleted)
- Restore deleted parcels
- Permanent deletion

#### Login Page (`/login`)
- Email and password authentication
- JWT token storage in localStorage
- Redirect to dashboard on success

---

## Database Schema

### MySQL Schema

#### Users Table
\`\`\`sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);
\`\`\`

#### Parcels Table
\`\`\`sql
CREATE TABLE parcels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  area DECIMAL(10, 2),
  crop_type VARCHAR(100),
  status ENUM('active', 'inactive', 'deleted') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
);
\`\`\`

### MongoDB Schema

#### Sensor Readings Collection
\`\`\`javascript
{
  _id: ObjectId,
  parcel_id: Number,           // References MySQL parcels.id
  sensor_type: String,         // 'temperature', 'humidity', 'rain', 'solar_radiation'
  value: Number,               // Sensor reading value
  unit: String,                // 'celsius', 'percent', 'mm', 'w/m2'
  timestamp: Date,             // Reading timestamp
  metadata: {                  // Optional metadata
    device_id: String,
    battery_level: Number,
    signal_strength: Number
  }
}

// Indexes
db.sensor_readings.createIndex({ parcel_id: 1, timestamp: -1 })
db.sensor_readings.createIndex({ sensor_type: 1, timestamp: -1 })
db.sensor_readings.createIndex({ timestamp: -1 })
\`\`\`

---

## API Endpoints

### Auth Service (http://localhost:3001)

#### POST `/api/auth/register`
Register a new user

**Request Body**:
\`\`\`json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
\`\`\`

**Response**:
\`\`\`json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
\`\`\`

#### POST `/api/auth/login`
Authenticate user and receive JWT token

**Request Body**:
\`\`\`json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
\`\`\`

**Response**:
\`\`\`json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
\`\`\`

---

### Parcel Service (http://localhost:3002)

All endpoints require `Authorization: Bearer <token>` header

#### GET `/api/parcels`
Get all parcels for authenticated user

**Query Parameters**:
- `status` (optional): Filter by status (active, inactive, deleted)

**Response**:
\`\`\`json
{
  "parcels": [
    {
      "id": 1,
      "name": "Parcela Norte",
      "location": "Sector A",
      "latitude": -33.4489,
      "longitude": -70.6693,
      "area": 5.5,
      "crop_type": "Maíz",
      "status": "active",
      "created_at": "2025-01-15T10:00:00Z"
    }
  ]
}
\`\`\`

#### POST `/api/parcels`
Create a new parcel

**Request Body**:
\`\`\`json
{
  "name": "Parcela Sur",
  "location": "Sector B",
  "latitude": -33.4500,
  "longitude": -70.6700,
  "area": 3.2,
  "crop_type": "Trigo"
}
\`\`\`

#### PUT `/api/parcels/:id`
Update an existing parcel

**Request Body**: Same as POST (all fields optional)

#### DELETE `/api/parcels/:id`
Soft delete a parcel (sets status to 'deleted')

#### POST `/api/parcels/:id/restore`
Restore a soft-deleted parcel

#### DELETE `/api/parcels/:id/permanent`
Permanently delete a parcel from database

#### GET `/api/parcels/statistics`
Get parcel statistics

**Response**:
\`\`\`json
{
  "total_parcels": 10,
  "active_parcels": 8,
  "inactive_parcels": 1,
  "deleted_parcels": 1,
  "crop_distribution": [
    { "crop_type": "Maíz", "count": 4 },
    { "crop_type": "Trigo", "count": 3 },
    { "crop_type": "Soja", "count": 1 }
  ]
}
\`\`\`

---

### Ingestion Service (http://localhost:3003)

#### POST `/api/ingest`
Ingest sensor data (typically called by IoT devices)

**Request Body**:
\`\`\`json
{
  "parcel_id": 1,
  "sensor_type": "temperature",
  "value": 25.5,
  "unit": "celsius",
  "timestamp": "2025-10-15T14:30:00Z"
}
\`\`\`

#### GET `/api/sensors/current`
Get most recent readings for all sensors

**Response**:
\`\`\`json
{
  "current_readings": [
    {
      "parcel_id": 1,
      "sensor_type": "temperature",
      "value": 25.5,
      "unit": "celsius",
      "timestamp": "2025-10-15T14:30:00Z"
    }
  ]
}
\`\`\`

#### GET `/api/sensors/history`
Get historical sensor data

**Query Parameters**:
- `sensor_type` (required): Type of sensor
- `parcel_id` (optional): Filter by parcel
- `limit` (optional): Number of records (default: 100)
- `start_date` (optional): Start date for range
- `end_date` (optional): End date for range

**Response**:
\`\`\`json
{
  "readings": [
    {
      "parcel_id": 1,
      "sensor_type": "temperature",
      "value": 25.5,
      "unit": "celsius",
      "timestamp": "2025-10-15T14:30:00Z"
    }
  ],
  "count": 50
}
\`\`\`

---

## Deployment

### Docker Deployment

#### Build All Services
\`\`\`bash
# Build frontend
docker build -t iot-frontend .

# Build auth service
docker build -t iot-auth-service ./services/auth-service

# Build parcel service
docker build -t iot-parcel-service ./services/parcel-service

# Build ingestion service
docker build -t iot-ingestion-service ./services/ingestion-service
\`\`\`

#### Docker Compose
\`\`\`bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
\`\`\`

The `docker-compose.yml` includes:
- MySQL database
- MongoDB database
- All three backend services
- Frontend application
- Network configuration
- Volume persistence

---

### Kubernetes Deployment

#### Prerequisites
- Kubernetes cluster (minikube, GKE, EKS, AKS)
- kubectl configured
- Docker images pushed to registry

#### Deploy to Kubernetes
\`\`\`bash
# Create namespace
kubectl apply -f kubernetes/namespace.yaml

# Deploy databases
kubectl apply -f kubernetes/mysql-deployment.yaml
kubectl apply -f kubernetes/mongodb-deployment.yaml

# Deploy services
kubectl apply -f kubernetes/auth-service-deployment.yaml
kubectl apply -f kubernetes/parcel-service-deployment.yaml
kubectl apply -f kubernetes/ingestion-service-deployment.yaml

# Check status
kubectl get pods -n iot-agriculture
kubectl get services -n iot-agriculture
\`\`\`

#### Kubernetes Resources
Each service deployment includes:
- **Deployment**: Pod specification with replicas
- **Service**: ClusterIP or LoadBalancer
- **ConfigMap**: Environment variables
- **Secret**: Sensitive data (passwords, tokens)
- **PersistentVolumeClaim**: Database storage

---

### CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci-cd.yml`) automates:

1. **Build Stage**:
   - Install dependencies
   - Run TypeScript compilation
   - Build Docker images

2. **Test Stage**:
   - Run unit tests
   - Run integration tests
   - Code quality checks

3. **Deploy Stage**:
   - Push images to registry
   - Deploy to Kubernetes
   - Run smoke tests

**Trigger**: Push to `main` branch or pull request

---

## Development Setup

### Prerequisites
- Node.js 18+ and pnpm
- MySQL 8.0+
- MongoDB 6.0+
- Docker (optional)

### Local Development

#### 1. Clone Repository
\`\`\`bash
git clone <repository-url>
cd iot-agricultural-system
\`\`\`

#### 2. Install Dependencies
\`\`\`bash
# Install frontend dependencies
pnpm install

# Install service dependencies
cd services/auth-service && pnpm install && cd ../..
cd services/parcel-service && pnpm install && cd ../..
cd services/ingestion-service && pnpm install && cd ../..
\`\`\`

#### 3. Setup Databases

**MySQL**:
\`\`\`bash
# Create database
mysql -u root -p
CREATE DATABASE iot_agriculture;

# Run migrations
mysql -u root -p iot_agriculture < scripts/01-create-mysql-tables.sql
mysql -u root -p iot_agriculture < scripts/02-seed-mysql-data.sql
\`\`\`

**MongoDB**:
\`\`\`bash
# Start MongoDB
mongod

# Setup collections
mongosh < scripts/03-setup-mongodb-collections.js
\`\`\`

#### 4. Configure Environment Variables

Create `.env` files in each service directory (see [Environment Variables](#environment-variables))

#### 5. Start Services

**Terminal 1 - Auth Service**:
\`\`\`bash
cd services/auth-service
pnpm dev
\`\`\`

**Terminal 2 - Parcel Service**:
\`\`\`bash
cd services/parcel-service
pnpm dev
\`\`\`

**Terminal 3 - Ingestion Service**:
\`\`\`bash
cd services/ingestion-service
pnpm dev
\`\`\`

**Terminal 4 - Frontend**:
\`\`\`bash
pnpm dev
\`\`\`

#### 6. Access Application
- Frontend: http://localhost:3000
- Auth Service: http://localhost:3001
- Parcel Service: http://localhost:3002
- Ingestion Service: http://localhost:3003

---

## Environment Variables

### Frontend (.env.local)
\`\`\`env
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3001
NEXT_PUBLIC_PARCEL_SERVICE_URL=http://localhost:3002
NEXT_PUBLIC_INGESTION_SERVICE_URL=http://localhost:3003
\`\`\`

### Auth Service (.env)
\`\`\`env
PORT=3001
NODE_ENV=development

# MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=iot_agriculture

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:3000
\`\`\`

### Parcel Service (.env)
\`\`\`env
PORT=3002
NODE_ENV=development

# MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=iot_agriculture

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# CORS
CORS_ORIGIN=http://localhost:3000
\`\`\`

### Ingestion Service (.env)
\`\`\`env
PORT=3003
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/iot_agriculture

# CORS
CORS_ORIGIN=http://localhost:3000
\`\`\`

---

## Security

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication with configurable expiration
- **Password Hashing**: bcrypt with salt rounds for secure password storage
- **Token Validation**: Middleware validates JWT on protected routes
- **Role-Based Access**: User roles (admin, user) for authorization

### API Security
- **CORS**: Configured to allow only trusted origins
- **Helmet**: Security headers to prevent common attacks
- **Rate Limiting**: Prevents brute force and DDoS attacks
- **Input Validation**: express-validator sanitizes and validates inputs
- **SQL Injection Prevention**: Parameterized queries with mysql2
- **NoSQL Injection Prevention**: MongoDB sanitization

### Best Practices
1. **Environment Variables**: Never commit secrets to version control
2. **HTTPS**: Use TLS/SSL in production
3. **Database Credentials**: Rotate regularly
4. **JWT Secret**: Use strong, random secrets
5. **Error Handling**: Don't expose sensitive information in errors
6. **Logging**: Log security events without exposing sensitive data

---

## Monitoring & Maintenance

### Health Checks
Each service should implement health check endpoints:

\`\`\`typescript
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() })
})
\`\`\`

### Logging
- **Development**: Console logging with detailed information
- **Production**: Structured logging to files or logging service
- **Log Levels**: ERROR, WARN, INFO, DEBUG

### Database Maintenance

**MySQL**:
\`\`\`sql
-- Optimize tables
OPTIMIZE TABLE users, parcels;

-- Check table status
SHOW TABLE STATUS;

-- Backup
mysqldump -u root -p iot_agriculture > backup.sql
\`\`\`

**MongoDB**:
\`\`\`javascript
// Compact collections
db.sensor_readings.compact()

// Check collection stats
db.sensor_readings.stats()

// Backup
mongodump --db iot_agriculture --out /backup
\`\`\`

### Performance Optimization
1. **Database Indexes**: Ensure proper indexes on frequently queried fields
2. **Connection Pooling**: Reuse database connections
3. **Caching**: Implement Redis for frequently accessed data
4. **Query Optimization**: Use EXPLAIN to analyze slow queries
5. **Load Balancing**: Distribute traffic across service instances

### Monitoring Tools
- **Application Monitoring**: New Relic, Datadog, or Prometheus
- **Database Monitoring**: MySQL Workbench, MongoDB Compass
- **Log Aggregation**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Uptime Monitoring**: Pingdom, UptimeRobot

---

## Troubleshooting

### Common Issues

#### Frontend can't connect to services
- Check that all services are running
- Verify environment variables are set correctly
- Check CORS configuration in services
- Ensure ports are not blocked by firewall

#### Database connection errors
- Verify database is running
- Check credentials in .env files
- Ensure database exists and tables are created
- Check network connectivity

#### JWT authentication fails
- Verify JWT_SECRET matches across services
- Check token expiration
- Ensure Authorization header is properly formatted
- Verify token is stored in localStorage

#### Sensor data not displaying
- Check Ingestion Service is running
- Verify MongoDB connection
- Ensure sensor data exists in database
- Check browser console for errors

---

## Future Enhancements

### Planned Features
1. **Real-time Notifications**: WebSocket support for instant alerts
2. **Advanced Analytics**: Machine learning for crop predictions
3. **Mobile App**: React Native application
4. **Weather Integration**: External weather API integration
5. **Irrigation Control**: Automated irrigation based on sensor data
6. **Multi-tenancy**: Support for multiple organizations
7. **Reporting**: PDF/Excel export of historical data
8. **Alerts System**: Configurable thresholds and notifications

### Scalability Improvements
1. **Message Queue**: RabbitMQ or Kafka for sensor data ingestion
2. **Caching Layer**: Redis for frequently accessed data
3. **CDN**: CloudFront or Cloudflare for static assets
4. **Database Sharding**: Horizontal scaling for large datasets
5. **Service Mesh**: Istio for advanced traffic management

---

## Contributing

### Development Workflow
1. Create feature branch from `main`
2. Implement changes with tests
3. Run linting and tests locally
4. Submit pull request
5. Code review and approval
6. Merge to main

### Code Standards
- **TypeScript**: Strict mode enabled
- **Linting**: ESLint with recommended rules
- **Formatting**: Prettier for consistent code style
- **Commits**: Conventional commits format
- **Testing**: Unit tests for business logic

---

## License

This project is proprietary software. All rights reserved.

---

## Support

For technical support or questions:
- **Email**: support@iot-agriculture.com
- **Documentation**: https://docs.iot-agriculture.com
- **Issue Tracker**: GitHub Issues

---

## Changelog

### Version 1.0.0 (Current)
- Initial release
- Dashboard with real-time metrics
- Parcel management system
- Sensor data ingestion
- User authentication
- Docker and Kubernetes deployment

---

**Last Updated**: October 15, 2025
**Version**: 1.0.0
**Maintained By**: Development Team
