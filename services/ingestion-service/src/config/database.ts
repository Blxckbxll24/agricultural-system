import { MongoClient, type Db } from "mongodb"

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://admin:mongopassword123@localhost:27017/agricultural_sensors?authSource=admin"

// Connection retry configuration
const MAX_RETRIES = parseInt(process.env.DB_MAX_RETRIES || "5")
const INITIAL_RETRY_DELAY = parseInt(process.env.DB_INITIAL_RETRY_DELAY || "1000")

let client: MongoClient
let db: Db
let isConnected = false

/**
 * Wait for a specified time
 */
const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Connect to MongoDB with retry logic and exponential backoff
 */
export const connectDatabase = async (retries = MAX_RETRIES): Promise<Db> => {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      client = new MongoClient(MONGODB_URI, {
        maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || "50"),
        minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || "10"),
        maxIdleTimeMS: parseInt(process.env.MONGODB_MAX_IDLE_TIME || "30000"),
        serverSelectionTimeoutMS: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT || "5000"),
        connectTimeoutMS: parseInt(process.env.MONGODB_CONNECT_TIMEOUT || "10000"),
        socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT || "45000"),
      })

      await client.connect()
      db = client.db("agricultural_sensors")
      isConnected = true

      console.log(`[Database] MongoDB connected successfully (attempt ${attempt}/${retries})`)

      // Create indexes
      await createIndexes()

      return db
    } catch (error) {
      lastError = error as Error
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1)

      console.warn(
        `[Database] MongoDB connection attempt ${attempt}/${retries} failed: ${lastError.message}`
      )

      if (attempt < retries) {
        console.log(`[Database] Retrying in ${delay}ms...`)
        await sleep(delay)
      }
    }
  }

  console.error(`[Database] MongoDB connection failed after ${retries} attempts:`, lastError?.message)
  throw new Error(`Failed to connect to MongoDB after ${retries} attempts: ${lastError?.message}`)
}

const createIndexes = async () => {
  try {
    const collection = db.collection("sensor_readings")

    // Compound index for efficient queries
    await collection.createIndex({ parcel_id: 1, timestamp: -1 })
    await collection.createIndex({ sensor_type: 1, timestamp: -1 })
    await collection.createIndex({ timestamp: -1 })
    await collection.createIndex({ parcel_id: 1, sensor_type: 1, timestamp: -1 })

    // Unique index for deduplication
    await collection.createIndex({ parcel_id: 1, sensor_type: 1, timestamp: 1 }, { unique: true, sparse: true })

    console.log("[Database] Indexes created successfully")
  } catch (error) {
    console.error("[Database] Index creation failed:", error)
  }
}

/**
 * Get database instance
 */
export const getDatabase = (): Db => {
  if (!db || !isConnected) {
    throw new Error("Database not initialized. Call connectDatabase first.")
  }
  return db
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
    if (!client || !isConnected) {
      return {
        healthy: false,
        message: "MongoDB client not initialized",
      }
    }

    await client.db("admin").command({ ping: 1 })

    return {
      healthy: true,
      message: "MongoDB connection is healthy",
      details: {
        database: "agricultural_sensors",
        uri: MONGODB_URI.replace(/\/\/.*@/, "//<credentials>@"), // Hide credentials
      },
    }
  } catch (error) {
    return {
      healthy: false,
      message: "MongoDB connection is unhealthy",
      details: {
        error: (error as Error).message,
      },
    }
  }
}

/**
 * Gracefully close the database connection
 */
export const closeDatabase = async (): Promise<void> => {
  if (client) {
    await client.close()
    isConnected = false
    console.log("[Database] MongoDB connection closed")
  }
}
