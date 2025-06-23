import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseAvailable } from "@/lib/db"

// Enviar comandos para dispositivos GPS
export async function POST(request: NextRequest) {
  try {
    const { vehicleId, command, parameters } = await request.json()

    if (!vehicleId || !command) {
      return NextResponse.json({ error: "ID do veículo e comando são obrigatórios" }, { status: 400 })
    }

    const dbAvailable = await isDatabaseAvailable()

    if (dbAvailable && sql) {
      try {
        // Verificar se o veículo existe
        const vehicle = await sql`
          SELECT id, imei, name FROM vehicles WHERE id = ${vehicleId}
        `

        if (vehicle.length === 0) {
          return NextResponse.json({ error: "Veículo não encontrado" }, { status: 404 })
        }

        // Salvar comando na fila
        const commandRecord = await sql`
          INSERT INTO vehicle_commands (vehicle_id, command_type, command_data, status)
          VALUES (${vehicleId}, ${command}, ${JSON.stringify(parameters || {})}, 'pending')
          RETURNING id
        `

        // Aqui você implementaria a lógica para enviar o comando real
        // Para demonstração, vamos simular o envio
        console.log(`📤 Comando ${command} enviado para veículo ${vehicle[0].name} (IMEI: ${vehicle[0].imei})`)

        // Simular confirmação após 2 segundos
        setTimeout(async () => {
          if (dbAvailable && sql) {
            await sql`
              UPDATE vehicle_commands 
              SET status = 'confirmed', confirmed_at = CURRENT_TIMESTAMP
              WHERE id = ${commandRecord[0].id}
            `
          }
        }, 2000)

        return NextResponse.json({
          success: true,
          message: "Comando enviado com sucesso",
          command_id: commandRecord[0].id,
        })
      } catch (error) {
        console.error("❌ Erro ao enviar comando:", error)
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
      }
    }

    // Fallback
    console.log(`📤 Comando ${command} simulado para veículo ${vehicleId}`)
    return NextResponse.json({
      success: true,
      message: "Comando enviado (modo demonstração)",
    })
  } catch (error) {
    console.error("❌ Erro ao processar comando:", error)
    return NextResponse.json({ error: "Erro ao processar comando" }, { status: 500 })
  }
}
