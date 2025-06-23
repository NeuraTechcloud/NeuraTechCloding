import { type NextRequest, NextResponse } from "next/server"
import { updateVehicleLocation } from "@/lib/vehicles"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { lat, lng, speed, address } = await request.json()
    const vehicleId = params.id

    if (!lat || !lng || speed === undefined) {
      return NextResponse.json({ error: "Latitude, longitude e velocidade são obrigatórios" }, { status: 400 })
    }

    const vehicle = await updateVehicleLocation({
      vehicleId,
      lat,
      lng,
      speed,
      address,
    })

    return NextResponse.json({ vehicle })
  } catch (error) {
    console.error("Error updating vehicle location:", error)
    return NextResponse.json({ error: "Erro ao atualizar localização" }, { status: 500 })
  }
}
