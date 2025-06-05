import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const tenantId = formData.get("tenantId") as string
    const branchId = formData.get("branchId") as string

    if (!file || !tenantId || !branchId) {
      return NextResponse.json({ error: "Faltan parámetros requeridos" }, { status: 400 })
    }

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "El archivo debe ser una imagen" }, { status: 400 })
    }

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "El archivo no debe superar los 2MB" }, { status: 400 })
    }

    // Crear un nombre único para el archivo
    const fileName = `tenants/${tenantId}/branches/${branchId}/restaurant/logo-${Date.now()}.${file.name.split(".").pop()}`

    // Subir el archivo a Vercel Blob
    const blob = await put(fileName, file, {
      access: "public",
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("Error al subir logo:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
