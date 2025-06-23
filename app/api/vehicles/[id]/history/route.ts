import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const days = Number.parseInt(searchParams.get("days") || "7")
    const vehicleId = params.id

    // Gera histórico de demonstração
    const history = Array.from({ length: 20 }, (_, i) => ({
      lat: -22.9083 + (Math.random() - 0.5) * 0.01,
      lng: -43.1964 + (Math.random() - 0.5) * 0.01,
      speed: Math.random() * 100,
      timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
      address: `Localização histórica ${i + 1}`,
    }))

    return NextResponse.json({ history })
  } catch (error) {
    console.error("Error fetching vehicle history:", error)
    return NextResponse.json({ error: "Erro ao buscar histórico" }, { status: 500 })
  }
}
