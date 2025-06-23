import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseAvailable } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log("🔐 Login attempt:", { email })

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email e senha são obrigatórios",
        },
        { status: 400 },
      )
    }

    // Usuário de fallback apenas para cliente teste
    const fallbackUsers = [
      {
        id: 1,
        email: "cliente@rastreramos.com",
        password: "senha123",
        name: "Cliente Demonstração",
        user_type: "client",
      },
    ]

    // Admin único - apenas no banco de dados
    if (email === "admin@rastreramos.com") {
      console.log("🔍 Admin login attempt - checking database only...")

      const dbAvailable = await isDatabaseAvailable()
      if (dbAvailable && sql) {
        try {
          const users = await sql`
            SELECT * FROM users WHERE email = ${email} AND user_type = 'admin'
          `

          if (users.length > 0) {
            const user = users[0]
            const isValidPassword = await bcrypt.compare(password, user.password_hash)

            if (isValidPassword) {
              console.log("✅ Admin authentication successful")
              const { password_hash, ...userWithoutPassword } = user
              return NextResponse.json({
                success: true,
                user: userWithoutPassword,
              })
            } else {
              console.log("❌ Invalid admin password")
            }
          } else {
            console.log("❌ Admin user not found in database")
          }
        } catch (error) {
          console.error("❌ Database error for admin:", error)
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: "Credenciais de administrador inválidas",
        },
        { status: 401 },
      )
    }

    // Para outros usuários, verificar fallback primeiro
    console.log("🔍 Checking fallback users...")
    const fallbackUser = fallbackUsers.find((u) => u.email === email && u.password === password)

    if (fallbackUser) {
      console.log("✅ Fallback authentication successful:", fallbackUser.user_type)
      const { password: _, ...userWithoutPassword } = fallbackUser
      return NextResponse.json({
        success: true,
        user: userWithoutPassword,
      })
    }

    // Tentar banco de dados para outros usuários
    const dbAvailable = await isDatabaseAvailable()
    if (dbAvailable && sql) {
      try {
        console.log("🔍 Searching user in database...")
        const users = await sql`
          SELECT * FROM users WHERE email = ${email}
        `

        if (users.length > 0) {
          const user = users[0]
          console.log("👤 User found in database:", user.email, user.user_type)

          const isValidPassword = await bcrypt.compare(password, user.password_hash)
          if (isValidPassword) {
            console.log("✅ Database authentication successful")
            const { password_hash, ...userWithoutPassword } = user
            return NextResponse.json({
              success: true,
              user: userWithoutPassword,
            })
          } else {
            console.log("❌ Invalid password for database user")
          }
        } else {
          console.log("❌ User not found in database")
        }
      } catch (error) {
        console.error("❌ Database error:", error)
      }
    }

    console.log("❌ Authentication failed for:", email)
    return NextResponse.json(
      {
        success: false,
        error: "Email ou senha incorretos",
      },
      { status: 401 },
    )
  } catch (error) {
    console.error("❌ Login error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
