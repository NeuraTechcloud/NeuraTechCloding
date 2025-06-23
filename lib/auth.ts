import bcrypt from "bcryptjs"
import { sql, isDatabaseAvailable } from "./db"
import type { User } from "./db"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createUser(email: string, password: string, name: string): Promise<User | null> {
  const dbAvailable = await isDatabaseAvailable()

  if (dbAvailable && sql) {
    try {
      const hashedPassword = await hashPassword(password)

      const result = await sql`
        INSERT INTO users (email, password_hash, name, user_type)
        VALUES (${email}, ${hashedPassword}, ${name}, 'client')
        RETURNING *
      `

      console.log("✅ User created in database")
      return result[0] as User
    } catch (error) {
      console.error("❌ Database user creation failed:", error)
      return null
    }
  }

  return null
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  console.log("🔐 Authenticating user:", email)

  // Usuário de fallback apenas para cliente teste
  const fallbackUsers = [
    {
      id: 1,
      email: "cliente@rastreramos.com",
      password: "senha123",
      name: "Cliente Demonstração",
      user_type: "client",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]

  // Admin deve estar apenas no banco de dados
  if (email === "admin@rastreramos.com") {
    console.log("🔒 Admin login - database only")
    const dbAvailable = await isDatabaseAvailable()

    if (dbAvailable && sql) {
      try {
        const result = await sql`
          SELECT * FROM users WHERE email = ${email} AND user_type = 'admin'
        `

        if (result.length > 0) {
          const user = result[0] as User
          const isValid = await verifyPassword(password, user.password_hash)

          if (isValid) {
            console.log("✅ Admin authentication successful")
            return user
          }
        }
      } catch (error) {
        console.error("❌ Admin authentication failed:", error)
      }
    }

    console.log("❌ Admin authentication failed")
    return null
  }

  // Para outros usuários, verificar fallback primeiro
  const fallbackUser = fallbackUsers.find((u) => u.email === email && u.password === password)
  if (fallbackUser) {
    console.log("✅ Fallback authentication successful:", fallbackUser.user_type)
    const { password: _, ...userWithoutPassword } = fallbackUser
    return {
      ...userWithoutPassword,
      password_hash: await hashPassword(password),
    } as User
  }

  // Tentar banco de dados para outros usuários
  const dbAvailable = await isDatabaseAvailable()
  if (dbAvailable && sql) {
    try {
      const result = await sql`
        SELECT * FROM users WHERE email = ${email}
      `

      if (result.length > 0) {
        const user = result[0] as User
        const isValid = await verifyPassword(password, user.password_hash)

        if (isValid) {
          console.log("✅ Database authentication successful:", user.user_type)
          return user
        }
      }
    } catch (error) {
      console.error("❌ Database authentication failed:", error)
    }
  }

  console.log("❌ Authentication failed for:", email)
  return null
}

export async function getUserById(id: number): Promise<User | null> {
  const dbAvailable = await isDatabaseAvailable()

  if (dbAvailable && sql) {
    try {
      const result = await sql`
        SELECT * FROM users WHERE id = ${id}
      `

      return (result[0] as User) || null
    } catch (error) {
      console.error("Error getting user:", error)
    }
  }

  return null
}
