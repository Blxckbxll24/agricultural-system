# 🐳 Docker Setup Guide - Sistema IoT Agrícola

Esta guía te ayudará a configurar y ejecutar el sistema completo usando Docker y Docker Compose.

## 📋 Requisitos Previos

1. **Docker Desktop** instalado y corriendo
   - Windows/Mac: [Descargar Docker Desktop](https://www.docker.com/products/docker-desktop)
   - Linux: Instalar Docker Engine y Docker Compose

2. **Recursos mínimos recomendados:**
   - RAM: 4GB disponible
   - Disco: 10GB libres
   - CPU: 2 cores

## 🚀 Inicio Rápido

### Opción 1: Script Automático (Recomendado)

\`\`\`bash
# Dar permisos de ejecución al script
chmod +x start-services.sh

# Ejecutar el script
./start-services.sh
\`\`\`

### Opción 2: Manual con Docker Compose

\`\`\`bash
# Construir y levantar todos los servicios
docker-compose up --build -d

# Ver logs en tiempo real
docker-compose logs -f

# Verificar que todos los servicios estén corriendo
docker-compose ps
\`\`\`

## 🏗️ Arquitectura de Servicios

El sistema levanta 6 contenedores:

1. **MySQL** (Puerto 3306)
   - Base de datos relacional para parcelas y usuarios
   - Auto-inicializa tablas con scripts SQL

2. **MongoDB** (Puerto 27017)
   - Base de datos NoSQL para datos de sensores
   - Series temporales optimizadas

3. **Auth Service** (Puerto 3001)
   - Microservicio de autenticación
   - JWT y control de acceso basado en roles

4. **Parcel Service** (Puerto 3002)
   - Microservicio de gestión de parcelas
   - CRUD completo con soft delete

5. **Ingestion Service** (Puerto 3003)
   - Microservicio de ingesta de datos
   - Procesamiento concurrente de sensores

6. **Frontend** (Puerto 3000)
   - Dashboard Next.js
   - Visualizaciones en tiempo real

## 🔧 Configuración

### Variables de Entorno

Las variables están pre-configuradas en `docker-compose.yml`:

**MySQL:**
- `MYSQL_ROOT_PASSWORD`: rootpassword123
- `MYSQL_DATABASE`: agricultural_system
- `MYSQL_USER`: agri_user
- `MYSQL_PASSWORD`: agri_password123

**MongoDB:**
- `MONGO_INITDB_ROOT_USERNAME`: admin
- `MONGO_INITDB_ROOT_PASSWORD`: mongopassword123

**Microservicios:**
- `JWT_SECRET`: your-super-secret-jwt-key-change-in-production
- `SENSOR_API_URL`: https://sensores-async-api.onrender.com/api/sensors/all

### Personalizar Configuración

Para cambiar las credenciales o configuración:

1. Edita `docker-compose.yml`
2. Reconstruye los servicios:
   \`\`\`bash
   docker-compose down -v
   docker-compose up --build -d
   \`\`\`

## 📊 Verificación del Sistema

### 1. Verificar Estado de Contenedores

\`\`\`bash
docker-compose ps
\`\`\`

Todos los servicios deben mostrar estado `Up` y `healthy`.

### 2. Verificar Logs

\`\`\`bash
# Todos los servicios
docker-compose logs -f

# Servicio específico
docker-compose logs -f auth-service
docker-compose logs -f parcel-service
docker-compose logs -f ingestion-service
\`\`\`

### 3. Probar Endpoints

\`\`\`bash
# Health checks
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002/health  # Parcel Service
curl http://localhost:3003/health  # Ingestion Service

# Login de prueba
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
\`\`\`

### 4. Acceder a las Bases de Datos

**MySQL:**
\`\`\`bash
docker exec -it agricultural-mysql mysql -u agri_user -p
# Password: agri_password123

# Dentro de MySQL
USE agricultural_system;
SHOW TABLES;
SELECT * FROM users;
\`\`\`

**MongoDB:**
\`\`\`bash
docker exec -it agricultural-mongodb mongosh -u admin -p
# Password: mongopassword123

# Dentro de MongoDB
use agricultural_sensors
show collections
db.sensor_readings.countDocuments()
\`\`\`

## 🛠️ Comandos Útiles

### Gestión de Servicios

\`\`\`bash
# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ borra datos)
docker-compose down -v

# Reiniciar un servicio específico
docker-compose restart auth-service

# Reconstruir un servicio
docker-compose up --build -d auth-service

# Ver uso de recursos
docker stats
\`\`\`

### Debugging

\`\`\`bash
# Entrar a un contenedor
docker exec -it auth-service sh

# Ver logs de un servicio
docker-compose logs --tail=100 -f ingestion-service

# Inspeccionar red
docker network inspect agricultural-system_agricultural-network
\`\`\`

### Limpieza

\`\`\`bash
# Limpiar contenedores detenidos
docker container prune

# Limpiar imágenes no usadas
docker image prune

# Limpiar todo (⚠️ cuidado)
docker system prune -a --volumes
\`\`\`

## 🐛 Solución de Problemas

### Problema: Puerto ya en uso

\`\`\`bash
# Encontrar proceso usando el puerto
lsof -i :3000  # o el puerto que esté ocupado

# Matar el proceso
kill -9 <PID>

# O cambiar el puerto en docker-compose.yml
\`\`\`

### Problema: Servicios no se conectan

\`\`\`bash
# Verificar red de Docker
docker network ls
docker network inspect agricultural-system_agricultural-network

# Reiniciar servicios
docker-compose restart
\`\`\`

### Problema: Base de datos no inicializa

\`\`\`bash
# Eliminar volúmenes y reiniciar
docker-compose down -v
docker-compose up --build -d

# Verificar logs de inicialización
docker-compose logs mysql
docker-compose logs mongodb
\`\`\`

### Problema: Frontend no se conecta a microservicios

1. Verifica que todos los servicios estén corriendo:
   \`\`\`bash
   docker-compose ps
   \`\`\`

2. Verifica los health checks:
   \`\`\`bash
   curl http://localhost:3001/health
   curl http://localhost:3002/health
   curl http://localhost:3003/health
   \`\`\`

3. Revisa los logs del frontend:
   \`\`\`bash
   docker-compose logs -f frontend
   \`\`\`

## 📈 Monitoreo

### Ver Métricas en Tiempo Real

\`\`\`bash
# CPU, memoria, red de todos los contenedores
docker stats

# Métricas de un contenedor específico
docker stats agricultural-mysql
\`\`\`

### Logs Estructurados

\`\`\`bash
# Últimas 100 líneas con timestamps
docker-compose logs --tail=100 -t

# Seguir logs de múltiples servicios
docker-compose logs -f auth-service parcel-service
\`\`\`

## 🔒 Seguridad

### Para Producción

1. **Cambiar todas las contraseñas** en `docker-compose.yml`
2. **Usar secrets de Docker** en lugar de variables de entorno
3. **Configurar HTTPS** con certificados SSL
4. **Limitar acceso a puertos** con firewall
5. **Actualizar JWT_SECRET** a un valor seguro

### Ejemplo con Docker Secrets

\`\`\`yaml
secrets:
  mysql_password:
    file: ./secrets/mysql_password.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt

services:
  mysql:
    secrets:
      - mysql_password
    environment:
      MYSQL_PASSWORD_FILE: /run/secrets/mysql_password
\`\`\`

## 📚 Recursos Adicionales

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Kubernetes Migration Guide](./kubernetes/README.md)

## 🎯 Próximos Pasos

Una vez que el sistema esté corriendo:

1. Abre http://localhost:3000
2. Inicia sesión con `admin` / `admin123`
3. Explora el dashboard con datos en tiempo real
4. Revisa la documentación en `DOCUMENTATION.md`
5. Para despliegue en Kubernetes, consulta `kubernetes/README.md`

---

**¿Problemas?** Abre un issue en el repositorio o consulta los logs con `docker-compose logs -f`
