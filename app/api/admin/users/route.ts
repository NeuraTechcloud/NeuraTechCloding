import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseAvailable } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const dbAvailable = await isDatabaseAvailable()

    if (dbAvailable && sql) {
      try {
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

        return NextResponse.json({ users })
      } catch (error) {
        console.error("Database error:", error)
      }
    }

    // Fallback
    const fallbackUsers = [
      {
        id: 1,
        name: "Cliente Demonstração",
        email: "cliente@rastreramos.com",
        user_type: "client",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        vehicle_count: 3,
      },
    ]

    return NextResponse.json({ users: fallbackUsers })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 })
  }
}
