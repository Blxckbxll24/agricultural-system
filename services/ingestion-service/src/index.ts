import express from "express"
import cors from "cors"
import helmet from "helmet"
import dotenv from "dotenv"
import { connectDatabase, getConnectionHealth } from "./config/database"
import ingestionRoutes from "./routes/ingestion.routes"
import sensorRoutes from "./routes/sensor.routes"
import { errorHandler } from "./middleware/error.middleware"
import { requestLogger } from "./middleware/logger.middleware"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3003

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(requestLogger)

// Health check with database status
app.get("/health", async (req, res) => {
  const dbHealth = await getConnectionHealth()
  const overallHealth = dbHealth.healthy

  res.status(overallHealth ? 200 : 503).json({
    status: overallHealth ? "ok" : "degraded",
    service: "ingestion-service",
    timestamp: new Date().toISOString(),
    database: dbHealth,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || "1.0.0",
  })
})

// Routes
app.use("/api/ingest", ingestionRoutes)
app.use("/api/sensors", sensorRoutes)

// Error handling
app.use(errorHandler)

// Start server with graceful database connection
const startServer = async () => {
  try {
    await connectDatabase()
    app.listen(PORT, () => {
      console.log(`[Ingestion Service] Running on port ${PORT}`)
      console.log(`[Ingestion Service] Environment: ${process.env.NODE_ENV || "development"}`)
    })
  } catch (error) {
    console.error("[Ingestion Service] Failed to connect to database:", error)
    console.log("[Ingestion Service] Starting server anyway with degraded functionality...")
    
    // Start server even if database connection fails
    app.listen(PORT, () => {
      console.log(`[Ingestion Service] Running on port ${PORT} (degraded mode)`)
      console.log(`[Ingestion Service] Environment: ${process.env.NODE_ENV || "development"}`)
    })
  }
}

startServer()

