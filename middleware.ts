import { type NextRequest, NextResponse } from "next/server"

// Dominios que no son tenants
const nonTenantDomains = ["www", "app", "superadmin"]

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const { pathname, hostname } = url

  // Extraer el subdominio
  const host = hostname.split(".")
  const isLocalhost = hostname.includes("localhost")
  const subdomain = isLocalhost ? host[0] : host[0]

  // Verificar si es un subdominio de tenant o una ruta principal
  const isTenantSubdomain = !nonTenantDomains.includes(subdomain) && subdomain !== "gastroo"

  // Verificar la cookie de sesión (sin validarla con Firebase aquí)
  const hasSessionCookie = request.cookies.has("session")

  // Redirecciones basadas en cookies y rutas
  if (isTenantSubdomain) {
    // Rutas de administrador requieren cookie de sesión
    if (pathname.startsWith("/admin") && !hasSessionCookie) {
      url.pathname = "/login"
      return NextResponse.redirect(url)
    }

    // Reescribir la ruta para el tenant
    url.pathname = `/tenant${pathname}`
    return NextResponse.rewrite(url)
  } else if (pathname.startsWith("/superadmin") && !hasSessionCookie) {
    // Rutas de superadmin requieren cookie de sesión
    url.pathname = "/superadmin/login"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Excluir archivos estáticos y API routes
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
