import { Router } from "express"
import { SensorController } from "../controllers/sensor.controller"

const router = Router()

// Get latest sensor readings
router.get("/latest", SensorController.getLatestReadings)

// Get sensor history
router.get("/history", SensorController.getHistory)

// Get statistics
router.get("/statistics", SensorController.getStatistics)

// Get current readings (most recent for each sensor type)
router.get("/current", SensorController.getCurrentReadings)

export default router
