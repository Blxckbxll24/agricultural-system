import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/mysql"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const parcels = await query<any[]>("SELECT * FROM parcels WHERE id = ?", [id])

    if (parcels.length === 0) {
      return NextResponse.json({ error: "Parcela no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ parcel: parcels[0] })
  } catch (error) {
    console.error("[v0] Get parcel error:", error)
    return NextResponse.json({ error: "Error al obtener parcela" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const body = await request.json()

    await query(
      `UPDATE parcels 
       SET name = ?, location = ?, latitude = ?, longitude = ?, 
           area_hectares = ?, crop_type = ?, planting_date = ?, status = ?
       WHERE id = ?`,
      [
        body.name,
        body.location || "Unknown",
        body.latitude || body.location?.lat || 0,
        body.longitude || body.location?.lng || 0,
        body.area || body.area_hectares || 0,
        body.crop_type,
        body.planting_date || null,
        body.status || "active",
        id,
      ],
    )

    const updated = await query<any[]>("SELECT * FROM parcels WHERE id = ?", [id])

    if (updated.length === 0) {
      return NextResponse.json({ error: "Parcela no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ parcel: updated[0] })
  } catch (error) {
    console.error("[v0] Update parcel error:", error)
    return NextResponse.json({ error: "Error al actualizar parcela" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    const parcels = await query<any[]>("SELECT * FROM parcels WHERE id = ?", [id])

    if (parcels.length === 0) {
      return NextResponse.json({ error: "Parcela no encontrada" }, { status: 404 })
    }

    const parcel = parcels[0]

    await query(
      `INSERT INTO deleted_parcels 
       (parcel_id, name, location, latitude, longitude, area_hectares, crop_type, 
        planting_date, status, created_at, deleted_reason)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        parcel.id,
        parcel.name,
        parcel.location,
        parcel.latitude,
        parcel.longitude,
        parcel.area_hectares,
        parcel.crop_type,
        parcel.planting_date,
        parcel.status,
        parcel.created_at,
        "Eliminada por el usuario",
      ],
    )

    await query("DELETE FROM parcels WHERE id = ?", [id])

    return NextResponse.json({
      message: "Parcela eliminada",
      parcel: { ...parcel, deleted_at: new Date() },
    })
  } catch (error) {
    console.error("[v0] Delete parcel error:", error)
    return NextResponse.json({ error: "Error al eliminar parcela" }, { status: 500 })
  }
}
