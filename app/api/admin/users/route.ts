import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseAvailable } from "@/lib/db"
import { createUser } from "@/lib/auth"

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
      {
        id: 2,
        name: "Administrador",
        email: "admin@rastreramos.com",
        user_type: "admin",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        vehicle_count: 0,
      },
    ]

    return NextResponse.json({ users: fallbackUsers })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, user_type } = await request.json()

    console.log("📝 Criando usuário:", { name, email, user_type })

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nome, email e senha são obrigatórios" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "A senha deve ter pelo menos 6 caracteres" }, { status: 400 })
    }

    const dbAvailable = await isDatabaseAvailable()

    if (dbAvailable && sql) {
      try {
        // Verificar se email já existe
        const existingUser = await sql`
          SELECT id FROM users WHERE email = ${email}
        `

        if (existingUser.length > 0) {
          return NextResponse.json({ error: "Este email já está em uso" }, { status: 400 })
        }

        // Criar usuário usando a função de auth
        const user = await createUser(email, password, name)

        if (!user) {
          return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 })
        }

        // Atualizar tipo de usuário se necessário
        if (user_type && user_type !== "client") {
          await sql`
            UPDATE users SET user_type = ${user_type} WHERE id = ${user.id}
          `
        }

        console.log("✅ Usuário criado com sucesso:", email)

        return NextResponse.json(
          {
            success: true,
            message: "Usuário criado com sucesso",
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              user_type: user_type || "client",
            },
          },
          { status: 201 },
        )
      } catch (error) {
        console.error("❌ Database error:", error)
        if (error instanceof Error && error.message.includes("duplicate key")) {
          return NextResponse.json({ error: "Este email já está em uso" }, { status: 400 })
        }
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
      }
    }

    // Fallback
    console.log("⚠️ Modo demonstração - usuário simulado")
    return NextResponse.json(
      {
        success: true,
        message: "Usuário criado com sucesso (modo demonstração)",
        user: {
          id: Date.now(),
          name,
          email,
          user_type: user_type || "client",
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("❌ Error creating user:", error)
    return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 })
  }
}
