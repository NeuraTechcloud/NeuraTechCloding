import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseAvailable } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { type: string } }) {
  try {
    const { type } = params

    const dbAvailable = await isDatabaseAvailable()

    if (dbAvailable && sql) {
      try {
        if (type === "users") {
          const users = await sql`
            SELECT 
              u.id, 
              u.name, 
              u.email, 
              u.user_type, 
              u.created_at, 
              u.updated_at,
              COUNT(v.id) as vehicle_count
            FROM users u
            LEFT JOIN vehicles v ON u.id = v.user_id
            GROUP BY u.id, u.name, u.email, u.user_type, u.created_at, u.updated_at
            ORDER BY u.created_at DESC
          `
          return NextResponse.json({ users, exported_at: new Date().toISOString() })
        } else if (type === "vehicles") {
          const vehicles = await sql`
            SELECT 
              v.*, 
              u.name as user_name, 
              u.email as user_email
            FROM vehicles v
            LEFT JOIN users u ON v.user_id = u.id
            ORDER BY v.created_at DESC
          `
          return NextResponse.json({ vehicles, exported_at: new Date().toISOString() })
        }
      } catch (error) {
        console.error("Database error:", error)
      }
    }

    // Fallback
    return NextResponse.json({
      message: "Dados de demonstração",
      exported_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error exporting data:", error)
    return NextResponse.json({ error: "Erro ao exportar dados" }, { status: 500 })
  }
}
