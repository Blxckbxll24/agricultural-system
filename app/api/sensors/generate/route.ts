import { NextResponse } from "next/server"
import { addSensorRecords, getSensorRecords, clearSensorRecords } from "@/lib/sensor-storage"

export async function POST() {
  try {
    const startTime = Date.now()
    const recordCount = 10000
    const generatedData = []

    console.log("[v0] Starting generation of", recordCount, "sensor records...")

    // Generate 10,000+ records efficiently
    for (let i = 0; i < recordCount; i++) {
      const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Last 30 days

      generatedData.push({
        id: getSensorRecords().length + i + 1,
        timestamp: timestamp.toISOString(),
        temperature: 15 + Math.random() * 20, // 15-35°C
        humidity: 40 + Math.random() * 40, // 40-80%
        rain: Math.random() > 0.7 ? Math.random() * 15 : 0, // 0-15mm
        solar_radiation: 200 + Math.random() * 600, // 200-800 W/m²
        parcel_id: Math.floor(Math.random() * 4) + 1, // Random parcel 1-4
      })
    }

    // Add to database
    const totalRecords = addSensorRecords(generatedData)

    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000

    console.log("[v0] Generated", recordCount, "records in", duration, "seconds")

    return NextResponse.json({
      success: true,
      message: `Generados ${recordCount} registros en ${duration.toFixed(2)} segundos`,
      recordCount: totalRecords,
      duration,
      recordsPerSecond: Math.round(recordCount / duration),
    })
  } catch (error) {
    console.error("[v0] Generate sensors error:", error)
    return NextResponse.json({ error: "Error al generar datos de sensores" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    totalRecords: getSensorRecords().length,
    message: "Use POST para generar nuevos registros",
  })
}

export async function DELETE() {
  const count = clearSensorRecords()
  return NextResponse.json({
    success: true,
    message: `Eliminados ${count} registros`,
  })
}
