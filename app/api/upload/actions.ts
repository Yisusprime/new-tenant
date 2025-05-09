"use server"

import { put } from "@vercel/blob"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/firebase/client"
import { doc, updateDoc } from "firebase/firestore"
import { ref, deleteObject, getStorage } from "firebase/storage"

// Server Action para subir imágenes a Vercel Blob
export async function uploadImage(prevState: any, formData: FormData) {
  try {
    const file = formData.get("file") as File
    const tenantId = formData.get("tenantId") as string
    const branchId = formData.get("branchId") as string
    const categoryId = formData.get("categoryId") as string
    const path = formData.get("path") as string

    if (!file || !tenantId || !branchId || !categoryId) {
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

    // Upload to Vercel Blob (el token se accede automáticamente en el servidor)
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
    })

    // Update the category with the new image URL
    const categoryRef = doc(db, `tenants/${tenantId}/branches/${branchId}/categories`, categoryId)
    await updateDoc(categoryRef, {
      image: blob.url,
      updatedAt: new Date().toISOString(),
    })

    // Revalidate the path to update the UI
    if (path) {
      revalidatePath(path)
    }

    return {
      success: true,
      url: blob.url,
    }
  } catch (error: any) {
    console.error("Error uploading image:", error)
    return {
      success: false,
      error: error.message || "Error al subir la imagen",
    }
  }
}

export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    const storage = getStorage()
    // Extract the path from the URL
    const decodedUrl = decodeURIComponent(imageUrl)
    const storagePath = decodedUrl.split("/o/")[1].split("?")[0]

    // Create a reference to the file to delete
    const imageRef = ref(storage, storagePath)

    // Delete the image
    await deleteObject(imageRef)
    console.log("Imagen eliminada correctamente:", imageUrl)
  } catch (error: any) {
    console.error("Error al eliminar la imagen:", error)
    throw new Error(error.message || "Error al eliminar la imagen")
  }
}
