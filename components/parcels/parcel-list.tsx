"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const PARCEL_SERVICE_URL = process.env.NEXT_PUBLIC_PARCEL_SERVICE_URL || "http://localhost:3002"

interface Parcel {
  id: number
  name: string
  location: string
  area_hectares: number
  crop_type: string
  status: string
  planting_date: string | null
}

export function ParcelList() {
  const [parcels, setParcels] = useState<Parcel[]>([])

  useEffect(() => {
    const fetchParcels = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`${PARCEL_SERVICE_URL}/api/parcels`, {
          headers: { Authorization: `Bearer ${token}` },
        })
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
              <TableHead>Ubicación</TableHead>
              <TableHead>Cultivo</TableHead>
              <TableHead>Área (ha)</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha Siembra</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parcels.map((parcel) => (
              <TableRow key={parcel.id}>
                <TableCell className="font-medium">{parcel.name}</TableCell>
                <TableCell>{parcel.location}</TableCell>
                <TableCell>{parcel.crop_type}</TableCell>
                <TableCell>{parcel.area_hectares}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(parcel.status)}>{parcel.status}</Badge>
                </TableCell>
                <TableCell>
                  {parcel.planting_date ? new Date(parcel.planting_date).toLocaleDateString("es-ES") : "N/A"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
