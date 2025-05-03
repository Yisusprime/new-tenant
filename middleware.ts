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

  // Si no hay subdominio o ya estamos en una ruta de tenant, no hacer nada
  if (!subdomain || pathname.includes(`/tenant/${subdomain}`)) {
    return NextResponse.next()
  }

  // Evitar bucles de redirección
  if (pathname.includes("/tenant/")) {
    console.log("Detectado posible bucle de redirección, no modificando la ruta")
    return NextResponse.next()
  }

  // Construir la nueva ruta
  const newPathname = pathname === "/" ? `/tenant/${subdomain}` : `/tenant/${subdomain}${pathname}`

  console.log(`Middleware: Rewriting ${pathname} to ${newPathname}`)

  // Reescribir la URL (no redireccionar)
  url.pathname = newPathname
  return NextResponse.rewrite(url)
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
