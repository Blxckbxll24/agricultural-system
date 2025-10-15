export interface SensorReading {
  parcel_id: number
  sensor_type: "temperature" | "humidity" | "rain" | "solar_radiation"
  value: number
  unit: string
  timestamp: Date
  quality: "good" | "fair" | "poor"
  metadata?: {
    sensor_id?: string
    location?: string
    [key: string]: any
  }
}

export interface ExternalSensorData {
  id?: string
  parcelId?: number
  type?: string
  value?: number
  unit?: string
  timestamp?: string
  [key: string]: any
}

export interface IngestionStats {
  total_received: number
  total_inserted: number
  total_duplicates: number
  total_errors: number
  duration_ms: number
  records_per_second: number
}

export interface SensorQuery {
  parcel_id?: number
  sensor_type?: string
  start_date?: Date
  end_date?: Date
  limit?: number
  offset?: number
}
