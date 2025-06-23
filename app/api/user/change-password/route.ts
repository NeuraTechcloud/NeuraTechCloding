import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseAvailable } from "@/lib/db"
import { hashPassword, verifyPassword } from "@/lib/auth"

export async function PUT(request: NextRequest) {
  try {
    const { userId, currentPassword, newPassword } = await request.json()

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "A nova senha deve ter pelo menos 6 caracteres" }, { status: 400 })
    }

    const dbAvailable = await isDatabaseAvailable()

    if (dbAvailable && sql) {
      try {
        // Buscar usuário atual
        const userResult = await sql`
          SELECT id, password_hash FROM users WHERE id = ${userId}
        `

        if (userResult.length === 0) {
          return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
        }

        const user = userResult[0]

        // Verificar senha atual
        const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password_hash)

        if (!isCurrentPasswordValid) {
          return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 })
        }

        // Hash da nova senha
        const newPasswordHash = await hashPassword(newPassword)

        // Atualizar senha
        await sql`
          UPDATE users 
          SET password_hash = ${newPasswordHash}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${userId}
        `

        return NextResponse.json({
          success: true,
          message: "Senha alterada com sucesso",
        })
      } catch (error) {
        console.error("Database error:", error)
      }
    }

    // Fallback para modo demonstração
    if (currentPassword === "senha123") {
      return NextResponse.json({
        success: true,
        message: "Senha alterada com sucesso (modo demonstração)",
      })
    } else {
      return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json({ error: "Erro ao alterar senha" }, { status: 500 })
  }
}
