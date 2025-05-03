import { db } from "./firebase-config"
import { collection, doc, getDoc, getDocs } from "firebase/firestore"

export interface TenantInfo {
  id: string
  name: string
  domain: string
  ownerId?: string
  status: "active" | "pending" | "suspended"
  createdAt: Date
  settings?: Record<string, any>
}

// Obtener información de un tenant específico
export async function getTenantInfo(tenantId: string): Promise<TenantInfo | null> {
  try {
    const tenantRef = doc(db, "tenants", tenantId)
    const tenantSnap = await getDoc(tenantRef)

    if (!tenantSnap.exists()) {
      return null
    }

    const data = tenantSnap.data()
    return {
      id: tenantSnap.id,
      name: data.name,
      domain: data.domain,
      ownerId: data.ownerId,
      status: data.status,
      createdAt: data.createdAt?.toDate() || new Date(),
      settings: data.settings,
    } as TenantInfo
  } catch (error) {
    console.error("Error fetching tenant info:", error)
    return null
  }
}

// Obtener todos los tenants
export async function getAllTenants(): Promise<TenantInfo[]> {
  try {
    const tenantsRef = collection(db, "tenants")
    const tenantsSnap = await getDocs(tenantsRef)

    return tenantsSnap.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name,
        domain: data.domain,
        ownerId: data.ownerId,
        status: data.status,
        createdAt: data.createdAt?.toDate() || new Date(),
        settings: data.settings,
      } as TenantInfo
    })
  } catch (error) {
    console.error("Error fetching all tenants:", error)
    return []
  }
}

// Verificar si un subdominio está disponible
export async function isSubdomainAvailable(subdomain: string): Promise<boolean> {
  try {
    const tenantRef = doc(db, "tenants", subdomain)
    const tenantSnap = await getDoc(tenantRef)
    return !tenantSnap.exists()
  } catch (error) {
    console.error("Error checking subdomain availability:", error)
    return false
  }
}
