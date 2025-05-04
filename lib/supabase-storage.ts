import { createClient } from "@supabase/supabase-js"

// Inicializar el cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

export async function uploadToSupabase(file: File, folder = "uploads") {
  try {
    // Crear un nombre único para el archivo
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "-")}`
    const filePath = `${folder}/${filename}`

    // Subir el archivo a Supabase Storage
    const { data, error } = await supabase.storage.from("images").upload(filePath, file)

    if (error) throw error

    // Obtener la URL pública
    const { data: publicUrlData } = supabase.storage.from("images").getPublicUrl(filePath)

    return {
      success: true,
      url: publicUrlData.publicUrl,
    }
  } catch (error) {
    console.error("Error al subir archivo a Supabase:", error)
    return {
      success: false,
      error: "Error al subir el archivo",
    }
  }
}
