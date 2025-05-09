"use server"

import { put, del } from "@vercel/blob"
import { revalidatePath } from "next/cache"
import { getDatabase, ref as dbRef, update } from "firebase/database"

// Obtener la instancia de Realtime Database
const realtimeDb = getDatabase()

// Server Action para subir imágenes a Vercel Blob
export async function uploadImage(prevState: any, formData: FormData) {
  try {
    console.log("Iniciando carga de imagen a Vercel Blob")

    const file = formData.get("file") as File
    const tenantId = formData.get("tenantId") as string
    const branchId = formData.get("branchId") as string
    const categoryId = formData.get("categoryId") as string
    const path = formData.get("path") as string

    console.log("Datos recibidos:", { tenantId, branchId, categoryId, fileName: file?.name })

    if (!file || !tenantId || !branchId || !categoryId) {
      console.error("Faltan datos requeridos:", { file: !!file, tenantId, branchId, categoryId })
      return {
        success: false,
        error: "Faltan datos requeridos para la carga de la imagen",
      }
    }

    // Verificar que el token de Vercel Blob esté configurado
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("No se ha configurado la variable de entorno BLOB_READ_WRITE_TOKEN")
      return {
        success: false,
        error: "No se ha configurado correctamente el token de Vercel Blob. Contacta al administrador del sistema.",
      }
    }

    // Crear una estructura de carpetas usando prefijos en el nombre del archivo
    // Formato: tenants/[tenantId]/branches/[branchId]/categories/[categoryId]/[timestamp].[extension]
    const fileExtension = file.name.split(".").pop()
    const timestamp = Date.now()
    const filename = `tenants/${tenantId}/branches/${branchId}/categories/${categoryId}/${timestamp}.${fileExtension}`

    console.log("Subiendo archivo a Vercel Blob:", filename)

    // Intentar subir la imagen con manejo de errores mejorado
    let blob
    try {
      blob = await put(filename, file, {
        access: "public",
        addRandomSuffix: false,
      })
      console.log("Imagen subida exitosamente a Vercel Blob:", blob.url)
    } catch (blobError: any) {
      console.error("Error específico al subir a Vercel Blob:", blobError)
      return {
        success: false,
        error: `Error al subir la imagen a Vercel Blob: ${blobError.message || "Error desconocido"}`,
      }
    }

    // Update the category with the new image URL in Realtime Database
    try {
      const categoryRef = dbRef(realtimeDb, `tenants/${tenantId}/branches/${branchId}/categories/${categoryId}`)
      await update(categoryRef, {
        image: blob.url,
        updatedAt: new Date().toISOString(),
      })
      console.log("Categoría actualizada con la nueva URL de imagen")
    } catch (dbError: any) {
      console.error("Error al actualizar la categoría en la base de datos:", dbError)
      // Aunque falló la actualización de la base de datos, la imagen ya se subió
      return {
        success: true,
        url: blob.url,
        warning: "La imagen se subió correctamente, pero hubo un error al actualizar la categoría en la base de datos.",
      }
    }

    // Revalidate the path to update the UI
    if (path) {
      try {
        revalidatePath(path)
      } catch (revalidateError) {
        console.error("Error al revalidar la ruta:", revalidateError)
        // No es un error crítico, podemos continuar
      }
    }

    return {
      success: true,
      url: blob.url,
    }
  } catch (error: any) {
    // Capturar y registrar cualquier error no manejado
    console.error("Error detallado al subir imagen:", error)
    console.error("Stack trace:", error.stack)
    return {
      success: false,
      error: `Error al subir la imagen: ${error.message || "Error desconocido"}`,
    }
  }
}

// Función para eliminar una imagen de Vercel Blob
export async function deleteImage(imageUrl: string): Promise<boolean> {
  if (!imageUrl) {
    console.warn("No se proporcionó URL de imagen para eliminar")
    return false
  }

  try {
    console.log("Intentando eliminar imagen:", imageUrl)

    // Verificar que la URL sea de Vercel Blob
    if (!imageUrl.includes("blob.vercel-storage.com")) {
      console.warn("La URL no parece ser de Vercel Blob:", imageUrl)
      return false
    }

    // Verificar que el token de Vercel Blob esté configurado
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("No se ha configurado la variable de entorno BLOB_READ_WRITE_TOKEN")
      return false
    }

    // Eliminar la imagen usando la API de Vercel Blob
    await del(imageUrl)
    console.log("Imagen eliminada correctamente:", imageUrl)
    return true
  } catch (error: any) {
    console.error("Error al eliminar la imagen de Vercel Blob:", error)
    console.error("Stack trace:", error.stack)
    // No lanzamos el error para que no interrumpa el flujo principal
    return false
  }
}
