import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "@/lib/firebase-config"

/**
 * Sube un archivo a Firebase Storage con manejo de errores mejorado
 */
export async function uploadFileToStorage(
  file: File,
  folder = "uploads",
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Generar un nombre de archivo único
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "-")}`
    const filePath = `${folder}/${fileName}`

    // Crear referencia al archivo en Storage
    const fileRef = ref(storage, filePath)

    // Subir el archivo
    const snapshot = await uploadBytes(fileRef, file)

    // Obtener la URL de descarga
    const downloadUrl = await getDownloadURL(snapshot.ref)

    return {
      success: true,
      url: downloadUrl,
    }
  } catch (error: any) {
    console.error("Error al subir archivo:", error)

    // Determinar el tipo de error para dar mensajes más específicos
    let errorMessage = "Error al subir el archivo"

    if (error.code === "storage/unauthorized") {
      errorMessage = "No tienes permisos para subir archivos"
    } else if (error.code === "storage/canceled") {
      errorMessage = "La subida fue cancelada"
    } else if (error.code === "storage/unknown") {
      errorMessage = "Error desconocido al subir el archivo"
    } else if (error.message && error.message.includes("CORS")) {
      errorMessage = "Error CORS: El servidor no permite la subida desde este dominio"
    }

    return {
      success: false,
      error: errorMessage,
    }
  }
}
