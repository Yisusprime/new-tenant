import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get("host") || ""

  // Extraer el subdominio
  const subdomain = hostname.split(".")[0]
  const mainDomain = process.env.NEXT_PUBLIC_DOMAIN || "gastroo.online"

  // Verificar si estamos en un subdominio o en el dominio principal
  const isMainDomain = hostname === mainDomain || hostname === `www.${mainDomain}`

  // Si estamos en el dominio principal, permitir el acceso normal
  if (isMainDomain) {
    return NextResponse.next()
  }

  // Si estamos en un subdominio, verificar que no estamos intentando acceder a rutas del dominio principal
  const restrictedPaths = ["/register", "/"]
  if (restrictedPaths.some((path) => url.pathname === path)) {
    // Redirigir a la página principal del subdominio
    return NextResponse.rewrite(new URL(`/tenant/${subdomain}${url.pathname}`, request.url))
  }

  // Para todas las demás rutas en el subdominio
  return NextResponse.rewrite(new URL(`/tenant/${subdomain}${url.pathname}`, request.url))
}

// Ejecutar el middleware en todas las rutas excepto assets estáticos
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * 1. /api (rutas API)
     * 2. /_next (rutas internas de Next.js)
     * 3. /static (archivos estáticos)
     * 4. Archivos con extensiones como imágenes, fuentes, etc.
     */
    "/((?!api|_next|static|.*\\..*).*)",
  ],
}
