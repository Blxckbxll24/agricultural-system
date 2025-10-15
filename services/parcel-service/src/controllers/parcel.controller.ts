import type { Request, Response } from "express"
import { validationResult } from "express-validator"
import pool from "../config/database"
import type { Parcel, DeletedParcel } from "../types/parcel.types"

export class ParcelController {
  // Get all parcels
  static async getAllParcels(req: Request, res: Response) {
    try {
      const { status, crop_type, limit = 100, offset = 0 } = req.query

      let query = "SELECT * FROM parcels WHERE 1=1"
      const params: any[] = []

      if (status) {
        query += " AND status = ?"
        params.push(status)
      }

      if (crop_type) {
        query += " AND crop_type = ?"
        params.push(crop_type)
      }

      query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
      params.push(Number(limit), Number(offset))

      const [parcels] = await pool.query<Parcel[]>(query, params)

      // Get total count
      let countQuery = "SELECT COUNT(*) as total FROM parcels WHERE 1=1"
      const countParams: any[] = []

      if (status) {
        countQuery += " AND status = ?"
        countParams.push(status)
      }

      if (crop_type) {
        countQuery += " AND crop_type = ?"
        countParams.push(crop_type)
      }

      const [countResult] = await pool.query<any[]>(countQuery, countParams)
      const total = countResult[0].total

      res.json({
        parcels,
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: Number(offset) + parcels.length < total,
        },
      })
    } catch (error) {
      console.error("[Parcel] Get all error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }

  // Get parcel by ID
  static async getParcelById(req: Request, res: Response) {
    try {
      const { id } = req.params

      const [parcels] = await pool.query<Parcel[]>("SELECT * FROM parcels WHERE id = ?", [id])

      if (parcels.length === 0) {
        return res.status(404).json({ error: "Parcel not found" })
      }

      res.json({ parcel: parcels[0] })
    } catch (error) {
      console.error("[Parcel] Get by ID error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }

  // Create parcel
  static async createParcel(req: Request, res: Response) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const {
        name,
        location,
        latitude,
        longitude,
        area_hectares,
        crop_type,
        planting_date,
        status = "active",
      } = req.body

      const [result] = await pool.query(
        "INSERT INTO parcels (name, location, latitude, longitude, area_hectares, crop_type, planting_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [name, location, latitude, longitude, area_hectares, crop_type, planting_date || null, status],
      )

      const parcelId = (result as any).insertId

      const [newParcel] = await pool.query<Parcel[]>("SELECT * FROM parcels WHERE id = ?", [parcelId])

      res.status(201).json({
        message: "Parcel created successfully",
        parcel: newParcel[0],
      })
    } catch (error) {
      console.error("[Parcel] Create error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }

  // Update parcel
  static async updateParcel(req: Request, res: Response) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { id } = req.params
      const updates = req.body

      // Check if parcel exists
      const [existingParcels] = await pool.query<Parcel[]>("SELECT * FROM parcels WHERE id = ?", [id])

      if (existingParcels.length === 0) {
        return res.status(404).json({ error: "Parcel not found" })
      }

      // Build update query dynamically
      const fields: string[] = []
      const values: any[] = []

      Object.keys(updates).forEach((key) => {
        if (updates[key] !== undefined) {
          fields.push(`${key} = ?`)
          values.push(updates[key])
        }
      })

      if (fields.length === 0) {
        return res.status(400).json({ error: "No fields to update" })
      }

      values.push(id)

      await pool.query(`UPDATE parcels SET ${fields.join(", ")} WHERE id = ?`, values)

      const [updatedParcel] = await pool.query<Parcel[]>("SELECT * FROM parcels WHERE id = ?", [id])

      res.json({
        message: "Parcel updated successfully",
        parcel: updatedParcel[0],
      })
    } catch (error) {
      console.error("[Parcel] Update error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }

  // Delete parcel (soft delete with tracking)
  static async deleteParcel(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { deleted_by, deletion_reason } = req.body

      // Get parcel data before deletion
      const [parcels] = await pool.query<Parcel[]>("SELECT * FROM parcels WHERE id = ?", [id])

      if (parcels.length === 0) {
        return res.status(404).json({ error: "Parcel not found" })
      }

      const parcel = parcels[0]

      // Insert into deleted_parcels table
      await pool.query(
        "INSERT INTO deleted_parcels (parcel_id, name, location, latitude, longitude, area_hectares, crop_type, planting_date, status, created_at, deleted_by, deletion_reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
          deleted_by || null,
          deletion_reason || null,
        ],
      )

      // Delete from parcels table
      await pool.query("DELETE FROM parcels WHERE id = ?", [id])

      res.json({
        message: "Parcel deleted successfully",
        deleted_parcel: {
          id: parcel.id,
          name: parcel.name,
          deleted_at: new Date(),
        },
      })
    } catch (error) {
      console.error("[Parcel] Delete error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }

  // Get deleted parcels
  static async getDeletedParcels(req: Request, res: Response) {
    try {
      const { limit = 100, offset = 0 } = req.query

      const [deletedParcels] = await pool.query<DeletedParcel[]>(
        "SELECT * FROM deleted_parcels ORDER BY deleted_at DESC LIMIT ? OFFSET ?",
        [Number(limit), Number(offset)],
      )

      const [countResult] = await pool.query<any[]>("SELECT COUNT(*) as total FROM deleted_parcels")
      const total = countResult[0].total

      res.json({
        deleted_parcels: deletedParcels,
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: Number(offset) + deletedParcels.length < total,
        },
      })
    } catch (error) {
      console.error("[Parcel] Get deleted error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }

  // Get statistics
  static async getStatistics(req: Request, res: Response) {
    try {
      const [stats] = await pool.query<any[]>(`
        SELECT 
          COUNT(*) as total_parcels,
          SUM(area_hectares) as total_area,
          AVG(area_hectares) as avg_area,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_parcels,
          COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_parcels,
          COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as maintenance_parcels
        FROM parcels
      `)

      const [cropStats] = await pool.query<any[]>(`
        SELECT 
          crop_type,
          COUNT(*) as count,
          SUM(area_hectares) as total_area
        FROM parcels
        GROUP BY crop_type
        ORDER BY count DESC
      `)

      res.json({
        statistics: stats[0],
        crop_distribution: cropStats,
      })
    } catch (error) {
      console.error("[Parcel] Get statistics error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }
}
