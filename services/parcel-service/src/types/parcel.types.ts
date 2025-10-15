export interface Parcel {
  id: number
  name: string
  location: string
  latitude: number
  longitude: number
  area_hectares: number
  crop_type: string
  planting_date: Date | null
  status: "active" | "inactive" | "maintenance"
  created_at: Date
  updated_at: Date
}

export interface DeletedParcel {
  id: number
  parcel_id: number
  name: string
  location: string
  latitude: number
  longitude: number
  area_hectares: number
  crop_type: string
  planting_date: Date | null
  status: string
  created_at: Date
  deleted_at: Date
  deleted_by: string | null
  deletion_reason: string | null
}

export interface CreateParcelRequest {
  name: string
  location: string
  latitude: number
  longitude: number
  area_hectares: number
  crop_type: string
  planting_date?: string
  status?: "active" | "inactive" | "maintenance"
}

export interface UpdateParcelRequest {
  name?: string
  location?: string
  latitude?: number
  longitude?: number
  area_hectares?: number
  crop_type?: string
  planting_date?: string
  status?: "active" | "inactive" | "maintenance"
}
