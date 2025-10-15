import { Suspense } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ParcelList } from "@/components/parcels/parcel-list"
import { DeletedParcelList } from "@/components/parcels/deleted-parcel-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

export default function ParcelsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-balance">Gestión de Parcelas</h1>
          <p className="text-muted-foreground mt-1">
            Administra parcelas activas y consulta el historial de parcelas eliminadas
          </p>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Parcelas Activas</TabsTrigger>
            <TabsTrigger value="deleted">Parcelas Eliminadas</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <Suspense fallback={<Skeleton className="h-96" />}>
              <ParcelList />
            </Suspense>
          </TabsContent>

          <TabsContent value="deleted">
            <Suspense fallback={<Skeleton className="h-96" />}>
              <DeletedParcelList />
            </Suspense>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
