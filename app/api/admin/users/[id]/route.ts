import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseAvailable } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id
    const { name, email, user_type } = await request.json()

    console.log("✏️ Atualizando usuário:", { userId, name, email, user_type })

    if (!name || !email) {
      return NextResponse.json({ error: "Nome e email são obrigatórios" }, { status: 400 })
    }

    const dbAvailable = await isDatabaseAvailable()

    if (dbAvailable && sql) {
      try {
        // Verificar se email já existe em outro usuário
        const existingUser = await sql`
          SELECT id FROM users WHERE email = ${email} AND id != ${userId}
        `

        if (existingUser.length > 0) {
          return NextResponse.json({ error: "Este email já está em uso por outro usuário" }, { status: 400 })
        }

        // Atualizar usuário
        const result = await sql`
          UPDATE users 
          SET name = ${name}, email = ${email}, user_type = ${user_type}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${userId}
          RETURNING id, name, email, user_type
        `

        if (result.length === 0) {
          return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
        }

        console.log("✅ Usuário atualizado:", result[0])

        return NextResponse.json({
          success: true,
          message: "Usuário atualizado com sucesso",
          user: result[0],
        })
      } catch (error) {
        console.error("❌ Database error:", error)
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
      }
    }

    // Fallback
    console.log("⚠️ Modo demonstração - atualização simulada")
    return NextResponse.json({
      success: true,
      message: "Usuário atualizado com sucesso (modo demonstração)",
      user: { id: Number.parseInt(userId), name, email, user_type },
    })
  } catch (error) {
    console.error("❌ Error updating user:", error)
    return NextResponse.json({ error: "Erro ao atualizar usuário" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id

    console.log("🗑️ Deletando usuário:", userId)

    const dbAvailable = await isDatabaseAvailable()

    if (dbAvailable && sql) {
      try {
        // Deletar veículos do usuário primeiro (devido à foreign key)
        await sql`DELETE FROM vehicles WHERE user_id = ${userId}`

        // Deletar preferências do usuário
        await sql`DELETE FROM user_preferences WHERE user_id = ${userId}`

        // Deletar o usuário
        const result = await sql`DELETE FROM users WHERE id = ${userId} RETURNING id`

        if (result.length === 0) {
          return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
        }

        console.log("✅ Usuário deletado:", userId)

        return NextResponse.json({ success: true, message: "Usuário deletado com sucesso" })
      } catch (error) {
        console.error("❌ Database error:", error)
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
      }
    }

    // Fallback
    console.log("⚠️ Modo demonstração - deleção simulada")
    return NextResponse.json({ success: true, message: "Usuário deletado (modo demonstração)" })
  } catch (error) {
    console.error("❌ Error deleting user:", error)
    return NextResponse.json({ error: "Erro ao deletar usuário" }, { status: 500 })
  }
}
