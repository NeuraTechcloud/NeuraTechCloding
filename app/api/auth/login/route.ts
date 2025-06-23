iimport { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseAvailable } from "@/lib/db"
import bcrypt from "bcryptjs"
import { sign } from "jsonwebtoken" // Usaremos JWT para criar um token

// Chave secreta para assinar o token JWT. Em produção, use uma variável de ambiente!
const JWT_SECRET = process.env.JWT_SECRET || "sua-chave-secreta-super-segura-em-producao"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log("🔐 Tentativa de login para:", { email })

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email e senha são obrigatórios",
        },
        { status: 400 },
      )
    }

    // A autenticação agora depende exclusivamente do banco de dados.
    const dbAvailable = await isDatabaseAvailable()
    if (!dbAvailable || !sql) {
      return NextResponse.json(
        {
          success: false,
          error: "Serviço indisponível. Tente novamente mais tarde.",
        },
        { status: 503 },
      )
    }

    // Buscar o usuário no banco de dados
    const users = await sql`SELECT * FROM users WHERE email = ${email}`

    if (users.length === 0) {
      console.log("❌ Usuário não encontrado:", email)
      return NextResponse.json({ success: false, error: "Email ou senha incorretos" }, { status: 401 })
    }

    const user = users[0]
    console.log("👤 Usuário encontrado no banco:", user.email, user.user_type)

    // Comparar a senha fornecida com o hash armazenado
    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      console.log("❌ Senha inválida para o usuário:", email)
      return NextResponse.json({ success: false, error: "Email ou senha incorretos" }, { status: 401 })
    }

    // Se a senha estiver correta, a autenticação é bem-sucedida
    console.log("✅ Autenticação bem-sucedida para:", email)

    // Remover o hash da senha do objeto de usuário retornado
    const { password_hash, ...userWithoutPassword } = user

    // Criar um token de sessão (JWT)
    const token = sign(
      {
        userId: user.id,
        userType: user.user_type,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "1d" }, // Token expira em 1 dia
    )

    // Retornar os dados do usuário e o token
    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
    })

    // Adicionar o token em um cookie HttpOnly, que é mais seguro que o localStorage
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 dia
    })

    return response
  } catch (error) {
    console.error("❌ Erro no processo de login:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
