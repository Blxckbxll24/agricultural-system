import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/mysql"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const cropType = searchParams.get("crop_type")
    const showDeleted = searchParams.get("deleted") === "true"

    if (showDeleted) {
      const deletedParcels = await query<any[]>("SELECT * FROM deleted_parcels ORDER BY deleted_at DESC")
      return NextResponse.json({ parcels: deletedParcels })
    }

    let sql = "SELECT * FROM parcels WHERE 1=1"
    const params: any[] = []

    if (status) {
      sql += " AND status = ?"
      params.push(status)
    }

    if (cropType) {
      sql += " AND crop_type = ?"
      params.push(cropType)
    }

    sql += " ORDER BY created_at DESC"

    const parcels = await query<any[]>(sql, params)

    return NextResponse.json({ parcels })
  } catch (error) {
    console.error("[v0] Get parcels error:", error)
    return NextResponse.json({ error: "Error al obtener parcelas" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const result = await query<any>(
      `INSERT INTO parcels (name, location, latitude, longitude, area_hectares, crop_type, planting_date, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.name,
        body.location || "Unknown",
        body.latitude || body.location?.lat || 0,
        body.longitude || body.location?.lng || 0,
        body.area || body.area_hectares || 0,
        body.crop_type,
        body.planting_date || null,
        "active",
      ],
    )

    const newParcel = {
      id: result.insertId,
      ...body,
      status: "active",
      created_at: new Date(),
    }

    return NextResponse.json({ parcel: newParcel }, { status: 201 })
  } catch (error) {
    console.error("[v0] Create parcel error:", error)
    return NextResponse.json({ error: "Error al crear parcela" }, { status: 500 })
  }
}
