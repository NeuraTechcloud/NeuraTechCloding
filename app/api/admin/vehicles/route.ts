import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseAvailable } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const dbAvailable = await isDatabaseAvailable()

    if (dbAvailable && sql) {
      try {
        const vehicles = await sql`
          SELECT 
            v.id, 
            v.user_id, 
            v.name, 
            v.plate, 
            v.imei, 
            v.status, 
            v.created_at,
            u.name as user_name
          FROM vehicles v
          LEFT JOIN users u ON v.user_id = u.id
          ORDER BY v.created_at DESC
        `

        return NextResponse.json({ vehicles })
      } catch (error) {
        console.error("Database error:", error)
      }
    }

    // Fallback
    const fallbackVehicles = [
      {
        id: 1,
        user_id: 1,
        name: "Fiat Strada",
        plate: "RIO2A18",
        imei: "358723000000010",
        status: "online",
        created_at: new Date().toISOString(),
        user_name: "Cliente Demonstração",
      },
      {
        id: 2,
        user_id: 1,
        name: "Honda Civic",
        plate: "SAO4B22",
        imei: "358723000000011",
        status: "stopped",
        created_at: new Date().toISOString(),
        user_name: "Cliente Demonstração",
      },
    ]

    return NextResponse.json({ vehicles: fallbackVehicles })
  } catch (error) {
    console.error("Error fetching vehicles:", error)
    return NextResponse.json({ error: "Erro ao buscar veículos" }, { status: 500 })
  }
}
