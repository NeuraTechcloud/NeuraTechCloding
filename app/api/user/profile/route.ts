import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseAvailable } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "ID do usuário é obrigatório" }, { status: 400 })
    }

    const dbAvailable = await isDatabaseAvailable()

    if (dbAvailable && sql) {
      try {
        const userResult = await sql`
          SELECT id, name, email, user_type, created_at, updated_at
          FROM users 
          WHERE id = ${userId}
        `

        if (userResult.length === 0) {
          return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
        }

        const user = userResult[0]

        // Buscar preferências (se existir tabela)
        const preferences = {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          realTimeAlerts: true,
          weeklyReports: true,
          maintenanceReminders: true,
          darkMode: true,
          language: "pt-BR",
          timezone: "America/Sao_Paulo",
          mapStyle: "osm_dark",
        }

        return NextResponse.json({
          profile: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: "",
            company: "",
            address: "",
          },
          preferences,
        })
      } catch (error) {
        console.error("Database error:", error)
      }
    }

    // Fallback
    return NextResponse.json({
      profile: {
        id: Number.parseInt(userId),
        name: "Cliente Demonstração",
        email: "cliente@rastreramos.com",
        phone: "",
        company: "",
        address: "",
      },
      preferences: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        realTimeAlerts: true,
        weeklyReports: true,
        maintenanceReminders: true,
        darkMode: true,
        language: "pt-BR",
        timezone: "America/Sao_Paulo",
        mapStyle: "osm_dark",
      },
    })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Erro ao buscar perfil" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, email, phone, company, address } = await request.json()

    if (!id || !name || !email) {
      return NextResponse.json({ error: "ID, nome e email são obrigatórios" }, { status: 400 })
    }

    const dbAvailable = await isDatabaseAvailable()

    if (dbAvailable && sql) {
      try {
        const result = await sql`
          UPDATE users 
          SET name = ${name}, email = ${email}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
          RETURNING id, name, email, user_type
        `

        if (result.length === 0) {
          return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          message: "Perfil atualizado com sucesso",
          user: result[0],
        })
      } catch (error) {
        console.error("Database error:", error)
        if (error instanceof Error && error.message.includes("duplicate key")) {
          return NextResponse.json({ error: "Este email já está em uso" }, { status: 400 })
        }
      }
    }

    // Fallback
    return NextResponse.json({
      success: true,
      message: "Perfil atualizado com sucesso (modo demonstração)",
      user: { id, name, email, user_type: "client" },
    })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Erro ao atualizar perfil" }, { status: 500 })
  }
}
