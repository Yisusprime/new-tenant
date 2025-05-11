import { adminDb, adminAuth } from "@/lib/firebase/admin"

export interface Tenant {
  id: string
  name: string
  createdAt: string // Cambiado a string para evitar problemas de serialización
  ownerId: string
  plan: "free" | "premium" | "enterprise"
  customDomain?: string
  settings?: Record<string, any>
}

export async function createTenant(name: string, ownerId: string, tenantId: string): Promise<Tenant> {
  try {
    // Verificar si el tenant ya existe
    const existingTenantDoc = await adminDb.collection("tenants").doc(tenantId).get()

    if (existingTenantDoc.exists) {
      throw new Error("Tenant ID already exists")
    }

    // Crear un objeto de fecha que sea serializable
    const createdAt = new Date().toISOString()

    const tenant: Tenant = {
      id: tenantId,
      name,
      createdAt,
      ownerId,
      plan: "free",
    }

    // Crear el tenant
    await adminDb.collection("tenants").doc(tenantId).set(tenant)

    // Obtener información del usuario
    const userRecord = await adminAuth.getUser(ownerId)

    // Asignar el usuario como administrador del tenant
    await adminDb
      .collection("tenants")
      .doc(tenantId)
      .collection("roles")
      .doc(ownerId)
      .set({
        role: "admin",
        email: userRecord.email || "",
        createdAt,
      })

    return tenant
  } catch (error) {
    console.error("Error creating tenant:", error)
    throw error
  }
}

export async function getTenant(tenantId: string): Promise<Tenant | null> {
  try {
    const tenantDoc = await adminDb.collection("tenants").doc(tenantId).get()

    if (!tenantDoc.exists) {
      return null
    }

    return tenantDoc.data() as Tenant
  } catch (error) {
    console.error("Error getting tenant:", error)
    return null
  }
}

export async function isTenantAdmin(tenantId: string, userId: string): Promise<boolean> {
  try {
    const roleDoc = await adminDb.collection("tenants").doc(tenantId).collection("roles").doc(userId).get()

    if (!roleDoc.exists) {
      return false
    }

    return roleDoc.data()?.role === "admin"
  } catch (error) {
    console.error("Error checking tenant admin:", error)
    return false
  }
}
