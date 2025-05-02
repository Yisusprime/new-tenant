// Este archivo contiene funciones que se ejecutan solo en el servidor
import { db } from "./firebase-admin-server"

export type DomainInfo = {
  domain: string
  tenantId: string | null
  isCustomDomain: boolean
  isSubdomain: boolean
}

export type PlanType = "free" | "basic" | "pro" | "enterprise"

export async function getDomainFromRequest(hostname: string): Promise<DomainInfo> {
  // Default domain info
  const domainInfo: DomainInfo = {
    domain: hostname,
    tenantId: null,
    isCustomDomain: false,
    isSubdomain: false,
  }

  // Para desarrollo local
  if (hostname.includes("localhost")) {
    // Verificar si es un formato de subdominio como tenant-name.localhost:3000
    const subdomainMatch = hostname.match(/^([^.]+)\.localhost/)
    if (subdomainMatch) {
      const subdomain = subdomainMatch[1]
      if (subdomain !== "www" && subdomain !== "app") {
        domainInfo.isSubdomain = true
        domainInfo.tenantId = subdomain
      }
    }
    return domainInfo
  }

  // Obtener el dominio raíz (ej., gastroo.online)
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"

  // Verificar si es un subdominio del dominio raíz
  if (hostname.endsWith(`.${rootDomain}`)) {
    const subdomain = hostname.replace(`.${rootDomain}`, "")
    if (subdomain !== "www" && subdomain !== "app") {
      domainInfo.isSubdomain = true
      domainInfo.tenantId = subdomain
    }
    return domainInfo
  }

  // Verificar si es un dominio personalizado consultando Firestore
  try {
    if (db) {
      const domainsRef = db.collection("domains")
      const querySnapshot = await domainsRef.where("domain", "==", hostname).get()

      if (!querySnapshot.empty) {
        const domainDoc = querySnapshot.docs[0]
        domainInfo.isCustomDomain = true
        domainInfo.tenantId = domainDoc.data().tenantId
      }
    }
  } catch (error) {
    console.error("Error checking custom domain:", error)
  }

  return domainInfo
}

export async function getTenantData(tenantId: string) {
  try {
    if (!db) return null

    const tenantDoc = await db.collection("tenants").doc(tenantId).get()
    if (tenantDoc.exists) {
      return tenantDoc.data()
    }
    return null
  } catch (error) {
    console.error("Error getting tenant data:", error)
    return null
  }
}

export async function checkDomainLimit(tenantId: string, plan: PlanType): Promise<boolean> {
  if (!db) return false

  // Implementar lógica para verificar si el tenant ha alcanzado su límite de dominios
  // según su plan
  const planLimits: Record<string, number> = {
    free: 0,
    basic: 1,
    pro: 3,
    enterprise: 10,
  }

  const customDomains = planLimits[plan] || 0

  // Contar dominios actuales del tenant
  const domainsRef = db.collection("domains")
  const querySnapshot = await domainsRef.where("tenantId", "==", tenantId).get()

  const currentDomainCount = querySnapshot.size

  return currentDomainCount < customDomains
}
