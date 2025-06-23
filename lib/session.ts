import { type NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"

// A mesma chave secreta usada no login
const JWT_SECRET = process.env.JWT_SECRET || "sua-chave-secreta-super-segura-em-producao"

interface TokenPayload {
  userId: number
  userType: string
  email: string
}

type ApiHandler = (request: NextRequest, context: { params: any }) => Promise<NextResponse>

/**
 * Middleware para proteger rotas da API que exigem permissão de administrador.
 * Ele verifica um token JWT enviado via cookies.
 * @param handler O handler da rota da API a ser protegido.
 * @returns Um novo handler que primeiro verifica a autenticação e autorização.
 */
export function withAdminAuth(handler: ApiHandler): ApiHandler {
  return async (request: NextRequest, context: { params: any }) => {
    const tokenCookie = request.cookies.get("token")

    if (!tokenCookie) {
      console.warn("🚫 Acesso negado: Cookie de autenticação não encontrado.")
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 })
    }

    const token = tokenCookie.value

    try {
      const decoded = verify(token, JWT_SECRET) as TokenPayload

      if (decoded.userType !== "admin") {
        console.warn(`🚫 Tentativa de acesso de admin negada: Usuário '${decoded.email}' não é admin.`)
        return NextResponse.json({ error: "Acesso proibido. Permissões insuficientes." }, { status: 403 })
      }

      console.log(`✅ Acesso de admin autorizado para: ${decoded.email}`)
      return handler(request, context)
    } catch (error) {
      console.error("🚫 Erro de autenticação: Token inválido ou expirado.", error)
      return NextResponse.json({ error: "Token inválido ou expirado." }, { status: 401 })
    }
  }
}
