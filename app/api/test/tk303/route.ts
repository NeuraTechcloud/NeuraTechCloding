import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseAvailable } from "@/lib/db"

// Endpoint para testar dados do TK303
export async function POST(request: NextRequest) {
  try {
    console.log("🔧 Teste TK303 - Dados recebidos")

    const body = await request.text()
    console.log("📡 Raw data:", body)

    // TK303 pode enviar dados em diferentes formatos
    let data: any = {}

    try {
      // Tentar JSON primeiro
      data = JSON.parse(body)
    } catch {
      // Se não for JSON, pode ser query string ou formato proprietário
      const url = new URL(`http://dummy.com?${body}`)
      data = {
        imei: url.searchParams.get("imei"),
        lat: url.searchParams.get("lat"),
        lng: url.searchParams.get("lng") || url.searchParams.get("lon"),
        speed: url.searchParams.get("speed"),
        timestamp: url.searchParams.get("timestamp") || new Date().toISOString(),
      }
    }

    console.log("📊 Dados processados:", data)

    const { imei, lat, lng, speed, timestamp } = data

    if (!imei) {
      console.log("❌ IMEI não encontrado nos dados")
      return NextResponse.json({ error: "IMEI obrigatório" }, { status: 400 })
    }

    if (!lat || !lng) {
      console.log("❌ Coordenadas não encontradas")
      return NextResponse.json({ error: "Latitude e longitude obrigatórias" }, { status: 400 })
    }

    console.log(`📍 TK303 IMEI ${imei} - Lat: ${lat}, Lng: ${lng}, Speed: ${speed}`)

    const dbAvailable = await isDatabaseAvailable()

    if (dbAvailable && sql) {
      try {
        // Verificar se o veículo existe
        const vehicle = await sql`
          SELECT id, name FROM vehicles WHERE imei = ${imei}
        `

        if (vehicle.length === 0) {
          console.log(`⚠️ TK303 com IMEI ${imei} não cadastrado no sistema`)

          // Auto-cadastrar para teste
          const newVehicle = await sql`
            INSERT INTO vehicles (user_id, name, plate, imei, status, speed, lat, lng, address)
            VALUES (1, 'TK303 Auto', 'TK303', ${imei}, 'online', ${speed || 0}, ${lat}, ${lng}, 'Localização TK303')
            RETURNING id, name
          `

          console.log(`✅ TK303 auto-cadastrado: ${newVehicle[0].name}`)
        } else {
          // Atualizar localização
          await sql`
            UPDATE vehicles 
            SET lat = ${lat}, lng = ${lng}, speed = ${speed || 0}, 
                status = 'online', last_update = CURRENT_TIMESTAMP
            WHERE imei = ${imei}
          `

          console.log(`✅ TK303 ${vehicle[0].name} localização atualizada`)
        }

        // Salvar no histórico
        await sql`
          INSERT INTO vehicle_locations (vehicle_id, lat, lng, speed, timestamp, raw_data)
          SELECT id, ${lat}, ${lng}, ${speed || 0}, ${timestamp}, ${JSON.stringify(data)}
          FROM vehicles WHERE imei = ${imei}
        `

        return NextResponse.json({
          success: true,
          message: "TK303 localizado com sucesso",
          imei,
          coordinates: { lat, lng },
          speed: speed || 0,
        })
      } catch (error) {
        console.error("❌ Erro no banco:", error)
        return NextResponse.json({ error: "Erro interno" }, { status: 500 })
      }
    }

    // Fallback - apenas log
    console.log("⚠️ Modo demonstração - TK303 dados recebidos mas não salvos")
    return NextResponse.json({
      success: true,
      message: "TK303 dados recebidos (modo demo)",
      imei,
      coordinates: { lat, lng },
    })
  } catch (error) {
    console.error("❌ Erro ao processar TK303:", error)
    return NextResponse.json({ error: "Erro ao processar dados" }, { status: 500 })
  }
}

// Suporte para GET também (alguns TK303 usam GET)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const queryData = {
    imei: searchParams.get("imei"),
    lat: searchParams.get("lat"),
    lng: searchParams.get("lng") || searchParams.get("lon"),
    speed: searchParams.get("speed"),
    timestamp: new Date().toISOString(),
  }

  console.log("📡 TK303 GET request:", queryData)

  // Redirecionar para POST
  return await POST(
    new Request(request.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(queryData),
    }),
  )
}
