import { Router } from "express"
import { IngestionController } from "../controllers/ingestion.controller"

const router = Router()

// Start ingestion from external API
router.post("/start", IngestionController.startIngestion)

// Generate emulated data for stress testing
router.post("/emulate", IngestionController.generateEmulatedData)

export default router
