import { type NextRequest, NextResponse } from "next/server"

// Generate mock historical data
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

    const data = generateHistoricalData(hours)

    return NextResponse.json({ readings: data })
  } catch (error) {
    console.error("[v0] Get sensor history error:", error)
    return NextResponse.json({ error: "Error al obtener historial de sensores" }, { status: 500 })
  }
}
