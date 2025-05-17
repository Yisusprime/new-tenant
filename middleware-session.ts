import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export const config = {
  matcher: [
    // Proteger rutas administrativas y de usuario autenticado
    "/tenant/:tenantId/admin/:path*",
    "/tenant/:tenantId/(main)/profile/:path*",
    "/tenant/:tenantId/(main)/orders/:path*",
  ],
}

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("session_expiry")

  // Si no hay cookie de sesión, redirigir al login
  if (!sessionCookie) {
    const url = request.nextUrl.clone()
    const tenantId = url.pathname.split("/")[2] // Extraer el tenantId de la URL
    url.pathname = `/tenant/${tenantId}/(main)/login`
    return NextResponse.redirect(url)
  }

  // Verificar si la sesión ha expirado
  const expiryTime = new Date(sessionCookie.value).getTime()
  const now = Date.now()

  if (now > expiryTime) {
    const url = request.nextUrl.clone()
    const tenantId = url.pathname.split("/")[2] // Extraer el tenantId de la URL
    url.pathname = `/tenant/${tenantId}/(main)/login`
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}
