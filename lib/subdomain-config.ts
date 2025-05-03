// Configuración para manejar subdominios
export const SUBDOMAIN_CONFIG = {
  rootDomain: process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online",
  isSubdomain: (host: string): boolean => {
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"
    return host.includes(`.${rootDomain}`) && !host.startsWith("www.")
  },
  getSubdomain: (host: string): string | null => {
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"

    // Para localhost
    if (host.includes("localhost")) {
      const match = host.match(/^([^.]+)\.localhost/)
      return match && match[1] !== "www" ? match[1] : null
    }

    // Para producción
    if (host.includes(`.${rootDomain}`)) {
      const subdomain = host.replace(`.${rootDomain}`, "")
      return subdomain !== "www" ? subdomain : null
    }

    return null
  },
}

// Función para construir URL con subdominio
export function buildSubdomainUrl(subdomain: string, path = "/"): string {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"
  const isLocalhost = typeof window !== "undefined" && window.location.hostname.includes("localhost")

  if (isLocalhost) {
    return `http://${subdomain}.localhost:3000${path}`
  } else {
    return `https://${subdomain}.${rootDomain}${path}`
  }
}
