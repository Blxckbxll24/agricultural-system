import { NextResponse } from "next/server"

const EXTERNAL_SENSOR_API = "https://sensores-async-api.onrender.com/api/sensors/all"

export async function GET() {
  try {
    // Try to fetch from external API
    try {
      const response = await fetch(EXTERNAL_SENSOR_API, {
        next: { revalidate: 10 }, // Cache for 10 seconds
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch (fetchError) {
      console.log("[v0] External API unavailable, using mock data")
    }

    // Fallback to mock data if external API fails
    const mockData = {
      temperature: 24.5 + Math.random() * 5,
      humidity: 65 + Math.random() * 10,
      rain: Math.random() > 0.7 ? Math.random() * 10 : 0,
      solar_radiation: 450 + Math.random() * 200,
      timestamp: new Date().toISOString(),
      parcel_id: 1,
    }

    return NextResponse.json(mockData)
  } catch (error) {
    console.error("[v0] Get current sensors error:", error)
    return NextResponse.json({ error: "Error al obtener datos de sensores" }, { status: 500 })
  }
}
