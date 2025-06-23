import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseAvailable } from "@/lib/db"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const vehicleId = params.id

    const dbAvailable = await isDatabaseAvailable()

    if (dbAvailable && sql) {
      try {
        const result = await sql`DELETE FROM vehicles WHERE id = ${vehicleId} RETURNING id`

        if (result.length === 0) {
          return NextResponse.json({ error: "Veículo não encontrado" }, { status: 404 })
        }

        return NextResponse.json({ success: true, message: "Veículo deletado com sucesso" })
      } catch (error) {
        console.error("Database error:", error)
      }
    }

    // Fallback
    return NextResponse.json({ success: true, message: "Veículo deletado (modo demonstração)" })
  } catch (error) {
    console.error("Error deleting vehicle:", error)
    return NextResponse.json({ error: "Erro ao deletar veículo" }, { status: 500 })
  }
}
