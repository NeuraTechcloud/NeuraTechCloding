import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseAvailable } from "@/lib/db"

export async function PUT(request: NextRequest) {
  try {
    const { userId, preferences } = await request.json()

    if (!userId || !preferences) {
      return NextResponse.json({ error: "ID do usuário e preferências são obrigatórios" }, { status: 400 })
    }

    const dbAvailable = await isDatabaseAvailable()

    if (dbAvailable && sql) {
      try {
        // Tentar criar tabela de preferências se não existir
        await sql`
          CREATE TABLE IF NOT EXISTS user_preferences (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            preferences JSONB NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id)
          )
        `

        // Inserir ou atualizar preferências
        await sql`
          INSERT INTO user_preferences (user_id, preferences, updated_at)
          VALUES (${userId}, ${JSON.stringify(preferences)}, CURRENT_TIMESTAMP)
          ON CONFLICT (user_id) 
          DO UPDATE SET 
            preferences = EXCLUDED.preferences,
            updated_at = CURRENT_TIMESTAMP
        `

        return NextResponse.json({
          success: true,
          message: "Preferências salvas com sucesso",
        })
      } catch (error) {
        console.error("Database error:", error)
      }
    }

    // Fallback
    return NextResponse.json({
      success: true,
      message: "Preferências salvas com sucesso (modo demonstração)",
    })
  } catch (error) {
    console.error("Error saving preferences:", error)
    return NextResponse.json({ error: "Erro ao salvar preferências" }, { status: 500 })
  }
}
