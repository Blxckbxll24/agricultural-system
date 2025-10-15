"use client"

import { useEffect } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface Parcel {
  id: number
  name: string
  area: number
  crop_type: string
  location: { lat: number; lng: number }
  status: string
}

interface LeafletMapProps {
  parcels: Parcel[]
}

export default function LeafletMap({ parcels }: LeafletMapProps) {
  useEffect(() => {
    const defaultCenter: [number, number] = [-12.0464, -77.0428] // Lima, Peru
    const center: [number, number] =
      parcels.length > 0 ? [parcels[0].location.lat, parcels[0].location.lng] : defaultCenter

    // Initialize map
    const map = L.map("map").setView(center, 13)

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    const customIcon = L.divIcon({
      className: "custom-marker",
      html: '<div style="background-color: hsl(var(--chart-1)); width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })

    // Add markers for each parcel
    parcels.forEach((parcel) => {
      const marker = L.marker([parcel.location.lat, parcel.location.lng], { icon: customIcon }).addTo(map)

      marker.bindPopup(`
        <div style="color: #000; font-family: system-ui;">
          <strong style="font-size: 14px;">${parcel.name}</strong><br/>
          <em style="color: #666;">${parcel.crop_type}</em><br/>
          <span style="font-size: 12px;">Área: ${parcel.area} ha</span><br/>
          <span style="font-size: 12px;">Estado: ${parcel.status}</span>
        </div>
      `)
    })

    // Cleanup
    return () => {
      map.remove()
    }
  }, [parcels])

  return <div id="map" className="w-full h-full" />
}
