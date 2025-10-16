# Sistema IoT Agrícola - Gestión y Monitoreo de Parcelas

Sistema integral de gestión y monitoreo de parcelas agrícolas con sensores IoT, visualización en tiempo real, y dashboard interactivo.

## 🚀 Inicio Rápido

\`\`\`bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
\`\`\`

**La aplicación estará disponible en:** http://localhost:3000

### Credenciales de Acceso

- **Admin**: `admin` / `admin123`
- **Operador**: `operator` / `operator123`

---

## 📋 Características Principales

### Dashboard en Tiempo Real
- ✅ Métricas actuales de sensores (temperatura, humedad, precipitación, radiación solar)
- ✅ Actualización automática cada 10 segundos
- ✅ Integración con API externa de sensores
- ✅ **Modo claro/oscuro** - Cambia entre temas con un clic

### Visualizaciones
- 📊 **Gráfico de líneas** - Temperatura histórica (últimas 20 lecturas)
- 📊 **Gráfico de barras** - Humedad histórica (últimas 20 lecturas)
- 📊 **Gráfico de pie** - Distribución de cultivos por parcela

### Mapa Interactivo
- 🗺️ Mapa con Leaflet.js mostrando ubicación de parcelas activas
- 📍 Marcadores personalizados con información de cada parcela
- 🌍 Coordenadas geográficas reales

### Gestión de Parcelas
- ✅ CRUD completo (Crear, Leer, Actualizar, Eliminar)
- ✅ Soft delete con historial de parcelas eliminadas
- ✅ Filtros por estado y tipo de cultivo
- ✅ Estadísticas agregadas

### Interfaz de Usuario
- 🎨 **Tema claro y oscuro** - Adaptable a preferencias del usuario
- 🎨 Sistema de diseño consistente con tokens semánticos
- 📱 Diseño responsive para todos los dispositivos

---

## 🏗️ Arquitectura

### Tecnología Stack

**Frontend:**
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- next-themes (modo claro/oscuro)

**Visualización:**
- Recharts (gráficos)
- Leaflet.js (mapas)
- Lucide React (iconos)

**Backend:**
- Next.js API Routes
- JWT para autenticación
- Datos en memoria (desarrollo)

**Integración Externa:**
- API de sensores: `https://sensores-async-api.onrender.com/api/sensors/all`

---

## 📁 Estructura del Proyecto

\`\`\`
agricultural-system/
├── app/
│   ├── api/                    # API Routes de Next.js
│   │   ├── auth/              # Autenticación (login, verify)
│   │   ├── parcels/           # Gestión de parcelas (CRUD)
│   │   └── sensors/           # Datos de sensores
│   ├── dashboard/             # Dashboard principal
│   ├── login/                 # Página de login
│   └── parcels/               # Gestión de parcelas
├── components/
│   ├── auth/                  # Componentes de autenticación
│   ├── dashboard/             # Componentes del dashboard
│   ├── parcels/               # Componentes de parcelas
│   └── map/                   # Mapa Leaflet
├── services/                  # Microservicios (referencia)
├── kubernetes/                # Configuración K8s (producción)
└── scripts/                   # Scripts SQL/MongoDB
\`\`\`

---

## 🔌 API Endpoints

### Autenticación

**POST** `/api/auth/login`
\`\`\`json
{
  "username": "admin",
  "password": "admin123"
}
\`\`\`

**GET** `/api/auth/verify`
- Headers: `Authorization: Bearer <token>`

### Parcelas

**GET** `/api/parcels` - Listar parcelas
- Query params: `status`, `crop_type`, `deleted`

**POST** `/api/parcels` - Crear parcela
**GET** `/api/parcels/[id]` - Obtener parcela
**PUT** `/api/parcels/[id]` - Actualizar parcela
**DELETE** `/api/parcels/[id]` - Eliminar parcela
**GET** `/api/parcels/stats` - Estadísticas

### Sensores

**GET** `/api/sensors/current` - Lecturas actuales
**GET** `/api/sensors/history` - Historial (query: `hours`)
**GET** `/api/sensors/stats` - Estadísticas agregadas

---

## 🛠️ Desarrollo

### Comandos Disponibles

\`\`\`bash
npm run dev      # Modo desarrollo
npm run build    # Build producción
npm start        # Iniciar producción
npm run lint     # Linting
\`\`\`

### Variables de Entorno (Opcional)

Crea `.env.local`:

\`\`\`env
JWT_SECRET=your-secret-key-change-in-production
EXTERNAL_SENSOR_API=https://sensores-async-api.onrender.com/api/sensors/all
\`\`\`

---

## 📊 Datos de Ejemplo

### Parcelas Predefinidas
1. **Parcela Norte** - Maíz (5.2 ha) - Lima, Perú
2. **Parcela Sur** - Trigo (3.8 ha) - Lima, Perú
3. **Parcela Este** - Arroz (4.5 ha) - Lima, Perú
4. **Parcela Oeste** - Soja (6.1 ha) - Lima, Perú

### Datos de Sensores
- Temperatura: 20-30°C
- Humedad: 60-80%
- Precipitación: 0-5mm
- Radiación Solar: 400-700 W/m²

---

## 🚢 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura variables de entorno
3. Despliega automáticamente

### Docker (Producción)

\`\`\`bash
# Construir imagen
docker build -t agricultural-system .

# Ejecutar contenedor
docker run -p 3000:3000 agricultural-system
\`\`\`

### Kubernetes

\`\`\`bash
kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/
\`\`\`

---

## 📚 Documentación Adicional

- **[SETUP.md](SETUP.md)** - Guía detallada de instalación frontend
- **[DATABASE-SETUP.md](DATABASE-SETUP.md)** - Guía completa de configuración de bases de datos
- **[DOCKER-SETUP.md](DOCKER-SETUP.md)** - Guía de despliegue con Docker
- **[DOCUMENTATION.md](DOCUMENTATION.md)** - Documentación técnica completa
- **[scripts/README.md](scripts/README.md)** - Scripts de utilidad y validación
- **kubernetes/** - Configuración para producción

### Herramientas de Validación

```bash
# Validar configuración del entorno
./scripts/validate-environment.sh

# Verificar salud de bases de datos
./scripts/check-db-health.sh
```

---

## 🎓 Proyecto Académico

Este proyecto cumple con los requisitos del proyecto integrador:

### Requisitos Implementados

✅ **Microservicios Asincrónicos**
- Autenticación con JWT
- Gestión de parcelas con CRUD
- Ingesta de datos de sensores
- Procesamiento concurrente

✅ **Bases de Datos**
- Estructura relacional (parcelas)
- Series temporales (sensores)
- Soft delete implementado

✅ **Frontend React**
- Dashboard en tiempo real
- Gráficos históricos (línea, barras, pie)
- Mapa interactivo con Leaflet
- Lista de parcelas eliminadas

✅ **DevOps**
- CI/CD con GitHub Actions
- Contenedores Docker
- Orquestación Kubernetes
- Monitoreo y logs

---

## 🐛 Solución de Problemas

### Error: "Cannot find module 'leaflet'"
\`\`\`bash
npm install leaflet @types/leaflet
\`\`\`

### Los gráficos no se muestran
\`\`\`bash
npm install recharts
\`\`\`

### Error de autenticación
Verifica que estés enviando el token en el header:
\`\`\`javascript
headers: { 'Authorization': `Bearer ${token}` }
\`\`\`

### Problemas de Conexión a Base de Datos

Si encuentras errores de conexión a MySQL o MongoDB:

1. **Verifica que las bases de datos estén corriendo:**
   \`\`\`bash
   ./scripts/check-db-health.sh
   \`\`\`

2. **Inicia las bases de datos con Docker:**
   \`\`\`bash
   docker-compose up -d mysql mongodb
   \`\`\`

3. **Consulta la guía completa:**
   Ver [DATABASE-SETUP.md](DATABASE-SETUP.md) para instrucciones detalladas de configuración y troubleshooting.

### Error: ECONNREFUSED en microservicios

Los microservicios implementan reintentos automáticos con backoff exponencial. Si persisten los errores:

1. Verifica las variables de entorno en `.env`
2. Revisa los logs del servicio: `docker-compose logs -f [service-name]`
3. Verifica el health endpoint: `curl http://localhost:3001/health`

---

## 📄 Licencia

Este proyecto es para fines académicos.

---

## 👥 Contribuidores

- Jose PH (@Blxckbxll24)

---

**¡Listo para usar! 🌱**

Ejecuta `npm run dev` y accede a http://localhost:3000
