import { neon } from "@neondatabase/serverless"

// Verificar se temos a URL do banco
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL

let sql: any = null

// Inicializar conexão apenas se tivermos a URL
if (DATABASE_URL) {
  try {
    sql = neon(DATABASE_URL)
    console.log("✅ Database connection initialized")
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    sql = null
  }
} else {
  console.log("⚠️ No DATABASE_URL found, using fallback mode")
}

export { sql }

// Função para verificar se o banco está disponível
export async function isDatabaseAvailable(): Promise<boolean> {
  if (!sql) return false

  try {
    await sql`SELECT 1`
    return true
  } catch (error) {
    console.error("Database health check failed:", error)
    return false
  }
}

// Tipos para TypeScript
export interface User {
  id: number
  email: string
  password_hash: string
  name: string
  user_type: "client" | "admin"
  created_at: Date
  updated_at: Date
}

export interface Vehicle {
  id: number
  user_id: number
  name: string
  plate: string
  imei: string
  status: "online" | "stopped" | "offline"
  speed: number
  lat: number
  lng: number
  address: string
  last_update: Date
  created_at: Date
}
