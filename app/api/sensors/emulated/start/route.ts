import { NextResponse } from "next/server"
import { getMongoDb } from "@/lib/db/mongodb"

let emulationInterval: NodeJS.Timeout | null = null
let isRunning = false

async function generateEmulatedData() {
  try {
    const db = await getMongoDb()
    const collection = db.collection("sensor_readings")

    const parcelIds = [1, 2, 3, 4]
    const sensorTypes = ["temperature", "humidity", "rain", "solar_radiation"]

    const readings = []

    for (const parcelId of parcelIds) {
      for (const sensorType of sensorTypes) {
        let value: number
        let unit: string

        switch (sensorType) {
          case "temperature":
            value = 15 + Math.random() * 20 // 15-35°C
            unit = "°C"
            break
          case "humidity":
            value = 40 + Math.random() * 50 // 40-90%
            unit = "%"
            break
          case "rain":
            value = Math.random() * 10 // 0-10mm
            unit = "mm"
            break
          case "solar_radiation":
            value = Math.random() * 1000 // 0-1000 W/m²
            unit = "W/m²"
            break
          default:
            value = 0
            unit = ""
        }

        readings.push({
          parcel_id: parcelId,
          sensor_type: sensorType,
          value: Math.round(value * 100) / 100,
          unit,
          timestamp: new Date(),
          quality: "good",
          metadata: {
            emulated: true,
            sensor_id: `EMU-${sensorType.toUpperCase()}-${parcelId}`,
          },
        })
      }
    }

    await collection.insertMany(readings)
    console.log(`[v0] Generated ${readings.length} emulated sensor readings at ${new Date().toISOString()}`)
  } catch (error) {
    console.error("[v0] Error generating emulated data:", error)
  }
}

export async function POST() {
  try {
    if (isRunning) {
      return NextResponse.json({
        success: false,
        message: "Emulation is already running",
      })
    }

    isRunning = true

    // Generate initial data
    await generateEmulatedData()

    // Set interval for continuous generation
    emulationInterval = setInterval(generateEmulatedData, 15000) // 15 seconds

    return NextResponse.json({
      success: true,
      message: "Emulated sensor data generation started",
      interval: "15 seconds",
    })
  } catch (error: any) {
    console.error("[v0] Error starting emulation:", error)
    return NextResponse.json({ error: "Failed to start emulation", details: error.message }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    if (emulationInterval) {
      clearInterval(emulationInterval)
      emulationInterval = null
    }
    isRunning = false

    return NextResponse.json({
      success: true,
      message: "Emulated sensor data generation stopped",
    })
  } catch (error: any) {
    console.error("[v0] Error stopping emulation:", error)
    return NextResponse.json({ error: "Failed to stop emulation", details: error.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    isRunning,
    interval: "15 seconds",
  })
}
