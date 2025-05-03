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
  if (!host.includes(`.${rootDomain}`)) return null

  const subdomain = host.replace(`.${rootDomain}`, "")
  if (subdomain === "www") return null

  return subdomain
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const { pathname } = url
  const hostname = request.headers.get("host") || ""

  // Obtener el subdominio
  const subdomain = getSubdomain(hostname)

  console.log(`Middleware: Host=${hostname}, Path=${pathname}, Subdomain=${subdomain || "none"}`)

  // Si no hay subdominio, no hacer nada
  if (!subdomain) {
    return NextResponse.next()
  }

  // Evitar bucles de redirección
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes("/login") ||
    pathname.includes("/registro") ||
    pathname.includes("/admin") ||
    pathname.includes("/menu")
  ) {
    return NextResponse.next()
  }

  // Si estamos en la raíz del subdominio, redirigir a la landing page del tenant
  if (pathname === "/") {
    url.pathname = `/${subdomain}`
    return NextResponse.rewrite(url)
  }

  // Para otras rutas, mantener la estructura de URL
  return NextResponse.next()
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
