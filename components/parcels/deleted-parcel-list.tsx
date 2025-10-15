"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const API_URL = "http://localhost:3002/api"

interface DeletedParcel {
  id: number
  name: string
  crop_type: string
  deleted_at: string
  deleted_reason: string
}

export function DeletedParcelList() {
  const [parcels, setParcels] = useState<DeletedParcel[]>([])

  useEffect(() => {
    const fetchDeletedParcels = async () => {
      try {
        const response = await fetch(`${API_URL}/parcels?deleted=true`)
        const data = await response.json()
        setParcels(data.parcels || [])
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
              <TableHead>Cultivo</TableHead>
              <TableHead>Fecha Eliminación</TableHead>
              <TableHead>Razón</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parcels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No hay parcelas eliminadas
                </TableCell>
              </TableRow>
            ) : (
              parcels.map((parcel) => (
                <TableRow key={parcel.id}>
                  <TableCell className="font-medium">{parcel.name}</TableCell>
                  <TableCell>{parcel.crop_type}</TableCell>
                  <TableCell>{new Date(parcel.deleted_at).toLocaleDateString("es-ES")}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {parcel.deleted_reason || "Sin razón especificada"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
