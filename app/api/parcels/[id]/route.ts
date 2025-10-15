import { type NextRequest, NextResponse } from "next/server"

// Import the parcels array (in a real app, this would be a database)
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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const parcel = parcels.find((p) => p.id === id)

    if (!parcel) {
      return NextResponse.json({ error: "Parcela no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ parcel })
  } catch (error) {
    console.error("[v0] Get parcel error:", error)
    return NextResponse.json({ error: "Error al obtener parcela" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const body = await request.json()
    const index = parcels.findIndex((p) => p.id === id)

    if (index === -1) {
      return NextResponse.json({ error: "Parcela no encontrada" }, { status: 404 })
    }

    parcels[index] = { ...parcels[index], ...body }

    return NextResponse.json({ parcel: parcels[index] })
  } catch (error) {
    console.error("[v0] Update parcel error:", error)
    return NextResponse.json({ error: "Error al actualizar parcela" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const index = parcels.findIndex((p) => p.id === id)

    if (index === -1) {
      return NextResponse.json({ error: "Parcela no encontrada" }, { status: 404 })
    }

    const deletedParcel = {
      ...parcels[index],
      deleted_at: new Date(),
      deleted_reason: "Eliminada por el usuario",
    }

    deletedParcels.push(deletedParcel)
    parcels.splice(index, 1)

    return NextResponse.json({ message: "Parcela eliminada", parcel: deletedParcel })
  } catch (error) {
    console.error("[v0] Delete parcel error:", error)
    return NextResponse.json({ error: "Error al eliminar parcela" }, { status: 500 })
  }
}
