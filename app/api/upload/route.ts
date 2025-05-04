import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { nanoid } from "nanoid"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const folder = (formData.get("folder") as string) || "uploads"

    // Validar que se haya enviado un archivo
    if (!file) {
      return NextResponse.json({ success: false, error: "No se proporcionó ningún archivo" }, { status: 400 })
    }

    // Validar tipo de archivo (solo imágenes)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, error: "El archivo debe ser una imagen" }, { status: 400 })
    }

    // Validar tamaño del archivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "El archivo es demasiado grande (máximo 5MB)" },
        { status: 400 },
      )
    }

    // Crear un nombre único para el archivo
    const filename = `${folder}/${nanoid()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "-")}`

    console.log("Subiendo archivo a Vercel Blob:", filename) // Log para depuración

    // Subir el archivo a Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    })

    console.log("Archivo subido con éxito:", blob.url) // Log para depuración

    // Devolver la URL del archivo subido
    return NextResponse.json({
      success: true,
      url: blob.url,
      path: filename,
    })
  } catch (error: any) {
    console.error("Error al subir archivo:", error)
    return NextResponse.json({ success: false, error: error.message || "Error al subir el archivo" }, { status: 500 })
  }
}
