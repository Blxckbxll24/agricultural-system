import { Suspense } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { MetricsGrid } from "@/components/dashboard/metrics-grid"
import { SensorCharts } from "@/components/dashboard/sensor-charts"
import { ParcelMap } from "@/components/dashboard/parcel-map"
import { CropDistribution } from "@/components/dashboard/crop-distribution"
import { Skeleton } from "@/components/ui/skeleton"
import { DataManagementPanel } from "@/components/dashboard/data-management-panel"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Sistema de Monitoreo Agrícola</h1>
            <p className="text-muted-foreground mt-1">Monitoreo en tiempo real de sensores IoT y gestión de parcelas</p>
          </div>
        </div>

        <DataManagementPanel />

        <Suspense fallback={<MetricsGridSkeleton />}>
          <MetricsGrid />
        </Suspense>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Suspense fallback={<ChartSkeleton />}>
            <SensorCharts />
          </Suspense>

          <Suspense fallback={<ChartSkeleton />}>
            <CropDistribution />
          </Suspense>
        </div>

        <Suspense fallback={<MapSkeleton />}>
          <ParcelMap />
        </Suspense>
      </main>
    </div>
  )
}

function MetricsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
  )
}

function ChartSkeleton() {
  return <Skeleton className="h-96" />
}

function MapSkeleton() {
  return <Skeleton className="h-[500px]" />
}
