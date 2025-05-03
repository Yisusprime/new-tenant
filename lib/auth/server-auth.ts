import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/firebase/admin"
import { isFirebaseAdminInitialized } from "@/lib/firebase/admin"

export async function getServerSession() {
  try {
    // Verificar si Firebase Admin está inicializado
    if (!isFirebaseAdminInitialized() || !auth) {
      console.error("Firebase Admin no está inicializado")
      return null
    }

    const sessionCookie = cookies().get("session")?.value

    if (!sessionCookie) {
      return null
    }

    // Verificar la cookie de sesión
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true)
    return {
      uid: decodedClaims.uid,
      email: decodedClaims.email,
      role: decodedClaims.role,
      tenantId: decodedClaims.tenantId,
    }
  } catch (error) {
    console.error("Error al verificar la sesión:", error)
    return null
  }
}

export async function requireAuth(redirectTo = "/login") {
  const session = await getServerSession()
  if (!session) {
    redirect(redirectTo)
  }
  return session
}

export async function requireSuperAdmin(redirectTo = "/superadmin/login") {
  const session = await getServerSession()
  if (!session || session.role !== "superadmin") {
    redirect(redirectTo)
  }
  return session
}

export async function requireTenantAdmin(redirectTo = "/login") {
  const session = await getServerSession()
  if (!session || session.role !== "admin" || !session.tenantId) {
    redirect(redirectTo)
  }
  return session
}
