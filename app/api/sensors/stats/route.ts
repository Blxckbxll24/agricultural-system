import { NextResponse } from "next/server"

export async function GET() {
  try {
    const stats = {
      avg_temperature: 24.5,
      avg_humidity: 68.2,
      total_rain: 12.5,
      avg_solar_radiation: 520.3,
      last_updated: new Date().toISOString(),
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("[v0] Get sensor stats error:", error)
    return NextResponse.json({ error: "Error al obtener estadísticas de sensores" }, { status: 500 })
  }
}
