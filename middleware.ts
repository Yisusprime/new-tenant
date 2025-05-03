import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const { pathname, search, hostname } = url

  // Verificar si estamos en un subdominio
  const hostParts = hostname.split(".")
  const isSubdomain = hostParts.length > 2 && hostname !== "www.gastroo.online" && hostname.includes("gastroo.online")

  // Si es un subdominio, extraer el tenant
  if (isSubdomain) {
    const tenant = hostParts[0]

    // Si estamos en la ruta raíz, redirigir a la página del tenant
    if (pathname === "/") {
      url.pathname = `/tenant/${tenant}`
      return NextResponse.rewrite(url)
    }
  }

  // Si no es un subdominio y estamos en la ruta raíz, mostrar la página principal
  if (!isSubdomain && pathname === "/") {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * 1. /api (rutas API)
     * 2. /_next (archivos Next.js)
     * 3. /static (archivos estáticos)
     * 4. /favicon.ico, /robots.txt, etc.
     */
    "/((?!api|_next|static|favicon.ico|robots.txt).*)",
  ],
}
