"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const API_URL = "http://localhost:3002/api"

interface Parcel {
  id: number
  name: string
  area: number
  crop_type: string
  status: string
  created_at: string
}

export function ParcelList() {
  const [parcels, setParcels] = useState<Parcel[]>([])

  useEffect(() => {
    const fetchParcels = async () => {
      try {
        const response = await fetch(`${API_URL}/parcels`)
        const data = await response.json()
        setParcels(data.parcels || [])
      } catch (error) {
        console.error("[v0] Failed to fetch parcels:", error)
      }
    }

    fetchParcels()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-accent text-accent-foreground"
      case "maintenance":
        return "bg-chart-3 text-primary-foreground"
      case "inactive":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parcelas Activas</CardTitle>
        <CardDescription>Lista completa de parcelas en el sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Cultivo</TableHead>
              <TableHead>Área (ha)</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha Creación</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parcels.map((parcel) => (
              <TableRow key={parcel.id}>
                <TableCell className="font-medium">{parcel.name}</TableCell>
                <TableCell>{parcel.crop_type}</TableCell>
                <TableCell>{parcel.area}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(parcel.status)}>{parcel.status}</Badge>
                </TableCell>
                <TableCell>{new Date(parcel.created_at).toLocaleDateString("es-ES")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
