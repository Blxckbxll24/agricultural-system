import mysql from "mysql2/promise"

let pool: mysql.Pool | null = null

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || "localhost",
      port: Number.parseInt(process.env.MYSQL_PORT || "3306"),
      user: process.env.MYSQL_USER || "agri_user",
      password: process.env.MYSQL_PASSWORD || "agri_password123",
      database: process.env.MYSQL_DATABASE || "agricultural_system",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    })
  }
  return pool
}

export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  const pool = getPool()
  const [results] = await pool.execute(sql, params)
  return results as T
}

export async function closePool() {
  if (pool) {
    await pool.end()
    pool = null
  }
}
