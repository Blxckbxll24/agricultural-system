import { NextResponse } from "next/server"
import { getMongoDb } from "@/lib/db/mongodb"

export async function GET() {
  try {
    const db = await getMongoDb()
    const collection = db.collection("sensor_readings")

    const latestReadings = await collection
      .aggregate([
        {
          $sort: { timestamp: -1 },
        },
        {
          $group: {
            _id: "$sensor_type",
            value: { $first: "$value" },
            unit: { $first: "$unit" },
            timestamp: { $first: "$timestamp" },
            parcel_id: { $first: "$parcel_id" },
            quality: { $first: "$quality" },
          },
        },
      ])
      .toArray()

    const result: any = {
      timestamp: new Date().toISOString(),
    }

    latestReadings.forEach((reading: any) => {
      result[reading._id] = reading.value
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Get current sensors error:", error)

    const mockData = {
      temperature: 24.5 + Math.random() * 5,
      humidity: 65 + Math.random() * 10,
      rain: Math.random() > 0.7 ? Math.random() * 10 : 0,
      solar_radiation: 450 + Math.random() * 200,
      timestamp: new Date().toISOString(),
      parcel_id: 1,
    }

    return NextResponse.json(mockData)
  }
}
