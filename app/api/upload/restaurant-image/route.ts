import { type NextRequest, NextResponse } from "next/server"
import { put, del } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const tenantId = formData.get("tenantId") as string
    const branchId = formData.get("branchId") as string
    const type = formData.get("type") as string // "logo" o "banner"

    if (!file || !tenantId || !branchId || !type) {
      return NextResponse.json({ error: "Faltan parámetros requeridos" }, { status: 400 })
    }

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "El archivo debe ser una imagen" }, { status: 400 })
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "El archivo no debe superar los 5MB" }, { status: 400 })
    }

    // Crear un nombre único para el archivo
    const fileExtension = file.name.split(".").pop()
    const fileName = `tenants/${tenantId}/branches/${branchId}/restaurant/${type}-${Date.now()}.${fileExtension}`

    // Subir el archivo a Vercel Blob
    const blob = await put(fileName, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("Error al subir imagen del restaurante:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL requerida" }, { status: 400 })
    }

    // Eliminar el archivo de Vercel Blob
    await del(url, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar imagen del restaurante:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
