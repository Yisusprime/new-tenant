import { type NextRequest, NextResponse } from "next/server"
import { createTenant } from "@/lib/services/tenant-service"
import { adminAuth } from "@/lib/firebase/admin"

// Configurar CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

// Manejar solicitudes OPTIONS (preflight)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(req: NextRequest) {
  try {
    // Añadir headers CORS a la respuesta
    const headers = { ...corsHeaders }

    // Parsear el cuerpo de la solicitud
    const body = await req.json()
    const { name, tenantId, userId } = body

    console.log("Creating tenant:", { name, tenantId, userId })

    // Validaciones
    if (!name || !tenantId || !userId) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400, headers })
    }

    if (!/^[a-z0-9]+$/.test(tenantId)) {
      return NextResponse.json({ error: "ID de tenant inválido" }, { status: 400, headers })
    }

    // Verificar que el usuario existe
    try {
      await adminAuth.getUser(userId)
    } catch (error: any) {
      console.error("Error verificando usuario:", error)
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404, headers })
    }

    // Crear tenant
    try {
      const tenant = await createTenant(name, userId, tenantId)
      console.log("Tenant created successfully:", tenant)
      return NextResponse.json({ success: true, tenant }, { headers })
    } catch (error: any) {
      console.error("Error creando tenant:", error)
      return NextResponse.json({ error: error.message || "Error al crear tenant" }, { status: 500, headers })
    }
  } catch (error: any) {
    console.error("Error general en la API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500, headers: corsHeaders })
  }
}
