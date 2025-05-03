"use server"

import { cookies } from "next/headers"

// Función para validar la clave secreta del superadmin
export async function validateSuperAdminKey(secretKey: string): Promise<{ valid: boolean; message?: string }> {
  try {
    // Obtener la clave secreta del entorno (ahora sin NEXT_PUBLIC_)
    const expectedSecretKey = process.env.SUPERADMIN_SECRET_KEY

    if (!expectedSecretKey) {
      console.error("SUPERADMIN_SECRET_KEY no está configurada en las variables de entorno")
      return { valid: false, message: "Error de configuración del servidor" }
    }

    // Validar la clave
    const isValid = secretKey === expectedSecretKey

    if (isValid) {
      // Si es válida, establecer una cookie temporal para indicar que la clave ha sido validada
      // Esta cookie solo durará durante la sesión actual
      cookies().set("superadmin_key_validated", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/superadmin",
      })

      return { valid: true }
    } else {
      return { valid: false, message: "Clave secreta incorrecta" }
    }
  } catch (error) {
    console.error("Error al validar la clave secreta:", error)
    return { valid: false, message: "Error al validar la clave secreta" }
  }
}

// Función para verificar si un usuario es superadmin
export async function checkSuperAdminStatus(uid: string): Promise<{ isSuperAdmin: boolean; message?: string }> {
  try {
    // Aquí implementaríamos la lógica para verificar en la base de datos
    // si el usuario tiene el rol de superadmin
    // Por ahora, simulamos esta verificación

    // En una implementación real, consultaríamos Firestore
    // const userDoc = await getDoc(doc(adminFirestore, "users", uid))
    // return userDoc.exists() && userDoc.data().role === "superadmin"

    return { isSuperAdmin: true }
  } catch (error) {
    console.error("Error al verificar el estado de superadmin:", error)
    return { isSuperAdmin: false, message: "Error al verificar permisos" }
  }
}
