import { NextResponse } from "next/server"
import { getSensorStats } from "@/lib/sensor-storage"

export async function GET() {
  try {
    const stats = getSensorStats()

    if (!stats) {
      // Return mock data if no generated data exists
      return NextResponse.json({
        avg_temperature: 24.5,
        avg_humidity: 68.2,
        total_rain: 12.5,
        avg_solar_radiation: 520.3,
        last_updated: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      avg_temperature: stats.avgTemperature,
      avg_humidity: stats.avgHumidity,
      total_rain: stats.totalRain,
      avg_solar_radiation: stats.avgSolarRadiation,
      total_records: stats.count,
      last_updated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Get sensor stats error:", error)
    return NextResponse.json({ error: "Error al obtener estadísticas de sensores" }, { status: 500 })
  }
}
