import bcrypt from "bcryptjs"
import { sql, isDatabaseAvailable } from "./db"
import type { User } from "./db"

// Usuários de fallback (quando não há banco)
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
  {
    id: 2,
    email: "admin@rastreramos.com",
    password: "admin123",
    name: "Administrador",
    user_type: "admin",
    created_at: new Date(),
    updated_at: new Date(),
  },
]

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
  } else {
    // Fallback: simular criação
    console.log("⚠️ Using fallback user creation")
    const newUser = {
      id: Date.now(),
      email,
      password_hash: await hashPassword(password),
      name,
      user_type: "client" as const,
      created_at: new Date(),
      updated_at: new Date(),
    }
    return newUser
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const dbAvailable = await isDatabaseAvailable()

  if (dbAvailable && sql) {
    try {
      const result = await sql`
        SELECT * FROM users WHERE email = ${email}
      `

      if (result.length === 0) {
        console.log("❌ User not found in database")
        return null
      }

      const user = result[0] as User
      const isValid = await verifyPassword(password, user.password_hash)

      if (!isValid) {
        console.log("❌ Invalid password")
        return null
      }

      console.log("✅ User authenticated from database")
      return user
    } catch (error) {
      console.error("❌ Database authentication failed:", error)
      // Fallback para usuários em memória
    }
  }

  // Fallback: verificar usuários em memória
  console.log("⚠️ Using fallback authentication")
  const user = fallbackUsers.find((u) => u.email === email && u.password === password)

  if (user) {
    const { password: _, ...userWithoutPassword } = user
    return {
      ...userWithoutPassword,
      password_hash: await hashPassword(password),
    } as User
  }

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

  // Fallback
  const user = fallbackUsers.find((u) => u.id === id)
  if (user) {
    const { password: _, ...userWithoutPassword } = user
    return {
      ...userWithoutPassword,
      password_hash: "hashed",
    } as User
  }

  return null
}
