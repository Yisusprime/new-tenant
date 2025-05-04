import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Inicializar el cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const folder = (formData.get("folder") as string) || "uploads"

    if (!file) {
      return NextResponse.json({ success: false, error: "No se proporcionó ningún archivo" }, { status: 400 })
    }

    // Convertir el archivo a un array de bytes
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Crear un nombre único para el archivo
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "-")}`
    const filePath = `${folder}/${filename}`

    // Subir el archivo a Supabase Storage
    const { data, error } = await supabase.storage.from("images").upload(filePath, buffer)

    if (error) throw error

    // Obtener la URL pública
    const { data: publicUrlData } = supabase.storage.from("images").getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
    })
  } catch (error: any) {
    console.error("Error al subir archivo:", error)
    return NextResponse.json({ success: false, error: error.message || "Error al subir el archivo" }, { status: 500 })
  }
}
