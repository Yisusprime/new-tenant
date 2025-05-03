import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { SUBDOMAIN_CONFIG } from "./lib/subdomain-config"

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const { pathname } = url
  const hostname = request.headers.get("host") || ""

  // Obtener el subdominio
  const subdomain = SUBDOMAIN_CONFIG.getSubdomain(hostname)

  console.log(`Middleware: Host=${hostname}, Path=${pathname}, Subdomain=${subdomain || "none"}`)

  // Si no hay subdominio, continuar normalmente
  if (!subdomain) {
    return NextResponse.next()
  }

  // Si estamos en un subdominio, todas las rutas deben ir a /tenant/[subdomain]/*

  // Si ya estamos en la ruta correcta, no hacer nada
  if (pathname.startsWith(`/tenant/${subdomain}`)) {
    return NextResponse.next()
  }

  // Construir la nueva ruta
  let newPathname = pathname

  // Manejar rutas especiales
  if (pathname === "/" || pathname === "") {
    newPathname = `/tenant/${subdomain}`
  } else {
    newPathname = `/tenant/${subdomain}${pathname}`
  }

  console.log(`Middleware: Rewriting ${pathname} to ${newPathname}`)

  // Reescribir la URL
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
