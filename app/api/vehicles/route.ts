import { type NextRequest, NextResponse } from "next/server"
import { getUserVehicles, createVehicle } from "@/lib/vehicles"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "ID do usuário é obrigatório" }, { status: 400 })
    }

    const vehicles = await getUserVehicles(userId)
    return NextResponse.json({ vehicles })
  } catch (error) {
    console.error("Error fetching vehicles:", error)
    return NextResponse.json({ error: "Erro ao buscar veículos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, plate, imei, userId } = await request.json()

    if (!name || !plate || !imei || !userId) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    const vehicle = await createVehicle({ name, plate, imei, userId })
    return NextResponse.json({ vehicle }, { status: 201 })
  } catch (error) {
    console.error("Error creating vehicle:", error)
    return NextResponse.json({ error: "Erro ao criar veículo" }, { status: 500 })
  }
}
