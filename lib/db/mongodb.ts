import { MongoClient, type Db } from "mongodb"

let client: MongoClient | null = null
let db: Db | null = null

export async function getMongoDb(): Promise<Db> {
  if (!client || !db) {
    const uri =
      process.env.MONGODB_URI ||
      "mongodb://admin:mongopassword123@localhost:27017/agricultural_sensors?authSource=admin"

    client = new MongoClient(uri)
    await client.connect()
    db = client.db("agricultural_sensors")

    console.log("[v0] Connected to MongoDB")
  }

  return db
}

export async function closeMongoDb() {
  if (client) {
    await client.close()
    client = null
    db = null
  }
}
