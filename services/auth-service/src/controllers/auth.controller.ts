import type { Request, Response } from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { validationResult } from "express-validator"
import pool from "../config/database"
import type { User, TokenPayload } from "../types/user.types"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || "24h"

export class AuthController {
  // Register new user
  static async register(req: Request, res: Response) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { username, email, password, full_name, role = "viewer" } = req.body

      // Check if user already exists
      const [existingUsers] = await pool.query<User[]>("SELECT id FROM users WHERE username = ? OR email = ?", [
        username,
        email,
      ])

      if (existingUsers.length > 0) {
        return res.status(409).json({ error: "Username or email already exists" })
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 10)

      // Insert user
      const [result] = await pool.query(
        "INSERT INTO users (username, email, password_hash, role, full_name) VALUES (?, ?, ?, ?, ?)",
        [username, email, password_hash, role, full_name || null],
      )

      const userId = (result as any).insertId

      // Generate token
      const token = jwt.sign({ userId, username, role } as TokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRATION })

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: userId,
          username,
          email,
          role,
          full_name: full_name || null,
        },
      })
    } catch (error) {
      console.error("[Auth] Register error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }

  // Login user
  static async login(req: Request, res: Response) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { username, password } = req.body

      // Find user
      const [users] = await pool.query<User[]>("SELECT * FROM users WHERE username = ? AND is_active = true", [
        username,
      ])

      if (users.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" })
      }

      const user = users[0]

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash)
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" })
      }

      // Update last login
      await pool.query("UPDATE users SET last_login = NOW() WHERE id = ?", [user.id])

      // Generate token
      const token = jwt.sign(
        { userId: user.id, username: user.username, role: user.role } as TokenPayload,
        JWT_SECRET,
        { expiresIn: JWT_EXPIRATION },
      )

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          full_name: user.full_name,
        },
      })
    } catch (error) {
      console.error("[Auth] Login error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }

  // Verify token
  static async verify(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "")

      if (!token) {
        return res.status(401).json({ error: "No token provided" })
      }

      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload

      // Get user details
      const [users] = await pool.query<User[]>(
        "SELECT id, username, email, role, full_name, is_active FROM users WHERE id = ? AND is_active = true",
        [decoded.userId],
      )

      if (users.length === 0) {
        return res.status(401).json({ error: "User not found or inactive" })
      }

      res.json({
        valid: true,
        user: {
          id: users[0].id,
          username: users[0].username,
          email: users[0].email,
          role: users[0].role,
          full_name: users[0].full_name,
        },
      })
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ error: "Invalid token" })
      }
      console.error("[Auth] Verify error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }

  // Get user profile
  static async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId

      const [users] = await pool.query<User[]>(
        "SELECT id, username, email, role, full_name, is_active, created_at, last_login FROM users WHERE id = ?",
        [userId],
      )

      if (users.length === 0) {
        return res.status(404).json({ error: "User not found" })
      }

      res.json({ user: users[0] })
    } catch (error) {
      console.error("[Auth] Get profile error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }
}
