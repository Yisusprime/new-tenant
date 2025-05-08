import { type NextRequest, NextResponse } from "next/server"
import { createTenant } from "@/lib/services/tenant-service"
import { adminAuth } from "@/lib/firebase/admin"

export async function POST(req: NextRequest) {
  try {
    // Parsear el cuerpo de la solicitud
    const body = await req.json()
    const { name, tenantId, userId } = body

    console.log("Creating tenant:", { name, tenantId, userId })

    // Validaciones
    if (!name || !tenantId || !userId) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    if (!/^[a-z0-9]+$/.test(tenantId)) {
      return NextResponse.json({ error: "ID de tenant inválido" }, { status: 400 })
    }

    // Verificar que el usuario existe
    try {
      await adminAuth.getUser(userId)
    } catch (error: any) {
      console.error("Error verificando usuario:", error)
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Crear tenant
    try {
      const tenant = await createTenant(name, userId, tenantId)
      console.log("Tenant created successfully:", tenant)
      return NextResponse.json({ success: true, tenant })
    } catch (error: any) {
      console.error("Error creando tenant:", error)
      return NextResponse.json({ error: error.message || "Error al crear tenant" }, { status: 500 })
    }
  } catch (error: any) {
    console.error("Error general en la API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
