import express from "express"
import cors from "cors"
import helmet from "helmet"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.routes"
import { errorHandler } from "./middleware/error.middleware"
import { requestLogger } from "./middleware/logger.middleware"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(requestLogger)

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "auth-service", timestamp: new Date().toISOString() })
})

// Routes
app.use("/api/auth", authRoutes)

// Error handling
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`[Auth Service] Running on port ${PORT}`)
  console.log(`[Auth Service] Environment: ${process.env.NODE_ENV || "development"}`)
})
