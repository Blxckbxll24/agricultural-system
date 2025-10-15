"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from "next/dynamic"

const API_URL = "http://localhost:3002/api"

// Dynamically import Leaflet to avoid SSR issues
const MapComponent = dynamic(() => import("@/components/map/leaflet-map"), { ssr: false })

interface Parcel {
  id: number
  name: string
  area: number
  crop_type: string
  location: { lat: number; lng: number }
  status: string
}

export function ParcelMap() {
  const [parcels, setParcels] = useState<Parcel[]>([])

  useEffect(() => {
    const fetchParcels = async () => {
      try {
        const response = await fetch(`${API_URL}/parcels?status=active`)
        const data = await response.json()
        setParcels(data.parcels || [])
      } catch (error) {
        console.error("[v0] Failed to fetch parcels:", error)
      }
    }

    fetchParcels()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mapa de Parcelas Activas</CardTitle>
        <CardDescription>Ubicación geográfica de todas las parcelas en operación</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] rounded-lg overflow-hidden">
          <MapComponent parcels={parcels} />
        </div>
      </CardContent>
    </Card>
  )
}
