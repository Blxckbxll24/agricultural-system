import mysql from "mysql2/promise"

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "agri_user",
  password: process.env.DB_PASSWORD || "agri_password123",
  database: process.env.DB_NAME || "agricultural_system",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
})

// Test connection
pool
  .getConnection()
  .then((connection) => {
    console.log("[Database] MySQL connected successfully")
    connection.release()
  })
  .catch((err) => {
    console.error("[Database] MySQL connection failed:", err.message)
  })

export default pool
