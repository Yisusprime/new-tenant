import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get("host") || ""

  // Verificar si es el dominio principal
  const isRootDomain =
    hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN || hostname === `www.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`

  // Proteger rutas de superadmin
  if (pathname.startsWith("/superadmin") && !isRootDomain) {
    return NextResponse.redirect(new URL("/unauthorized", request.url))
  }

  // Redirigir a login si no está autenticado (esto se manejará en el cliente)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
