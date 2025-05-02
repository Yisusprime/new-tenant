"use server"

import { revalidatePath } from "next/cache"
import { getFirebaseAdmin } from "@/lib/firebase-admin-helper"

export async function updateTenantOwnersRoles() {
  try {
    // Verificar si el usuario tiene permisos (esto debería implementarse con una verificación real)
    // En una implementación real, verificaríamos el token de sesión del usuario

    const db = getFirebaseAdmin().firestore()

    // Buscar todos los usuarios que son propietarios de tenants pero tienen rol "user"
    const usersRef = db.collection("users")
    const querySnapshot = await usersRef.where("isTenantOwner", "==", true).where("role", "==", "user").get()

    if (querySnapshot.empty) {
      return { success: true, message: "No se encontraron propietarios de tenants con rol 'user'", updated: 0 }
    }

    // Actualizar cada usuario encontrado
    const batch = db.batch()
    let count = 0

    querySnapshot.forEach((doc) => {
      batch.update(doc.ref, { role: "admin" })
      count++
    })

    await batch.commit()

    // Revalidar la ruta para actualizar los datos
    revalidatePath("/admin/system")

    return {
      success: true,
      message: `Se actualizaron ${count} propietarios de tenants de rol 'user' a 'admin'`,
      updated: count,
    }
  } catch (error: any) {
    console.error("Error al actualizar roles:", error)
    return {
      success: false,
      error: error.message || "Error al actualizar los propietarios de tenants",
    }
  }
}
