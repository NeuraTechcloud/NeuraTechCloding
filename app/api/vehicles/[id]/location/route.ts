import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { lat, lng, speed, address } = await request.json()
    const vehicleId = params.id

    if (!lat || !lng || speed === undefined) {
      return NextResponse.json({ error: "Latitude, longitude e velocidade são obrigatórios" }, { status: 400 })
    }

    const vehicle = await sql`
      UPDATE vehicles 
      SET lat = ${lat}, lng = ${lng}, speed = ${speed}, address = ${address}, 
          status = 'online', last_update = CURRENT_TIMESTAMP
      WHERE id = ${vehicleId}
      RETURNING *
    `

    if (vehicle.length === 0) {
      return NextResponse.json({ error: "Veículo não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ vehicle: vehicle[0] })
  } catch (error) {
    console.error("Error updating vehicle location:", error)
    return NextResponse.json({ error: "Erro ao atualizar localização" }, { status: 500 })
  }
}
