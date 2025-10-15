import { NextResponse } from "next/server"
import { query } from "@/lib/db/mysql"

export async function GET() {
  try {
    const totalResult = await query<any[]>("SELECT COUNT(*) as total, SUM(area_hectares) as total_area FROM parcels")

    const activeResult = await query<any[]>("SELECT COUNT(*) as active FROM parcels WHERE status = 'active'")

    const cropDistResult = await query<any[]>("SELECT crop_type, COUNT(*) as count FROM parcels GROUP BY crop_type")

    const cropDistribution = cropDistResult.reduce(
      (acc, row) => {
        acc[row.crop_type] = row.count
        return acc
      },
      {} as Record<string, number>,
    )

    return NextResponse.json({
      total_parcels: totalResult[0]?.total || 0,
      total_area: totalResult[0]?.total_area || 0,
      active_parcels: activeResult[0]?.active || 0,
      crop_distribution: cropDistribution,
    })
  } catch (error) {
    console.error("[v0] Get stats error:", error)
    return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 })
  }
}
