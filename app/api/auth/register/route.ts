import { type NextRequest, NextResponse } from "next/server"
import { createUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    console.log("📝 Register attempt:", { email, name })

    if (!email || !password || !name) {
      return NextResponse.json(
        {
          success: false,
          error: "Email, senha e nome são obrigatórios",
        },
        { status: 400 },
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "A senha deve ter pelo menos 6 caracteres",
        },
        { status: 400 },
      )
    }

    const user = await createUser(email, password, name)

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Email já está em uso ou erro interno",
        },
        { status: 400 },
      )
    }

    // Não retornar a senha hash
    const { password_hash, ...userWithoutPassword } = user

    console.log("✅ User registered:", email)
    return NextResponse.json(
      {
        success: true,
        message: "Usuário criado com sucesso",
        user: userWithoutPassword,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("❌ Registration error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
