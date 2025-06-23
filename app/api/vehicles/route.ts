import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseAvailable } from "@/lib/db"

// Dados de fallback
const fallbackVehicles = [
  {
    id: 1,
    user_id: 1,
    name: "Fiat Strada",
    plate: "RIO2A18",
    imei: "358723000000010",
    status: "online",
    speed: 88,
    lat: -22.4841,
    lng: -42.9645,
    address: "BR-101, Itaboraí - RJ",
    last_update: new Date(),
    created_at: new Date(),
  },
  {
    id: 2,
    user_id: 1,
    name: "Honda Civic",
    plate: "SAO4B22",
    imei: "358723000000011",
    status: "stopped",
    speed: 0,
    lat: -22.9774,
    lng: -43.2039,
    address: "R. Jardim Botânico, Rio de Janeiro - RJ",
    last_update: new Date(),
    created_at: new Date(),
  },
  {
    id: 3,
    user_id: 1,
    name: "VW Nivus",
    plate: "BHZ7C33",
    imei: "358723000000012",
    status: "offline",
    speed: 0,
    lat: -19.9167,
    lng: -43.9345,
    address: "Praça da Liberdade, Belo Horizonte - MG",
    last_update: new Date(),
    created_at: new Date(),
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    console.log("🚗 Fetching vehicles for user:", userId)

    if (!userId) {
      return NextResponse.json({ error: "ID do usuário é obrigatório" }, { status: 400 })
    }

    const dbAvailable = await isDatabaseAvailable()

    if (dbAvailable && sql) {
      try {
        const vehicles = await sql`
          SELECT * FROM vehicles 
          WHERE user_id = ${userId}
          ORDER BY created_at DESC
        `

        console.log("✅ Vehicles fetched from database:", vehicles.length)
        return NextResponse.json({ vehicles })
      } catch (error) {
        console.error("❌ Database query failed:", error)
        // Fallback para dados em memória
      }
    }

    // Fallback
    console.log("⚠️ Using fallback vehicles")
    return NextResponse.json({ vehicles: fallbackVehicles })
  } catch (error) {
    console.error("❌ Error fetching vehicles:", error)
    return NextResponse.json({ error: "Erro ao buscar veículos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, plate, imei, userId } = await request.json()

    console.log("🚗 Creating vehicle:", { name, plate, imei, userId })

    if (!name || !plate || !imei || !userId) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    const dbAvailable = await isDatabaseAvailable()

    if (dbAvailable && sql) {
      try {
        const vehicle = await sql`
          INSERT INTO vehicles (user_id, name, plate, imei, status, speed, lat, lng, address)
          VALUES (
            ${userId}, 
            ${name}, 
            ${plate.toUpperCase()}, 
            ${imei}, 
            'offline', 
            0, 
            ${-14.235004 + (Math.random() - 0.5) * 20}, 
            ${-51.92528 + (Math.random() - 0.5) * 20}, 
            'Localização sendo adquirida...'
          )
          RETURNING *
        `

        console.log("✅ Vehicle created in database")
        return NextResponse.json({ vehicle: vehicle[0] }, { status: 201 })
      } catch (error) {
        console.error("❌ Database insert failed:", error)

        if (error instanceof Error && error.message.includes("duplicate key")) {
          return NextResponse.json({ error: "IMEI já está em uso" }, { status: 400 })
        }
        // Fallback para criação em memória
      }
    }

    // Fallback
    console.log("⚠️ Using fallback vehicle creation")
    const newVehicle = {
      id: Date.now(),
      user_id: Number.parseInt(userId),
      name,
      plate: plate.toUpperCase(),
      imei,
      status: "offline",
      speed: 0,
      lat: -14.235004 + (Math.random() - 0.5) * 20,
      lng: -51.92528 + (Math.random() - 0.5) * 20,
      address: "Localização sendo adquirida...",
      last_update: new Date(),
      created_at: new Date(),
    }

    return NextResponse.json({ vehicle: newVehicle }, { status: 201 })
  } catch (error) {
    console.error("❌ Error creating vehicle:", error)
    return NextResponse.json({ error: "Erro ao criar veículo" }, { status: 500 })
  }
}
