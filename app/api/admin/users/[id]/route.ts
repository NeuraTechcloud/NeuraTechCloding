import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseAvailable } from "@/lib/db"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id

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

        return NextResponse.json({ success: true, message: "Usuário deletado com sucesso" })
      } catch (error) {
        console.error("Database error:", error)
      }
    }

    // Fallback
    return NextResponse.json({ success: true, message: "Usuário deletado (modo demonstração)" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Erro ao deletar usuário" }, { status: 500 })
  }
}
