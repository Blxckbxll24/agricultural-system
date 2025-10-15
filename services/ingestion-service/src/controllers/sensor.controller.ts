import type { Request, Response } from "express"
import { getDatabase } from "../config/database"

export class SensorController {
  // Get latest sensor readings
  static async getLatestReadings(req: Request, res: Response) {
    try {
      const { parcel_id, sensor_type, limit = 100 } = req.query
      const db = getDatabase()
      const collection = db.collection("sensor_readings")

      const query: any = {}
      if (parcel_id) query.parcel_id = Number(parcel_id)
      if (sensor_type) query.sensor_type = sensor_type

      const readings = await collection.find(query).sort({ timestamp: -1 }).limit(Number(limit)).toArray()

      res.json({
        readings,
        count: readings.length,
      })
    } catch (error) {
      console.error("[Sensor] Get latest error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }

  // Get sensor history with time range
  static async getHistory(req: Request, res: Response) {
    try {
      const { parcel_id, sensor_type, start_date, end_date, limit = 1000, offset = 0 } = req.query
      const db = getDatabase()
      const collection = db.collection("sensor_readings")

      const query: any = {}
      if (parcel_id) query.parcel_id = Number(parcel_id)
      if (sensor_type) query.sensor_type = sensor_type

      if (start_date || end_date) {
        query.timestamp = {}
        if (start_date) query.timestamp.$gte = new Date(start_date as string)
        if (end_date) query.timestamp.$lte = new Date(end_date as string)
      }

      const readings = await collection
        .find(query)
        .sort({ timestamp: -1 })
        .skip(Number(offset))
        .limit(Number(limit))
        .toArray()

      const total = await collection.countDocuments(query)

      res.json({
        readings,
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: Number(offset) + readings.length < total,
        },
      })
    } catch (error) {
      console.error("[Sensor] Get history error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }

  // Get aggregated statistics
  static async getStatistics(req: Request, res: Response) {
    try {
      const { parcel_id, sensor_type, start_date, end_date } = req.query
      const db = getDatabase()
      const collection = db.collection("sensor_readings")

      const matchStage: any = {}
      if (parcel_id) matchStage.parcel_id = Number(parcel_id)
      if (sensor_type) matchStage.sensor_type = sensor_type

      if (start_date || end_date) {
        matchStage.timestamp = {}
        if (start_date) matchStage.timestamp.$gte = new Date(start_date as string)
        if (end_date) matchStage.timestamp.$lte = new Date(end_date as string)
      }

      const pipeline: any[] = []
      if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage })
      }

      pipeline.push({
        $group: {
          _id: { parcel_id: "$parcel_id", sensor_type: "$sensor_type" },
          min_value: { $min: "$value" },
          max_value: { $max: "$value" },
          avg_value: { $avg: "$value" },
          count: { $sum: 1 },
          latest_timestamp: { $max: "$timestamp" },
        },
      })

      const statistics = await collection.aggregate(pipeline).toArray()

      res.json({ statistics })
    } catch (error) {
      console.error("[Sensor] Get statistics error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }

  // Get current readings (most recent for each sensor type per parcel)
  static async getCurrentReadings(req: Request, res: Response) {
    try {
      const { parcel_id } = req.query
      const db = getDatabase()
      const collection = db.collection("sensor_readings")

      const matchStage: any = {}
      if (parcel_id) matchStage.parcel_id = Number(parcel_id)

      const pipeline = [
        ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
        { $sort: { timestamp: -1 } },
        {
          $group: {
            _id: { parcel_id: "$parcel_id", sensor_type: "$sensor_type" },
            latest_reading: { $first: "$$ROOT" },
          },
        },
        { $replaceRoot: { newRoot: "$latest_reading" } },
      ]

      const currentReadings = await collection.aggregate(pipeline).toArray()

      res.json({
        current_readings: currentReadings,
        count: currentReadings.length,
      })
    } catch (error) {
      console.error("[Sensor] Get current readings error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }
}
