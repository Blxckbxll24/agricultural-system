"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const PARCEL_SERVICE_URL = process.env.NEXT_PUBLIC_PARCEL_SERVICE_URL || "http://localhost:3002"

interface DeletedParcel {
  id: number
  parcel_id: number
  name: string
  location: string
  crop_type: string
  deleted_at: string
  deleted_by: string | null
  deletion_reason: string | null
}

export function DeletedParcelList() {
  const [parcels, setParcels] = useState<DeletedParcel[]>([])

  useEffect(() => {
    const fetchDeletedParcels = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`${PARCEL_SERVICE_URL}/api/parcels/deleted`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()
        setParcels(data.deleted_parcels || [])
      } catch (error) {
        console.error("[v0] Failed to fetch deleted parcels:", error)
      }
    }

    fetchDeletedParcels()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parcelas Eliminadas</CardTitle>
        <CardDescription>Historial de parcelas que han sido removidas del sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Cultivo</TableHead>
              <TableHead>Fecha Eliminación</TableHead>
              <TableHead>Eliminado Por</TableHead>
              <TableHead>Razón</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parcels.map((parcel) => (
              <TableRow key={parcel.id}>
                <TableCell className="font-medium">{parcel.name}</TableCell>
                <TableCell>{parcel.location}</TableCell>
                <TableCell>{parcel.crop_type}</TableCell>
                <TableCell>{new Date(parcel.deleted_at).toLocaleDateString("es-ES")}</TableCell>
                <TableCell>{parcel.deleted_by || "N/A"}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {parcel.deletion_reason || "Sin razón especificada"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
