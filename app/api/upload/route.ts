import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { getDatabase, ref, update } from "firebase/database"

// Obtener la instancia de Realtime Database
const realtimeDb = getDatabase()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const file = formData.get("file") as File
    const tenantId = formData.get("tenantId") as string
    const branchId = formData.get("branchId") as string
    const categoryId = formData.get("categoryId") as string

    if (!file || !tenantId || !branchId || !categoryId) {
      return NextResponse.json({ success: false, error: "Faltan datos requeridos" }, { status: 400 })
    }

    // Verificar que el token de Vercel Blob esté configurado
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: "No se ha configurado correctamente el token de Vercel Blob",
        },
        { status: 500 },
      )
    }

    // Crear nombre de archivo
    const fileExtension = file.name.split(".").pop()
    const timestamp = Date.now()
    const filename = `tenants/${tenantId}/branches/${branchId}/categories/${categoryId}/${timestamp}.${fileExtension}`

    // Subir archivo a Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
    })

    // Actualizar la categoría en la base de datos
    const categoryRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/categories/${categoryId}`)
    await update(categoryRef, {
      image: blob.url,
      updatedAt: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      url: blob.url,
    })
  } catch (error: any) {
    console.error("Error al subir imagen:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error al subir la imagen",
      },
      { status: 500 },
    )
  }
}
