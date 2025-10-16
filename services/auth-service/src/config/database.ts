import mysql from "mysql2/promise"

// Database configuration with connection pooling
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "agri_user",
  password: process.env.DB_PASSWORD || "agri_password123",
  database: process.env.DB_NAME || "agricultural_system",
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || "10"),
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT || "10000"),
  acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT || "10000"),
}

const pool = mysql.createPool(dbConfig)

// Connection retry configuration
const MAX_RETRIES = parseInt(process.env.DB_MAX_RETRIES || "5")
const INITIAL_RETRY_DELAY = parseInt(process.env.DB_INITIAL_RETRY_DELAY || "1000")

/**
 * Wait for a specified time
 */
const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Test database connection with retry logic and exponential backoff
 */
export const testConnection = async (retries = MAX_RETRIES): Promise<boolean> => {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const connection = await pool.getConnection()
      await connection.ping()
      connection.release()
      console.log(`[Database] MySQL connected successfully (attempt ${attempt}/${retries})`)
      return true
    } catch (error) {
      lastError = error as Error
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1)

      console.warn(
        `[Database] MySQL connection attempt ${attempt}/${retries} failed: ${lastError.message}`
      )

      if (attempt < retries) {
        console.log(`[Database] Retrying in ${delay}ms...`)
        await sleep(delay)
      }
    }
  }

  console.error(`[Database] MySQL connection failed after ${retries} attempts:`, lastError?.message)
  return false
}

/**
 * Get database connection health status
 */
export const getConnectionHealth = async (): Promise<{
  healthy: boolean
  message: string
  details?: any
}> => {
  try {
    const connection = await pool.getConnection()
    await connection.ping()
    connection.release()

    return {
      healthy: true,
      message: "MySQL connection is healthy",
      details: {
        host: dbConfig.host,
        database: dbConfig.database,
        connectionLimit: dbConfig.connectionLimit,
      },
    }
  } catch (error) {
    return {
      healthy: false,
      message: "MySQL connection is unhealthy",
      details: {
        error: (error as Error).message,
        host: dbConfig.host,
        database: dbConfig.database,
      },
    }
  }
}

/**
 * Gracefully close the database pool
 */
export const closePool = async (): Promise<void> => {
  try {
    await pool.end()
    console.log("[Database] MySQL connection pool closed")
  } catch (error) {
    console.error("[Database] Error closing MySQL pool:", (error as Error).message)
  }
}

// Test connection on module load (non-blocking)
testConnection().catch((err) => {
  console.error("[Database] Initial connection test failed:", err)
})

export default pool
