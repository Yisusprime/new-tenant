import { db } from "../firebase/config"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore"
import type { Tenant } from "../models/tenant"

export async function getTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
  try {
    const tenantsRef = collection(db, "tenants")
    const q = query(tenantsRef, where("subdomain", "==", subdomain))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return null
    }

    const tenantDoc = querySnapshot.docs[0]
    return {
      id: tenantDoc.id,
      ...tenantDoc.data(),
    } as Tenant
  } catch (error) {
    console.error("Error getting tenant by subdomain:", error)
    return null
  }
}

export async function createTenant(tenantData: Omit<Tenant, "id" | "createdAt" | "updatedAt">): Promise<Tenant | null> {
  try {
    // Verificar si el subdominio ya existe
    const existingTenant = await getTenantBySubdomain(tenantData.subdomain)
    if (existingTenant) {
      throw new Error("Subdomain already exists")
    }

    const tenantsRef = collection(db, "tenants")
    const newTenantRef = await addDoc(tenantsRef, {
      ...tenantData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
    })

    const newTenantSnapshot = await getDoc(newTenantRef)

    return {
      id: newTenantRef.id,
      ...newTenantSnapshot.data(),
    } as Tenant
  } catch (error) {
    console.error("Error creating tenant:", error)
    return null
  }
}

export async function updateTenant(id: string, tenantData: Partial<Tenant>): Promise<boolean> {
  try {
    const tenantRef = doc(db, "tenants", id)
    await updateDoc(tenantRef, {
      ...tenantData,
      updatedAt: serverTimestamp(),
    })
    return true
  } catch (error) {
    console.error("Error updating tenant:", error)
    return false
  }
}

export async function deleteTenant(id: string): Promise<boolean> {
  try {
    const tenantRef = doc(db, "tenants", id)
    await deleteDoc(tenantRef)
    return true
  } catch (error) {
    console.error("Error deleting tenant:", error)
    return false
  }
}

export async function getAllTenants(): Promise<Tenant[]> {
  try {
    const tenantsRef = collection(db, "tenants")
    const querySnapshot = await getDocs(tenantsRef)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Tenant[]
  } catch (error) {
    console.error("Error getting all tenants:", error)
    return []
  }
}
