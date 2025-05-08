import { db } from "@/lib/firebase"
import { collection, doc, setDoc, getDoc, query, where, getDocs } from "firebase/firestore"

export interface Tenant {
  id: string
  name: string
  createdAt: Date
  ownerId: string
  subdomain: string
  status: "active" | "inactive" | "pending"
}

export const tenantsCollection = collection(db, "tenants")

export async function createTenant(data: Omit<Tenant, "id" | "createdAt">): Promise<Tenant> {
  // Verificar si el subdominio ya existe
  const subdomainExists = await checkSubdomainExists(data.subdomain)
  if (subdomainExists) {
    throw new Error("El subdominio ya está en uso")
  }

  const tenantId = data.subdomain
  const tenantRef = doc(tenantsCollection, tenantId)

  const tenant: Tenant = {
    id: tenantId,
    ...data,
    createdAt: new Date(),
  }

  await setDoc(tenantRef, tenant)
  return tenant
}

export async function getTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
  const q = query(tenantsCollection, where("subdomain", "==", subdomain))
  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) {
    return null
  }

  return querySnapshot.docs[0].data() as Tenant
}

export async function checkSubdomainExists(subdomain: string): Promise<boolean> {
  const tenant = await getTenantBySubdomain(subdomain)
  return tenant !== null
}

export async function getTenantById(id: string): Promise<Tenant | null> {
  const tenantRef = doc(tenantsCollection, id)
  const tenantSnap = await getDoc(tenantRef)

  if (!tenantSnap.exists()) {
    return null
  }

  return tenantSnap.data() as Tenant
}
