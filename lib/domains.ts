import { adminDb } from "./firebase-admin"
import { getCachedDomainInfo, setCachedDomainInfo } from "./domains-cache"

export type DomainInfo = {
  domain: string
  tenantId: string | null
  isCustomDomain: boolean
  isSubdomain: boolean
}

export async function getDomainFromRequest(hostname: string): Promise<DomainInfo> {
  // Verificar si la información está en caché
  const cachedInfo = getCachedDomainInfo(hostname)
  if (cachedInfo) {
    return cachedInfo
  }

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
    setCachedDomainInfo(hostname, domainInfo)
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
    setCachedDomainInfo(hostname, domainInfo)
    return domainInfo
  }

  // Verificar si es un dominio personalizado consultando Firestore
  try {
    // Usar adminDb para consultas del servidor
    const domainsRef = adminDb.collection("domains")
    const querySnapshot = await domainsRef.where("domain", "==", hostname).get()

    if (!querySnapshot.empty) {
      const domainDoc = querySnapshot.docs[0]
      domainInfo.isCustomDomain = true
      domainInfo.tenantId = domainDoc.data().tenantId
    }
  } catch (error) {
    console.error("Error checking custom domain:", error)
  }

  // Guardar en caché
  setCachedDomainInfo(hostname, domainInfo)

  return domainInfo
}
