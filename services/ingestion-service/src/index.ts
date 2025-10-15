import express from "express"
import cors from "cors"
import helmet from "helmet"
import dotenv from "dotenv"
import { connectDatabase } from "./config/database"
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

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "ingestion-service", timestamp: new Date().toISOString() })
})

// Routes
app.use("/api/ingest", ingestionRoutes)
app.use("/api/sensors", sensorRoutes)

// Error handling
app.use(errorHandler)

// Start server
const startServer = async () => {
  try {
    await connectDatabase()
    app.listen(PORT, () => {
      console.log(`[Ingestion Service] Running on port ${PORT}`)
      console.log(`[Ingestion Service] Environment: ${process.env.NODE_ENV || "development"}`)
    })
  } catch (error) {
    console.error("[Ingestion Service] Failed to start:", error)
    process.exit(1)
  }
}

startServer()
