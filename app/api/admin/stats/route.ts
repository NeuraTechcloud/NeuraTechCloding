import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseAvailable } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const dbAvailable = await isDatabaseAvailable()

    if (dbAvailable && sql) {
      try {
        const [userCount] = await sql`SELECT COUNT(*) as count FROM users WHERE user_type = 'client'`
        const [vehicleCount] = await sql`SELECT COUNT(*) as count FROM vehicles`
        const [activeVehicleCount] = await sql`SELECT COUNT(*) as count FROM vehicles WHERE status = 'online'`
        const [offlineVehicleCount] = await sql`SELECT COUNT(*) as count FROM vehicles WHERE status = 'offline'`
        const [newUsersCount] = await sql`
          SELECT COUNT(*) as count FROM users 
          WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE) AND user_type = 'client'
        `

        // Calcular uptime (simulado)
        const uptimeDays = Math.floor(Math.random() * 30) + 1

        return NextResponse.json({
          stats: {
            totalUsers: Number.parseInt(userCount.count),
            totalVehicles: Number.parseInt(vehicleCount.count),
            activeVehicles: Number.parseInt(activeVehicleCount.count),
            offlineVehicles: Number.parseInt(offlineVehicleCount.count),
            newUsersThisMonth: Number.parseInt(newUsersCount.count),
            systemUptime: `${uptimeDays} dias`,
          },
        })
      } catch (error) {
        console.error("Database error:", error)
      }
    }

    // Fallback
    return NextResponse.json({
      stats: {
        totalUsers: 1,
        totalVehicles: 3,
        activeVehicles: 1,
        offlineVehicles: 2,
        newUsersThisMonth: 1,
        systemUptime: "15 dias",
      },
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Erro ao buscar estatísticas" }, { status: 500 })
  }
}
