# Sistema IoT Agrícola - Gestión y Monitoreo de Parcelas

Sistema integral de gestión y monitoreo de parcelas agrícolas con microservicios asincrónicos, sensores emulados, y visualización en tiempo real.

## Arquitectura del Sistema

### Microservicios

1. **Auth Service** (Puerto 3001)
   - Autenticación JWT
   - Gestión de roles (admin, operator, viewer)
   - Endpoints: `/api/auth/login`, `/api/auth/register`, `/api/auth/verify`

2. **Parcel Service** (Puerto 3002)
   - CRUD de parcelas
   - Tracking de parcelas eliminadas
   - Base de datos: MySQL

3. **Ingestion Service** (Puerto 3003)
   - Ingesta de datos de sensores
   - Procesamiento concurrente y asincrónico
   - Deduplicación de datos
   - Base de datos: MongoDB

4. **Frontend** (Puerto 3000)
   - Dashboard en tiempo real
   - Visualizaciones con gráficos
   - Mapa de parcelas activas
   - Lista de parcelas eliminadas

### Bases de Datos

- **MySQL**: Parcelas, usuarios, parcelas eliminadas
- **MongoDB**: Datos de sensores (series temporales)

## Requisitos Previos

- Node.js 20+
- Docker y Docker Compose
- Kubernetes (para producción)
- MySQL 8.0
- MongoDB 7.0

## Instalación y Configuración

### Desarrollo Local con Docker Compose

\`\`\`bash
# Clonar el repositorio
git clone <repository-url>
cd iot-agricultural-system

# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
\`\`\`

### Configuración de Bases de Datos

Los scripts SQL y MongoDB se ejecutan automáticamente al iniciar los contenedores:

- `scripts/01-create-mysql-tables.sql` - Crea tablas en MySQL
- `scripts/02-seed-mysql-data.sql` - Datos iniciales
- `scripts/03-setup-mongodb-collections.js` - Colecciones MongoDB

### Despliegue en Kubernetes

\`\`\`bash
# Crear namespace
kubectl apply -f kubernetes/namespace.yaml

# Desplegar bases de datos
kubectl apply -f kubernetes/mysql-deployment.yaml
kubectl apply -f kubernetes/mongodb-deployment.yaml

# Desplegar microservicios
kubectl apply -f kubernetes/

# Verificar estado
kubectl get pods -n agricultural-system
\`\`\`

## Usuarios por Defecto

- **Admin**: `admin` / `admin123`
- **Operator**: `operator1` / `admin123`
- **Viewer**: `viewer1` / `admin123`

## API Endpoints

### Auth Service (3001)
- POST `/api/auth/login` - Iniciar sesión
- POST `/api/auth/register` - Registrar usuario
- GET `/api/auth/verify` - Verificar token

### Parcel Service (3002)
- GET `/api/parcels` - Listar parcelas
- POST `/api/parcels` - Crear parcela
- PUT `/api/parcels/:id` - Actualizar parcela
- DELETE `/api/parcels/:id` - Eliminar parcela
- GET `/api/parcels/deleted` - Listar parcelas eliminadas

### Ingestion Service (3003)
- POST `/api/ingest/start` - Iniciar ingesta
- GET `/api/sensors/latest` - Últimas lecturas
- GET `/api/sensors/history` - Historial

## CI/CD Pipeline

El pipeline incluye:

1. **Test**: Linting, type checking, tests unitarios
2. **Build**: Construcción de imágenes Docker
3. **Deploy Test**: Despliegue automático a ambiente de pruebas
4. **Deploy Production**: Despliegue Blue-Green a producción

## Monitoreo

- Logs centralizados con kubectl logs
- Métricas de rendimiento
- Alertas configurables

## Tecnologías Utilizadas

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS, Recharts, Leaflet
- **Backend**: Node.js, Express, JWT
- **Bases de Datos**: MySQL, MongoDB
- **Infraestructura**: Docker, Kubernetes
- **CI/CD**: GitHub Actions

## Licencia

MIT
