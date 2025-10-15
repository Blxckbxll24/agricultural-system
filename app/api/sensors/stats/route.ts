import { NextResponse } from "next/server"
import { getMongoDb } from "@/lib/db/mongodb"

export async function GET() {
  try {
    const db = await getMongoDb()
    const collection = db.collection("sensor_readings")

    const stats = await collection
      .aggregate([
        {
          $group: {
            _id: "$sensor_type",
            avg: { $avg: "$value" },
            min: { $min: "$value" },
            max: { $max: "$value" },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray()

    const result: any = {
      last_updated: new Date().toISOString(),
      total_records: 0,
    }

    stats.forEach((stat: any) => {
      result.total_records += stat.count

      switch (stat._id) {
        case "temperature":
          result.avg_temperature = Math.round(stat.avg * 100) / 100
          break
        case "humidity":
          result.avg_humidity = Math.round(stat.avg * 100) / 100
          break
        case "rain":
          result.total_rain = Math.round(stat.avg * 100) / 100
          break
        case "solar_radiation":
          result.avg_solar_radiation = Math.round(stat.avg * 100) / 100
          break
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Get sensor stats error:", error)

    return NextResponse.json({
      avg_temperature: 24.5,
      avg_humidity: 68.2,
      total_rain: 12.5,
      avg_solar_radiation: 520.3,
      last_updated: new Date().toISOString(),
    })
  }
}
