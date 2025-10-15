import type { Request, Response, NextFunction } from "express"
import axios from "axios"

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:3001"

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace("Bearer ", "")

  if (!token) {
    return res.status(401).json({ error: "Access token required" })
  }

  try {
    // Verify token with auth service
    const response = await axios.get(`${AUTH_SERVICE_URL}/api/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (response.data.valid) {
      ;(req as any).user = response.data.user
      next()
    } else {
      return res.status(403).json({ error: "Invalid token" })
    }
  } catch (error) {
    console.error("[Auth] Token verification failed:", error)
    return res.status(403).json({ error: "Invalid or expired token" })
  }
}

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user

    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" })
    }

    next()
  }
}
