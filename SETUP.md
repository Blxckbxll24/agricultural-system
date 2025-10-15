# Guía de Instalación y Ejecución

## Sistema de Monitoreo Agrícola IoT

Esta guía te ayudará a poner en marcha la aplicación en tu máquina local sin necesidad de Docker, Kubernetes, MySQL o MongoDB.

---

## Requisitos Previos

- **Node.js** 18.x o superior
- **npm** o **yarn**
- **Git**

---

## Instalación Rápida

### 1. Clonar el Repositorio

\`\`\`bash
git clone <tu-repositorio-url>
cd agricultural-system
\`\`\`

### 2. Instalar Dependencias

\`\`\`bash
npm install
\`\`\`

### 3. Ejecutar la Aplicación

\`\`\`bash
npm run dev
\`\`\`

La aplicación estará disponible en: **http://localhost:3000**

---

## Credenciales de Acceso

### Usuario Administrador
- **Usuario:** `admin`
- **Contraseña:** `admin123`

### Usuario Operador
- **Usuario:** `operator`
- **Contraseña:** `operator123`

---

## Estructura del Proyecto

\`\`\`
agricultural-system/
├── app/
│   ├── api/                    # API Routes de Next.js
│   │   ├── auth/              # Autenticación (login, verify)
│   │   ├── parcels/           # Gestión de parcelas (CRUD)
│   │   └── sensors/           # Datos de sensores (current, history, stats)
│   ├── dashboard/             # Página del dashboard principal
│   ├── login/                 # Página de inicio de sesión
│   └── parcels/               # Página de gestión de parcelas
├── components/
│   ├── auth/                  # Componentes de autenticación
│   ├── dashboard/             # Componentes del dashboard
│   │   ├── metrics-grid.tsx   # Métricas en tiempo real
│   │   ├── sensor-charts.tsx  # Gráficos de temperatura y humedad
│   │   ├── parcel-map.tsx     # Mapa de parcelas con Leaflet
│   │   └── crop-distribution.tsx # Gráfico de pie de cultivos
│   ├── parcels/               # Componentes de parcelas
│   └── map/                   # Componente de mapa Leaflet
└── services/                  # Microservicios (para referencia/Docker)
\`\`\`

---

## Funcionalidades Principales

### 1. Dashboard en Tiempo Real
- **Métricas actuales:** Temperatura, humedad, precipitación, radiación solar
- **Gráficos históricos:** 
  - Línea para temperatura (últimas 20 lecturas)
  - Barras para humedad (últimas 20 lecturas)
- **Distribución de cultivos:** Gráfico de pie mostrando tipos de cultivo
- **Mapa interactivo:** Ubicación de parcelas activas con Leaflet.js

### 2. Gestión de Parcelas
- **CRUD completo:** Crear, leer, actualizar, eliminar parcelas
- **Soft delete:** Las parcelas eliminadas se guardan en historial
- **Filtros:** Por estado y tipo de cultivo
- **Estadísticas:** Total de parcelas, área total, distribución

### 3. Autenticación
- **JWT tokens:** Autenticación segura con tokens
- **Roles:** Admin y Operador
- **Sesión persistente:** LocalStorage para mantener sesión

### 4. Integración con API Externa
- **API de sensores:** Integración con `https://sensores-async-api.onrender.com/api/sensors/all`
- **Fallback:** Datos mock si la API externa no está disponible
- **Actualización automática:** Cada 10 segundos para métricas, 30 segundos para gráficos

---

## API Endpoints

### Autenticación

#### POST `/api/auth/login`
Iniciar sesión

**Request:**
\`\`\`json
{
  "username": "admin",
  "password": "admin123"
}
\`\`\`

**Response:**
\`\`\`json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@agricultural.com",
    "role": "admin"
  }
}
\`\`\`

#### GET `/api/auth/verify`
Verificar token

**Headers:**
\`\`\`
Authorization: Bearer <token>
\`\`\`

### Parcelas

#### GET `/api/parcels`
Obtener todas las parcelas

**Query params:**
- `status`: Filtrar por estado (active, inactive, maintenance)
- `crop_type`: Filtrar por tipo de cultivo
- `deleted`: true para obtener parcelas eliminadas

#### POST `/api/parcels`
Crear nueva parcela

**Request:**
\`\`\`json
{
  "name": "Parcela Norte",
  "area": 5.2,
  "crop_type": "Maíz",
  "location": { "lat": -12.0464, "lng": -77.0428 }
}
\`\`\`

#### GET `/api/parcels/[id]`
Obtener parcela por ID

#### PUT `/api/parcels/[id]`
Actualizar parcela

#### DELETE `/api/parcels/[id]`
Eliminar parcela (soft delete)

#### GET `/api/parcels/stats`
Obtener estadísticas de parcelas

**Response:**
\`\`\`json
{
  "total_parcels": 4,
  "total_area": 19.6,
  "active_parcels": 4,
  "crop_distribution": {
    "Maíz": 1,
    "Trigo": 1,
    "Arroz": 1,
    "Soja": 1
  }
}
\`\`\`

### Sensores

#### GET `/api/sensors/current`
Obtener lecturas actuales de sensores

**Response:**
\`\`\`json
{
  "temperature": 24.5,
  "humidity": 68.2,
  "rain": 0.5,
  "solar_radiation": 520.3,
  "timestamp": "2025-01-15T10:30:00Z",
  "parcel_id": 1
}
\`\`\`

#### GET `/api/sensors/history`
Obtener historial de sensores

**Query params:**
- `hours`: Número de horas de historial (default: 24)
- `parcel_id`: Filtrar por parcela

#### GET `/api/sensors/stats`
Obtener estadísticas agregadas de sensores

---

## Datos Mock

La aplicación incluye datos de ejemplo para desarrollo:

### Parcelas Predefinidas
1. **Parcela Norte** - Maíz (5.2 ha)
2. **Parcela Sur** - Trigo (3.8 ha)
3. **Parcela Este** - Arroz (4.5 ha)
4. **Parcela Oeste** - Soja (6.1 ha)

### Datos de Sensores
- Generados automáticamente con valores realistas
- Actualización cada 10 segundos
- Historial de 24 horas disponible

---

## Tecnologías Utilizadas

### Frontend
- **Next.js 15** - Framework React con App Router
- **React 19** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Tailwind CSS v4** - Estilos
- **shadcn/ui** - Componentes de UI
- **Recharts** - Gráficos y visualizaciones
- **Leaflet** - Mapas interactivos

### Backend (API Routes)
- **Next.js API Routes** - Backend integrado
- **JWT** - Autenticación
- **Fetch API** - Integración con API externa

### Librerías Adicionales
- **lucide-react** - Iconos
- **date-fns** - Manejo de fechas
- **zod** - Validación de esquemas

---

## Desarrollo

### Comandos Disponibles

\`\`\`bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar en producción
npm start

# Linting
npm run lint
\`\`\`

### Variables de Entorno (Opcional)

Crea un archivo `.env.local` si necesitas personalizar:

\`\`\`env
# JWT Secret (cambiar en producción)
JWT_SECRET=your-secret-key-change-in-production

# API Externa de Sensores (opcional)
EXTERNAL_SENSOR_API=https://sensores-async-api.onrender.com/api/sensors/all
\`\`\`

---

## Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Despliega automáticamente

### Otros Servicios

La aplicación es compatible con cualquier plataforma que soporte Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

---

## Solución de Problemas

### Error: "Cannot find module 'leaflet'"

\`\`\`bash
npm install leaflet @types/leaflet
\`\`\`

### Error: "JWT must be provided"

Asegúrate de estar enviando el token en el header:
\`\`\`javascript
headers: {
  'Authorization': `Bearer ${token}`
}
\`\`\`

### Los gráficos no se muestran

Verifica que `recharts` esté instalado:
\`\`\`bash
npm install recharts
\`\`\`

### El mapa no carga

Leaflet requiere CSS. Verifica que esté importado en el componente:
\`\`\`typescript
import "leaflet/dist/leaflet.css"
\`\`\`

---

## Características del Proyecto Académico

Este proyecto cumple con los requisitos del proyecto integrador:

### ✅ Requisitos Teóricos
- Documentación completa de DevOps
- Ciclo de vida DevOps implementado
- Estándares aplicables (ISO/IEC 20000, 27001, ITIL)
- Elementos DevOps (IaC, contenedores, CI/CD, monitoreo)

### ✅ Requisitos Prácticos

#### Microservicios
- ✅ Servicio A: Autenticación (JWT, roles)
- ✅ Servicio B: Sensores emulados (integración con API externa)
- ✅ Servicio C: Ingesta de datos (streaming, concurrente)
- ✅ Servicio D: Gestión de parcelas (CRUD + soft delete)

#### Bases de Datos
- ✅ Datos relacionales (parcelas) - Implementado en memoria
- ✅ Datos de series temporales (sensores) - Implementado en memoria
- ✅ Diagrama físico (incluido en documentación)

#### Frontend React
- ✅ Dashboard en tiempo real
- ✅ Gráficos históricos (línea, barras, pie)
- ✅ Mapa de parcelas activas (Leaflet.js)
- ✅ Lista de parcelas eliminadas
- ✅ Justificación de gráficos (en documentación)

#### CI/CD
- ✅ Pipeline configurado (GitHub Actions)
- ✅ Tests automatizados
- ✅ Despliegue automático
- ✅ Estrategia Blue/Green

#### Monitoreo
- ✅ Logs en consola
- ✅ Métricas de rendimiento
- ✅ Alertas configurables

---

## Próximos Pasos

Para convertir esta aplicación en un sistema de producción:

1. **Bases de Datos Reales**
   - Conectar MySQL para parcelas
   - Conectar MongoDB/InfluxDB para sensores

2. **Docker & Kubernetes**
   - Usar los archivos en `/kubernetes` y `docker-compose.yml`
   - Desplegar microservicios independientes

3. **Seguridad**
   - Implementar bcrypt para passwords
   - Usar variables de entorno seguras
   - Configurar HTTPS

4. **Monitoreo Avanzado**
   - Integrar Prometheus
   - Configurar Grafana
   - Alertas con PagerDuty

---

## Soporte

Para preguntas o problemas:
1. Revisa la documentación en `DOCUMENTATION.md`
2. Verifica los logs en la consola del navegador
3. Revisa los logs del servidor en la terminal

---

## Licencia

Este proyecto es para fines académicos.

---

**¡Listo para usar! 🚀**

Ejecuta `npm run dev` y accede a http://localhost:3000
