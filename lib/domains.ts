export type DomainInfo = {
  domain: string
  tenantId: string | null
  isCustomDomain: boolean
  isSubdomain: boolean
}

export async function getDomainFromRequest(hostname: string): Promise<DomainInfo> {
  try {
    // Construir la URL base
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "")

    // Llamar a la API route para obtener la información del dominio
    const response = await fetch(`${baseUrl}/api/domains?hostname=${encodeURIComponent(hostname)}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Error fetching domain info: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error in getDomainFromRequest:", error)

    // Implementar la lógica básica de dominio directamente como fallback
    const domainInfo: DomainInfo = {
      domain: hostname,
      tenantId: null,
      isCustomDomain: false,
      isSubdomain: false,
    }

    // Para desarrollo local
    if (hostname.includes("localhost")) {
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
    }

    return domainInfo
  }
}
