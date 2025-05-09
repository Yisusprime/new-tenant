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

    // Crear una estructura de carpetas usando prefijos en el nombre del archivo
    // Formato: tenants/[tenantId]/branches/[branchId]/categories/[categoryId]/[timestamp].[extension]
    const fileExtension = file.name.split(".").pop()
    const timestamp = Date.now()
    const filename = `tenants/${tenantId}/branches/${branchId}/categories/${categoryId}/${timestamp}.${fileExtension}`

    console.log("Subiendo archivo a Vercel Blob:", filename)

    // Upload to Vercel Blob - el token se accede automáticamente en el servidor
    // No necesitamos pasar el token explícitamente en un Server Action
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
    })

    console.log("Imagen subida exitosamente a Vercel Blob:", blob.url)

    // Update the category with the new image URL in Realtime Database
    const categoryRef = dbRef(realtimeDb, `tenants/${tenantId}/branches/${branchId}/categories/${categoryId}`)
    await update(categoryRef, {
      image: blob.url,
      updatedAt: new Date().toISOString(),
    })

    console.log("Categoría actualizada con la nueva URL de imagen")

    // Revalidate the path to update the UI
    if (path) {
      revalidatePath(path)
    }

    return {
      success: true,
      url: blob.url,
    }
  } catch (error: any) {
    console.error("Error detallado al subir imagen:", error)
    return {
      success: false,
      error: error.message || "Error al subir la imagen",
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

    // Eliminar la imagen usando la API de Vercel Blob
    // No necesitamos pasar el token explícitamente en un Server Action
    await del(imageUrl)
    console.log("Imagen eliminada correctamente:", imageUrl)
    return true
  } catch (error: any) {
    console.error("Error al eliminar la imagen de Vercel Blob:", error)
    // No lanzamos el error para que no interrumpa el flujo principal
    return false
  }
}
