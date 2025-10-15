import { type NextRequest, NextResponse } from "next/server"
import { getMongoDb } from "@/lib/db/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hours = Number.parseInt(searchParams.get("hours") || "24")
    const parcelId = searchParams.get("parcel_id")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    const db = await getMongoDb()
    const collection = db.collection("sensor_readings")

    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000)
    const filter: any = {
      timestamp: { $gte: cutoffTime },
    }

    if (parcelId) {
      filter.parcel_id = Number.parseInt(parcelId)
    }

    const total = await collection.countDocuments(filter)

    const readings = await collection
      .find(filter)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    return NextResponse.json({
      readings: readings.map((r) => ({
        timestamp: r.timestamp,
        temperature: r.sensor_type === "temperature" ? r.value : undefined,
        humidity: r.sensor_type === "humidity" ? r.value : undefined,
        rain: r.sensor_type === "rain" ? r.value : undefined,
        solar_radiation: r.sensor_type === "solar_radiation" ? r.value : undefined,
        parcel_id: r.parcel_id,
        sensor_type: r.sensor_type,
        value: r.value,
        unit: r.unit,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("[v0] Get sensor history error:", error)
    return NextResponse.json({ error: "Error al obtener historial de sensores" }, { status: 500 })
  }
}
