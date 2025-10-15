import { type NextRequest, NextResponse } from "next/server"

// Mock parcels database
const parcels = [
  {
    id: 1,
    name: "Parcela Norte",
    area: 5.2,
    crop_type: "Maíz",
    location: { lat: -12.0464, lng: -77.0428 },
    status: "active",
    created_at: new Date("2024-01-15"),
  },
  {
    id: 2,
    name: "Parcela Sur",
    area: 3.8,
    crop_type: "Trigo",
    location: { lat: -12.0474, lng: -77.0438 },
    status: "active",
    created_at: new Date("2024-02-20"),
  },
  {
    id: 3,
    name: "Parcela Este",
    area: 4.5,
    crop_type: "Arroz",
    location: { lat: -12.0454, lng: -77.0418 },
    status: "active",
    created_at: new Date("2024-03-10"),
  },
  {
    id: 4,
    name: "Parcela Oeste",
    area: 6.1,
    crop_type: "Soja",
    location: { lat: -12.0484, lng: -77.0448 },
    status: "active",
    created_at: new Date("2024-01-25"),
  },
]

const deletedParcels: any[] = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const cropType = searchParams.get("crop_type")
    const showDeleted = searchParams.get("deleted") === "true"

    if (showDeleted) {
      return NextResponse.json({ parcels: deletedParcels })
    }

    let filtered = parcels

    if (status) {
      filtered = filtered.filter((p) => p.status === status)
    }

    if (cropType) {
      filtered = filtered.filter((p) => p.crop_type === cropType)
    }

    return NextResponse.json({ parcels: filtered })
  } catch (error) {
    console.error("[v0] Get parcels error:", error)
    return NextResponse.json({ error: "Error al obtener parcelas" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const newParcel = {
      id: parcels.length + 1,
      ...body,
      status: "active",
      created_at: new Date(),
    }

    parcels.push(newParcel)

    return NextResponse.json({ parcel: newParcel }, { status: 201 })
  } catch (error) {
    console.error("[v0] Create parcel error:", error)
    return NextResponse.json({ error: "Error al crear parcela" }, { status: 500 })
  }
}
