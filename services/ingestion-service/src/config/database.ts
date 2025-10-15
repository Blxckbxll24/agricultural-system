import { MongoClient, type Db } from "mongodb"

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://admin:mongopassword123@localhost:27017/agricultural_sensors?authSource=admin"

let client: MongoClient
let db: Db

export const connectDatabase = async (): Promise<Db> => {
  try {
    client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 50,
      minPoolSize: 10,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
    })

    await client.connect()
    db = client.db("agricultural_sensors")

    console.log("[Database] MongoDB connected successfully")

    // Create indexes
    await createIndexes()

    return db
  } catch (error) {
    console.error("[Database] MongoDB connection failed:", error)
    throw error
  }
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

export const getDatabase = (): Db => {
  if (!db) {
    throw new Error("Database not initialized. Call connectDatabase first.")
  }
  return db
}

export const closeDatabase = async (): Promise<void> => {
  if (client) {
    await client.close()
    console.log("[Database] MongoDB connection closed")
  }
}
