import type { Request, Response, NextFunction } from "express"

interface CustomError extends Error {
  statusCode?: number
  code?: string
}

export const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
  console.error("[Error]", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    code: err.code,
    path: req.path,
    method: req.method,
  })

  // Database connection errors
  if (err.code === "ECONNREFUSED") {
    return res.status(503).json({
      error: "Service temporarily unavailable",
      message: "Database connection failed. Please try again later.",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    })
  }

  // MySQL specific errors
  if (err.code === "ER_ACCESS_DENIED_ERROR") {
    return res.status(500).json({
      error: "Database configuration error",
      message: "Database authentication failed. Please contact support.",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    })
  }

  if (err.code === "ER_BAD_DB_ERROR") {
    return res.status(500).json({
      error: "Database configuration error",
      message: "Database not found. Please contact support.",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    })
  }

  // Timeout errors
  if (err.code === "ETIMEDOUT" || err.message.includes("timeout")) {
    return res.status(504).json({
      error: "Request timeout",
      message: "The operation took too long to complete. Please try again.",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    })
  }

  // Default error response
  const statusCode = err.statusCode || 500
  res.status(statusCode).json({
    error: statusCode === 500 ? "Internal server error" : err.message,
    message: process.env.NODE_ENV === "development" ? err.message : "An unexpected error occurred",
    details: process.env.NODE_ENV === "development" ? err.stack : undefined,
  })
}
