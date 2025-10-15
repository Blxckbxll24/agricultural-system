"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

const API_URL = "http://localhost:3002/api"

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export function CropDistribution() {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/parcels/stats`)
        const result = await response.json()

        const chartData = Object.entries(result.crop_distribution || {}).map(([name, value]) => ({
          name,
          value,
        }))

        setData(chartData)
      } catch (error) {
        console.error("[v0] Failed to fetch crop distribution:", error)
      }
    }

    fetchData()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución de Cultivos</CardTitle>
        <CardDescription>Cantidad de parcelas por tipo de cultivo</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" label>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
