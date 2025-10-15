import { type NextRequest, NextResponse } from "next/server"
import { getSensorRecords } from "@/lib/sensor-storage"

// Access the shared sensor database
const sensorDatabase: any[] = []

// Generate mock historical data as fallback
function generateHistoricalData(hours = 24) {
  const data = []
  const now = new Date()

  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)
    data.push({
      timestamp: timestamp.toISOString(),
      temperature: 20 + Math.random() * 10,
      humidity: 60 + Math.random() * 20,
      rain: Math.random() > 0.8 ? Math.random() * 5 : 0,
      solar_radiation: 400 + Math.random() * 300,
      parcel_id: 1,
    })
  }

  return data
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hours = Number.parseInt(searchParams.get("hours") || "24")
    const parcelId = searchParams.get("parcel_id")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    const sensorRecords = getSensorRecords()
    let data = sensorRecords.length > 0 ? sensorRecords : generateHistoricalData(hours)

    // Filter by time range if using generated data
    if (sensorRecords.length > 0) {
      const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000)
      data = data.filter((reading: any) => new Date(reading.timestamp) >= cutoffTime)
    }

    // Filter by parcel if specified
    if (parcelId) {
      data = data.filter((reading: any) => reading.parcel_id === Number.parseInt(parcelId))
    }

    // Sort by timestamp descending
    data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedData = data.slice(startIndex, endIndex)

    return NextResponse.json({
      readings: paginatedData,
      pagination: {
        page,
        limit,
        total: data.length,
        totalPages: Math.ceil(data.length / limit),
      },
    })
  } catch (error) {
    console.error("[v0] Get sensor history error:", error)
    return NextResponse.json({ error: "Error al obtener historial de sensores" }, { status: 500 })
  }
}
