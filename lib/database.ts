import mysql from "mysql2/promise"

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "finance_app",
  port: Number.parseInt(process.env.DB_PORT || "3306"),
  ssl: {
    rejectUnauthorized: false 
  },
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000,
}

let connection: mysql.Connection | null = null

export async function getConnection() {
  try {
    if (!connection) {
      connection = await mysql.createConnection(dbConfig)
    }
    await connection.ping()
    return connection
  } catch (error) {
    console.error('Database connection error:', error)
    connection = await mysql.createConnection(dbConfig)
    return connection
  }
}

export async function query(sql: string, params: any[] = []) {
  try {
    const conn = await getConnection()
    const [results] = await conn.query(sql, params)
    return results
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}
