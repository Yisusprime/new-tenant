import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const { pathname } = url
  const hostname = request.headers.get("host") || ""
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"

  // Verificar si estamos en un subdominio
  const isSubdomain = hostname.includes(`.${rootDomain}`) && !hostname.startsWith("www.")

  // Si no estamos en un subdominio, continuar normalmente
  if (!isSubdomain) {
    return NextResponse.next()
  }

  // Extraer el subdominio
  const subdomain = hostname.replace(`.${rootDomain}`, "")

  console.log(`Middleware: Host=${hostname}, Path=${pathname}, Subdomain=${subdomain}`)

  // Si ya estamos en la ruta correcta, no hacer nada
  if (pathname.startsWith(`/tenant/${subdomain}`)) {
    return NextResponse.next()
  }

  // Construir la nueva ruta
  const newPathname = pathname === "/" ? `/tenant/${subdomain}` : `/tenant/${subdomain}${pathname}`

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
