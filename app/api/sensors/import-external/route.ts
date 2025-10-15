import { NextResponse } from "next/server"
import { query } from "@/lib/db/mysql"

export async function POST() {
  try {
    const startTime = Date.now()

    const response = await fetch("https://sensores-async-api.onrender.com/api/sensors/all")

    if (!response.ok) {
      throw new Error(`External API error: ${response.statusText}`)
    }

    const externalData = await response.json()

    let insertedCount = 0
    const batchSize = 100

    for (let i = 0; i < externalData.length; i += batchSize) {
      const batch = externalData.slice(i, i + batchSize)

      const values = batch.map((sensor: any) => [
        sensor.id || `sensor-${Date.now()}-${i}`,
        sensor.parcel_id || Math.floor(Math.random() * 4) + 1,
        sensor.type || "temperature",
        sensor.value || 0,
        sensor.unit || "°C",
        sensor.timestamp || new Date(),
        sensor.location || "Unknown",
        sensor.quality || "good",
        JSON.stringify(sensor.metadata || {}),
      ])

      if (values.length > 0) {
        const placeholders = values.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?)").join(", ")
        const flatValues = values.flat()

        await query(
          `INSERT INTO sensor_data_external 
           (sensor_id, parcel_id, sensor_type, value, unit, timestamp, location, quality, metadata) 
           VALUES ${placeholders}`,
          flatValues,
        )

        insertedCount += values.length
      }
    }

    const duration = Date.now() - startTime

    return NextResponse.json({
      success: true,
      message: "External sensor data imported successfully",
      stats: {
        totalRecords: insertedCount,
        duration: `${duration}ms`,
        recordsPerSecond: Math.round((insertedCount / duration) * 1000),
      },
    })
  } catch (error: any) {
    console.error("[v0] Error importing external sensor data:", error)
    return NextResponse.json(
      { error: "Failed to import external sensor data", details: error.message },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const result = await query<any[]>("SELECT COUNT(*) as count FROM sensor_data_external")

    const stats = await query<any[]>(`
      SELECT 
        sensor_type,
        COUNT(*) as count,
        AVG(value) as avg_value,
        MIN(value) as min_value,
        MAX(value) as max_value
      FROM sensor_data_external
      GROUP BY sensor_type
    `)

    return NextResponse.json({
      totalRecords: result[0]?.count || 0,
      byType: stats,
    })
  } catch (error: any) {
    console.error("[v0] Error getting import stats:", error)
    return NextResponse.json({ error: "Failed to get import stats", details: error.message }, { status: 500 })
  }
}
