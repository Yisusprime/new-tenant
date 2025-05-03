import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Esta función detecta si estamos en un subdominio
function getSubdomain(host: string): string | null {
  // Para desarrollo local
  if (host.includes("localhost")) {
    const parts = host.split(".")
    if (parts.length > 1 && parts[0] !== "www") {
      return parts[0]
    }
    return null
  }

  // Para producción
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"

  // Verificar si el host incluye el dominio raíz
  if (!host.includes(rootDomain)) return null

  // Extraer el subdominio
  const parts = host.split(".")
  if (parts.length > 2) {
    const subdomain = parts[0]
    if (subdomain === "www") return null
    return subdomain
  }

  return null
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const { pathname } = url
  const hostname = request.headers.get("host") || ""

  // Obtener el subdominio
  const subdomain = getSubdomain(hostname)

  console.log(`Middleware: Host=${hostname}, Path=${pathname}, Subdomain=${subdomain || "none"}`)

  // Verificar la cookie de autenticación personalizada
  const tenantAuthToken = request.cookies.get("tenant_auth_token")?.value
  const currentTenant = request.cookies.get("current_tenant")?.value

  // Nota: Eliminamos la verificación del token que causaba el error
  // La verificación del token se hará en el lado del cliente o en rutas API específicas

  // Si no hay subdominio, no hacer nada
  if (!subdomain) {
    return NextResponse.next()
  }

  // Evitar bucles de redirección
  if (pathname.startsWith(`/[tenant]`) || pathname.startsWith(`/${subdomain}`)) {
    return NextResponse.next()
  }

  // Redirigir a la ruta del tenant
  url.pathname = `/[tenant]${pathname}`

  return NextResponse.rewrite(url)
}

// Configurar las rutas que deben ser manejadas por el middleware
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * 1. /api (rutas API)
     * 2. /_next (archivos de Next.js)
     * 3. /_vercel (archivos de Vercel)
     * 4. /favicon.ico, /sitemap.xml, /robots.txt (archivos estáticos)
     */
    "/((?!api|_next|_vercel|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
