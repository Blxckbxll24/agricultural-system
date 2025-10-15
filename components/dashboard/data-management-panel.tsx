"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database, Play, Square, Download, Loader2 } from "lucide-react"

export function DataManagementPanel() {
  const [importing, setImporting] = useState(false)
  const [emulationRunning, setEmulationRunning] = useState(false)
  const [importStats, setImportStats] = useState<any>(null)
  const [emulationStatus, setEmulationStatus] = useState<any>(null)

  const handleImportExternal = async () => {
    setImporting(true)
    try {
      const response = await fetch("/api/sensors/import-external", {
        method: "POST",
      })
      const data = await response.json()
      setImportStats(data.stats)
    } catch (error) {
      console.error("[v0] Error importing data:", error)
    } finally {
      setImporting(false)
    }
  }

  const handleStartEmulation = async () => {
    try {
      const response = await fetch("/api/sensors/emulated/start", {
        method: "POST",
      })
      const data = await response.json()
      if (data.success) {
        setEmulationRunning(true)
        setEmulationStatus(data)
      }
    } catch (error) {
      console.error("[v0] Error starting emulation:", error)
    }
  }

  const handleStopEmulation = async () => {
    try {
      const response = await fetch("/api/sensors/emulated/start", {
        method: "DELETE",
      })
      const data = await response.json()
      if (data.success) {
        setEmulationRunning(false)
        setEmulationStatus(data)
      }
    } catch (error) {
      console.error("[v0] Error stopping emulation:", error)
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Importar Datos Externos
          </CardTitle>
          <CardDescription>Importa más de 10,000 registros desde la API externa a MySQL</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleImportExternal} disabled={importing} className="w-full">
            {importing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Importar Datos
              </>
            )}
          </Button>

          {importStats && (
            <div className="space-y-2 rounded-lg border p-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total de registros:</span>
                <Badge variant="secondary">{importStats.totalRecords.toLocaleString()}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duración:</span>
                <Badge variant="secondary">{importStats.duration}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Velocidad:</span>
                <Badge variant="secondary">{importStats.recordsPerSecond.toLocaleString()} rec/s</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Emulación de Sensores
          </CardTitle>
          <CardDescription>Genera datos emulados cada 15 segundos en MongoDB</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={handleStartEmulation}
              disabled={emulationRunning}
              className="flex-1"
              variant={emulationRunning ? "secondary" : "default"}
            >
              <Play className="mr-2 h-4 w-4" />
              Iniciar
            </Button>
            <Button onClick={handleStopEmulation} disabled={!emulationRunning} className="flex-1" variant="destructive">
              <Square className="mr-2 h-4 w-4" />
              Detener
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <span className="text-sm text-muted-foreground">Estado:</span>
            <Badge variant={emulationRunning ? "default" : "secondary"}>
              {emulationRunning ? "Activo (cada 15s)" : "Detenido"}
            </Badge>
          </div>

          {emulationStatus && (
            <div className="rounded-lg border p-3 text-sm text-muted-foreground">{emulationStatus.message}</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
