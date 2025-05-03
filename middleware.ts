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

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const { pathname } = url
  const hostname = request.headers.get("host") || ""

  // Obtener el subdominio
  const subdomain = getSubdomain(hostname)

  console.log(`Middleware: Host=${hostname}, Path=${pathname}, Subdomain=${subdomain || "none"}`)

  // Evitar bucles de redirección para recursos estáticos y API
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") // Archivos como favicon.ico, etc.
  ) {
    return NextResponse.next()
  }

  // Si estamos en el dominio principal (www o sin subdominio), no reescribir
  if (!subdomain) {
    return NextResponse.next()
  }

  // IMPORTANTE: Para rutas en subdominios, reescribir internamente a la estructura de carpetas correcta
  // pero mantener la URL original para el usuario

  // Si estamos en la raíz del subdominio
  if (pathname === "/") {
    // Reescribir a la página del tenant
    const newUrl = new URL(`/app/${subdomain}`, request.url)
    console.log(`Reescribiendo / a /app/${subdomain}`)
    return NextResponse.rewrite(newUrl)
  }

  // Para rutas de administración y otras rutas específicas
  // Reescribir a la estructura de carpetas correcta
  const newUrl = new URL(`/app/${subdomain}${pathname}`, request.url)
  console.log(`Reescribiendo ${pathname} a /app/${subdomain}${pathname}`)
  return NextResponse.rewrite(newUrl)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
