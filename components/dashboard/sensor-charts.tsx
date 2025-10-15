"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const INGESTION_SERVICE_URL = process.env.NEXT_PUBLIC_INGESTION_SERVICE_URL || "http://localhost:3003"

export function SensorCharts() {
  const [temperatureData, setTemperatureData] = useState<any[]>([])
  const [humidityData, setHumidityData] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch temperature data
        const tempResponse = await fetch(
          `${INGESTION_SERVICE_URL}/api/sensors/history?sensor_type=temperature&limit=50`,
        )
        const tempData = await tempResponse.json()

        // Fetch humidity data
        const humResponse = await fetch(`${INGESTION_SERVICE_URL}/api/sensors/history?sensor_type=humidity&limit=50`)
        const humData = await humResponse.json()

        // Transform data for charts
        const tempChartData = tempData.readings
          ?.slice(0, 20)
          .reverse()
          .map((r: any) => ({
            time: new Date(r.timestamp).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
            value: r.value,
          }))

        const humChartData = humData.readings
          ?.slice(0, 20)
          .reverse()
          .map((r: any) => ({
            time: new Date(r.timestamp).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
            value: r.value,
          }))

        setTemperatureData(tempChartData || [])
        setHumidityData(humChartData || [])
      } catch (error) {
        console.error("[v0] Failed to fetch chart data:", error)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000) // Update every 30s

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Temperatura Histórica</CardTitle>
          <CardDescription>Últimas 20 lecturas de temperatura</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={temperatureData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Line type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Humedad Histórica</CardTitle>
          <CardDescription>Últimas 20 lecturas de humedad</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={humidityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  )
}
