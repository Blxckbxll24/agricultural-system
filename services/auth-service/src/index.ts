import express from "express"
import cors from "cors"
import helmet from "helmet"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.routes"
import { errorHandler } from "./middleware/error.middleware"
import { requestLogger } from "./middleware/logger.middleware"
import { getConnectionHealth } from "./config/database"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

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
    service: "auth-service",
    timestamp: new Date().toISOString(),
    database: dbHealth,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || "1.0.0",
  })
})

// Routes
app.use("/api/auth", authRoutes)

// Error handling
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`[Auth Service] Running on port ${PORT}`)
  console.log(`[Auth Service] Environment: ${process.env.NODE_ENV || "development"}`)
})

