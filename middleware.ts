import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const { pathname } = url
  const hostname = request.headers.get("host") || ""

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/api", "/favicon.ico", "/"]

  // Verificar si la ruta actual es pública
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith("/api/") || pathname.startsWith("/_next/"),
  )

  // Si es una ruta pública, permitir el acceso
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Rutas específicas para superadmin
  if (pathname.startsWith("/superadmin")) {
    // Permitir acceso
    return NextResponse.next()
  }

  // Para todas las demás rutas, permitir el acceso
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
