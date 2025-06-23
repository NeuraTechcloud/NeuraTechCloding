import { type NextRequest, NextResponse } from "next/server"
import { getVehicleHistory } from "@/lib/vehicles"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const days = Number.parseInt(searchParams.get("days") || "7")
    const vehicleId = params.id

    const history = await getVehicleHistory(vehicleId, days)
    return NextResponse.json({ history })
  } catch (error) {
    console.error("Error fetching vehicle history:", error)
    return NextResponse.json({ error: "Erro ao buscar histórico" }, { status: 500 })
  }
}
