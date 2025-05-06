import { put } from "@vercel/blob"
import { nanoid } from "nanoid"

/**
 * Sube un archivo a Vercel Blob
 * @param file Archivo a subir
 * @param folder Carpeta donde se guardará el archivo (por defecto: 'uploads')
 * @returns Objeto con el resultado de la operación
 */
export async function uploadToBlob(file: File, folder = "uploads") {
  try {
    // Crear un nombre único para el archivo
    const filename = `${folder}/${nanoid()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "-")}`

    // Subir el archivo a Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    })

    return {
      success: true,
      url: blob.url,
    }
  } catch (error) {
    console.error("Error al subir archivo a Vercel Blob:", error)
    return {
      success: false,
      error: "Error al subir el archivo",
    }
  }
}
