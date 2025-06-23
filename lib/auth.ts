import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  name: string
  password: string
}

export async function authenticateUser(credentials: LoginCredentials) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
      select: {
        id: true,
        email: true,
        name: true,
        userType: true,
        password: true,
      },
    })

    if (!user) {
      return null
    }

    const isValidPassword = await bcrypt.compare(credentials.password, user.password)

    if (!isValidPassword) {
      return null
    }

    // Remove password from return
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}

export async function createUser(data: RegisterData) {
  try {
    const hashedPassword = await bcrypt.hash(data.password, 12)

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        userType: true,
      },
    })

    return user
  } catch (error) {
    console.error("User creation error:", error)
    throw error
  }
}
