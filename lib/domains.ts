export type DomainInfo = {
  domain: string
  tenantId: string | null
  isCustomDomain: boolean
  isSubdomain: boolean
}

export async function getDomainFromRequest(hostname: string): Promise<DomainInfo> {
  try {
    // Llamar a la API route para obtener la información del dominio
    const response = await fetch(`/api/domains?hostname=${encodeURIComponent(hostname)}`)

    if (!response.ok) {
      throw new Error(`Error fetching domain info: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error in getDomainFromRequest:", error)

    // Devolver información por defecto en caso de error
    return {
      domain: hostname,
      tenantId: null,
      isCustomDomain: false,
      isSubdomain: false,
    }
  }
}
