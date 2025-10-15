import { NextResponse } from "next/server"

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

export async function GET() {
  try {
    const totalArea = parcels.reduce((sum, p) => sum + p.area, 0)
    const cropDistribution = parcels.reduce(
      (acc, p) => {
        acc[p.crop_type] = (acc[p.crop_type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return NextResponse.json({
      total_parcels: parcels.length,
      total_area: totalArea,
      active_parcels: parcels.filter((p) => p.status === "active").length,
      crop_distribution: cropDistribution,
    })
  } catch (error) {
    console.error("[v0] Get stats error:", error)
    return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 })
  }
}
