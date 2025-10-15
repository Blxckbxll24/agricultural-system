import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import type { TokenPayload } from "../types/user.types"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace("Bearer ", "")

  if (!token) {
    return res.status(401).json({ error: "Access token required" })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
    ;(req as any).user = decoded
    next()
  } catch (error) {
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
