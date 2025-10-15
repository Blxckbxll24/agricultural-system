"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Thermometer, Droplets, Cloud, Sun } from "lucide-react"

const INGESTION_SERVICE_URL = process.env.NEXT_PUBLIC_INGESTION_SERVICE_URL || "http://localhost:3003"

interface CurrentReading {
  parcel_id: number
  sensor_type: string
  value: number
  unit: string
  timestamp: string
}

export function MetricsGrid() {
  const [readings, setReadings] = useState<CurrentReading[]>([])

  useEffect(() => {
    const fetchCurrentReadings = async () => {
      try {
        const response = await fetch(`${INGESTION_SERVICE_URL}/api/sensors/current`)
        const data = await response.json()
        setReadings(data.current_readings || [])
      } catch (error) {
        console.error("[v0] Failed to fetch current readings:", error)
      }
    }

    fetchCurrentReadings()
    const interval = setInterval(fetchCurrentReadings, 10000) // Update every 10s

    return () => clearInterval(interval)
  }, [])

  const getAverageValue = (sensorType: string) => {
    const filtered = readings.filter((r) => r.sensor_type === sensorType)
    if (filtered.length === 0) return 0
    return filtered.reduce((sum, r) => sum + r.value, 0) / filtered.length
  }

  const metrics = [
    {
      title: "Temperatura Promedio",
      value: getAverageValue("temperature").toFixed(1),
      unit: "°C",
      icon: Thermometer,
      color: "text-chart-1",
    },
    {
      title: "Humedad Promedio",
      value: getAverageValue("humidity").toFixed(1),
      unit: "%",
      icon: Droplets,
      color: "text-chart-2",
    },
    {
      title: "Precipitación",
      value: getAverageValue("rain").toFixed(1),
      unit: "mm",
      icon: Cloud,
      color: "text-chart-3",
    },
    {
      title: "Radiación Solar",
      value: getAverageValue("solar_radiation").toFixed(0),
      unit: "W/m²",
      icon: Sun,
      color: "text-chart-4",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
            <metric.icon className={`h-5 w-5 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {metric.value}
              <span className="text-lg text-muted-foreground ml-1">{metric.unit}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
