"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, Loader2, Trash2, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SensorDataGenerator() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/sensors/generate", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || "Error al generar datos")
      }
    } catch (err) {
      setError("Error de conexión al generar datos")
      console.error("[v0] Generate error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/sensors/generate", {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        setResult(null)
        alert(data.message)
      } else {
        setError(data.error || "Error al limpiar datos")
      }
    } catch (err) {
      setError("Error de conexión al limpiar datos")
      console.error("[v0] Clear error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Generador de Datos de Sensores
        </CardTitle>
        <CardDescription>
          Genera más de 10,000 registros de sensores para pruebas de estrés y demostración
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={handleGenerate} disabled={loading} className="flex-1">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Generar 10,000+ Registros
              </>
            )}
          </Button>

          {result && (
            <Button onClick={handleClear} disabled={loading} variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          )}
        </div>

        {result && (
          <Alert className="bg-accent/50 border-accent">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-semibold">{result.message}</p>
                <div className="text-sm space-y-0.5">
                  <p>Total de registros: {result.recordCount.toLocaleString()}</p>
                  <p>Velocidad: {result.recordsPerSecond.toLocaleString()} registros/segundo</p>
                  <p>Cumple requisito: {result.recordCount >= 10000 && result.duration < 60 ? "✓ Sí" : "✗ No"}</p>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground space-y-1">
          <p>Requisito del proyecto:</p>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            <li>Generar más de 10,000 registros</li>
            <li>Tiempo de generación menor a 1 minuto</li>
            <li>Procesamiento concurrente y asincrónico</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
