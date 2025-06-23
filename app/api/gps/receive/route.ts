import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseAvailable } from "@/lib/db"

// Endpoint para receber dados de dispositivos GPS
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    console.log("📡 Dados GPS recebidos:", data)

    // Validar dados obrigatórios
    const { imei, lat, lng, speed, timestamp, status } = data

    if (!imei || lat === undefined || lng === undefined) {
      return NextResponse.json({ error: "IMEI, latitude e longitude são obrigatórios" }, { status: 400 })
    }

    const dbAvailable = await isDatabaseAvailable()

    if (dbAvailable && sql) {
      try {
        // Verificar se o veículo existe
        const vehicle = await sql`
          SELECT id, user_id FROM vehicles WHERE imei = ${imei}
        `

        if (vehicle.length === 0) {
          console.log(`⚠️ Veículo com IMEI ${imei} não encontrado`)
          return NextResponse.json({ error: "Dispositivo não cadastrado" }, { status: 404 })
        }

        // Atualizar localização do veículo
        await sql`
          UPDATE vehicles 
          SET 
            lat = ${lat}, 
            lng = ${lng}, 
            speed = ${speed || 0}, 
            status = ${status || "online"}, 
            last_update = CURRENT_TIMESTAMP
          WHERE imei = ${imei}
        `

        // Salvar histórico de localização
        await sql`
          INSERT INTO vehicle_locations (vehicle_id, lat, lng, speed, timestamp, raw_data)
          VALUES (${vehicle[0].id}, ${lat}, ${lng}, ${speed || 0}, ${timestamp || "NOW()"}, ${JSON.stringify(data)})
        `

        console.log(`✅ Localização atualizada para IMEI ${imei}`)

        return NextResponse.json({
          success: true,
          message: "Localização atualizada",
          vehicle_id: vehicle[0].id,
        })
      } catch (error) {
        console.error("❌ Erro no banco:", error)
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
      }
    }

    // Fallback - apenas log
    console.log("⚠️ Modo fallback - dados GPS recebidos mas não salvos")
    return NextResponse.json({ success: true, message: "Dados recebidos (modo demonstração)" })
  } catch (error) {
    console.error("❌ Erro ao processar dados GPS:", error)
    return NextResponse.json({ error: "Erro ao processar dados" }, { status: 500 })
  }
}

// Endpoint para protocolo GET (alguns dispositivos usam)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const imei = searchParams.get("imei")
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng") || searchParams.get("lon")
    const speed = searchParams.get("speed")
    const timestamp = searchParams.get("timestamp")

    if (!imei || !lat || !lng) {
      return NextResponse.json({ error: "Parâmetros obrigatórios: imei, lat, lng" }, { status: 400 })
    }

    // Processar da mesma forma que o POST
    const data = {
      imei,
      lat: Number.parseFloat(lat),
      lng: Number.parseFloat(lng),
      speed: speed ? Number.parseInt(speed) : 0,
      timestamp,
      status: "online",
    }

    // Reutilizar lógica do POST
    return await POST(
      new Request(request.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    )
  } catch (error) {
    console.error("❌ Erro no GET GPS:", error)
    return NextResponse.json({ error: "Erro ao processar dados" }, { status: 500 })
  }
}
