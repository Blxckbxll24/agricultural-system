import type { Request, Response } from "express"
import { getDatabase } from "../config/database"
import type { SensorReading, IngestionStats, ExternalSensorData } from "../types/sensor.types"
import axios from "axios"
import PQueue from "p-queue"

const SENSOR_API_URL = process.env.SENSOR_API_URL || "https://sensores-async-api.onrender.com/api/sensors/all"
const BATCH_SIZE = Number(process.env.BATCH_SIZE) || 1000
const CONCURRENT_WORKERS = Number(process.env.CONCURRENT_WORKERS) || 10

export class IngestionController {
  // Start ingestion from external API
  static async startIngestion(req: Request, res: Response) {
    const startTime = Date.now()
    const stats: IngestionStats = {
      total_received: 0,
      total_inserted: 0,
      total_duplicates: 0,
      total_errors: 0,
      duration_ms: 0,
      records_per_second: 0,
    }

    try {
      console.log("[v0] Starting data ingestion from external API...")

      // Fetch data from external API
      const response = await axios.get(SENSOR_API_URL, { timeout: 30000 })
      const externalData: ExternalSensorData[] = Array.isArray(response.data) ? response.data : response.data.data || []

      console.log(`[v0] Received ${externalData.length} records from external API`)
      stats.total_received = externalData.length

      if (externalData.length === 0) {
        return res.json({
          message: "No data received from external API",
          stats,
        })
      }

      // Transform and validate data
      const sensorReadings: SensorReading[] = externalData
        .map((data) => IngestionController.transformExternalData(data))
        .filter((reading): reading is SensorReading => reading !== null)

      console.log(`[v0] Transformed ${sensorReadings.length} valid readings`)

      // Process data concurrently with batching
      const result = await IngestionController.processConcurrent(sensorReadings)
      stats.total_inserted = result.inserted
      stats.total_duplicates = result.duplicates
      stats.total_errors = result.errors

      stats.duration_ms = Date.now() - startTime
      stats.records_per_second = Math.round((stats.total_inserted / stats.duration_ms) * 1000)

      console.log(
        `[v0] Ingestion completed: ${stats.total_inserted} inserted, ${stats.total_duplicates} duplicates, ${stats.total_errors} errors in ${stats.duration_ms}ms`,
      )

      res.json({
        message: "Ingestion completed successfully",
        stats,
      })
    } catch (error) {
      console.error("[Ingestion] Error:", error)
      stats.duration_ms = Date.now() - startTime
      res.status(500).json({
        error: "Ingestion failed",
        message: error instanceof Error ? error.message : "Unknown error",
        stats,
      })
    }
  }

  // Generate and ingest emulated sensor data (for stress testing)
  static async generateEmulatedData(req: Request, res: Response) {
    const startTime = Date.now()
    const { count = 10000, parcel_ids = [1, 2, 3, 4, 5] } = req.body

    const stats: IngestionStats = {
      total_received: count,
      total_inserted: 0,
      total_duplicates: 0,
      total_errors: 0,
      duration_ms: 0,
      records_per_second: 0,
    }

    try {
      console.log(`[v0] Generating ${count} emulated sensor readings...`)

      // Generate emulated data
      const sensorReadings: SensorReading[] = []
      const sensorTypes: Array<"temperature" | "humidity" | "rain" | "solar_radiation"> = [
        "temperature",
        "humidity",
        "rain",
        "solar_radiation",
      ]

      for (let i = 0; i < count; i++) {
        const parcel_id = parcel_ids[Math.floor(Math.random() * parcel_ids.length)]
        const sensor_type = sensorTypes[Math.floor(Math.random() * sensorTypes.length)]
        const timestamp = new Date(Date.now() - Math.floor(Math.random() * 86400000)) // Random time in last 24h

        sensorReadings.push({
          parcel_id,
          sensor_type,
          value: IngestionController.generateSensorValue(sensor_type),
          unit: IngestionController.getSensorUnit(sensor_type),
          timestamp,
          quality: Math.random() > 0.1 ? "good" : Math.random() > 0.5 ? "fair" : "poor",
          metadata: {
            sensor_id: `${sensor_type.toUpperCase()}-${parcel_id}-${Math.floor(Math.random() * 100)}`,
            location: "emulated",
          },
        })
      }

      console.log(`[v0] Generated ${sensorReadings.length} emulated readings`)

      // Process data concurrently
      const result = await IngestionController.processConcurrent(sensorReadings)
      stats.total_inserted = result.inserted
      stats.total_duplicates = result.duplicates
      stats.total_errors = result.errors

      stats.duration_ms = Date.now() - startTime
      stats.records_per_second = Math.round((stats.total_inserted / stats.duration_ms) * 1000)

      console.log(
        `[v0] Emulated data ingestion completed: ${stats.total_inserted} inserted in ${stats.duration_ms}ms (${stats.records_per_second} records/sec)`,
      )

      res.json({
        message: "Emulated data generated and ingested successfully",
        stats,
      })
    } catch (error) {
      console.error("[Ingestion] Emulated data error:", error)
      stats.duration_ms = Date.now() - startTime
      res.status(500).json({
        error: "Emulated data generation failed",
        message: error instanceof Error ? error.message : "Unknown error",
        stats,
      })
    }
  }

  // Process data concurrently with batching and deduplication
  private static async processConcurrent(
    readings: SensorReading[],
  ): Promise<{ inserted: number; duplicates: number; errors: number }> {
    const db = getDatabase()
    const collection = db.collection("sensor_readings")

    let inserted = 0
    let duplicates = 0
    let errors = 0

    // Create batches
    const batches: SensorReading[][] = []
    for (let i = 0; i < readings.length; i += BATCH_SIZE) {
      batches.push(readings.slice(i, i + BATCH_SIZE))
    }

    console.log(`[v0] Processing ${batches.length} batches with ${CONCURRENT_WORKERS} concurrent workers`)

    // Process batches concurrently using p-queue
    const queue = new PQueue({ concurrency: CONCURRENT_WORKERS })

    const promises = batches.map((batch) =>
      queue.add(async () => {
        try {
          // Use bulkWrite with ordered: false for better performance
          const operations = batch.map((reading) => ({
            insertOne: {
              document: reading,
            },
          }))

          const result = await collection.bulkWrite(operations, { ordered: false })
          inserted += result.insertedCount

          return { inserted: result.insertedCount, duplicates: 0, errors: 0 }
        } catch (error: any) {
          // Handle duplicate key errors (E11000)
          if (error.code === 11000 || error.writeErrors) {
            const writeErrors = error.writeErrors || []
            const duplicateCount = writeErrors.filter((e: any) => e.code === 11000).length
            const insertedCount = batch.length - writeErrors.length

            duplicates += duplicateCount
            inserted += insertedCount
            errors += writeErrors.length - duplicateCount

            return { inserted: insertedCount, duplicates: duplicateCount, errors: writeErrors.length - duplicateCount }
          }

          console.error("[Ingestion] Batch processing error:", error.message)
          errors += batch.length
          return { inserted: 0, duplicates: 0, errors: batch.length }
        }
      }),
    )

    await Promise.all(promises)

    return { inserted, duplicates, errors }
  }

  // Transform external API data to internal format
  private static transformExternalData(data: ExternalSensorData): SensorReading | null {
    try {
      // Adapt to different possible API response formats
      const parcel_id = data.parcelId || data.parcel_id || 1
      const sensor_type = (data.type || data.sensor_type || "temperature").toLowerCase()
      const value = data.value || 0
      const unit = data.unit || IngestionController.getSensorUnit(sensor_type as any)
      const timestamp = data.timestamp ? new Date(data.timestamp) : new Date()

      // Validate sensor type
      if (!["temperature", "humidity", "rain", "solar_radiation"].includes(sensor_type)) {
        return null
      }

      return {
        parcel_id,
        sensor_type: sensor_type as any,
        value,
        unit,
        timestamp,
        quality: "good",
        metadata: {
          sensor_id: data.id || `EXTERNAL-${Date.now()}`,
          source: "external_api",
        },
      }
    } catch (error) {
      console.error("[Ingestion] Transform error:", error)
      return null
    }
  }

  // Generate realistic sensor values
  private static generateSensorValue(sensor_type: string): number {
    switch (sensor_type) {
      case "temperature":
        return Math.round((Math.random() * 20 + 15) * 10) / 10 // 15-35°C
      case "humidity":
        return Math.round((Math.random() * 40 + 40) * 10) / 10 // 40-80%
      case "rain":
        return Math.round(Math.random() * 50 * 10) / 10 // 0-50mm
      case "solar_radiation":
        return Math.round((Math.random() * 800 + 200) * 10) / 10 // 200-1000 W/m²
      default:
        return 0
    }
  }

  // Get sensor unit
  private static getSensorUnit(sensor_type: string): string {
    switch (sensor_type) {
      case "temperature":
        return "°C"
      case "humidity":
        return "%"
      case "rain":
        return "mm"
      case "solar_radiation":
        return "W/m²"
      default:
        return ""
    }
  }
}
