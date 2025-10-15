"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Thermometer, Droplets, Cloud, Sun } from "lucide-react"

const API_URL = "http://localhost:3003/api"

interface SensorData {
  temperature: number
  humidity: number
  rain: number
  solar_radiation: number
  timestamp: string
}

export function MetricsGrid() {
  const [data, setData] = useState<SensorData | null>(null)

  useEffect(() => {
    const fetchCurrentReadings = async () => {
      try {
        const response = await fetch(`${API_URL}/sensors/current`)
        const sensorData = await response.json()
        setData(sensorData)
      } catch (error) {
        console.error("[v0] Failed to fetch current readings:", error)
      }
    }

    fetchCurrentReadings()
    const interval = setInterval(fetchCurrentReadings, 10000) // Update every 10s

    return () => clearInterval(interval)
  }, [])

  const metrics = [
    {
      title: "Temperatura Promedio",
      value: data?.temperature?.toFixed(1) || "0.0",
      unit: "°C",
      icon: Thermometer,
      color: "text-chart-1",
    },
    {
      title: "Humedad Promedio",
      value: data?.humidity?.toFixed(1) || "0.0",
      unit: "%",
      icon: Droplets,
      color: "text-chart-2",
    },
    {
      title: "Precipitación",
      value: data?.rain?.toFixed(1) || "0.0",
      unit: "mm",
      icon: Cloud,
      color: "text-chart-3",
    },
    {
      title: "Radiación Solar",
      value: data?.solar_radiation?.toFixed(0) || "0",
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
