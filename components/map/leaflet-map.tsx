"use client"

import { useEffect } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface Parcel {
  id: number
  name: string
  location: string
  latitude: number
  longitude: number
  crop_type: string
  status: string
}

interface LeafletMapProps {
  parcels: Parcel[]
}

export default function LeafletMap({ parcels }: LeafletMapProps) {
  useEffect(() => {
    // Initialize map
    const map = L.map("map").setView([19.432608, -99.133209], 13)

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    // Add markers for each parcel
    parcels.forEach((parcel) => {
      const marker = L.marker([parcel.latitude, parcel.longitude]).addTo(map)

      marker.bindPopup(`
        <div style="color: #000;">
          <strong>${parcel.name}</strong><br/>
          <em>${parcel.crop_type}</em><br/>
          ${parcel.location}<br/>
          Estado: ${parcel.status}
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
