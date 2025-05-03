import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Función para obtener el dominio raíz desde las variables de entorno
const getRootDomain = () => {
  return process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"
}

// Función para verificar si una URL es un subdominio
const isSubdomain = (host: string) => {
  const rootDomain = getRootDomain()

  // Para desarrollo local
  if (host.includes("localhost")) {
    return host !== "localhost" && host !== "localhost:3000" && !host.startsWith("www.")
  }

  // Para producción
  return host.endsWith(`.${rootDomain}`) && !host.startsWith(`www.${rootDomain}`)
}

// Función para extraer el subdominio de un host
const extractSubdomain = (host: string) => {
  const rootDomain = getRootDomain()

  // Para desarrollo local
  if (host.includes("localhost")) {
    return host.split(".localhost")[0]
  }

  // Para producción
  return host.split(`.${rootDomain}`)[0]
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const { pathname } = url
  const hostname = request.headers.get("host") || ""

  // Verificar si estamos en un subdominio
  const isOnSubdomain = isSubdomain(hostname)

  // Extraer el subdominio si estamos en uno
  const subdomain = isOnSubdomain ? extractSubdomain(hostname) : null

  // Rutas públicas que no requieren autenticación
  const publicRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/tenant/[tenantId]/login",
    "/tenant/[tenantId]/register",
    "/tenant/[tenantId]/forgot-password",
    "/tenant/[tenantId]/reset-password",
    "/unauthorized",
    "/tenant/[tenantId]/unauthorized",
    "/_not-found",
    "/api",
    "/favicon.ico",
    "/",
  ]

  // Verificar si la ruta actual es pública
  const isPublicRoute = publicRoutes.some((route) => {
    if (route.includes("[tenantId]")) {
      const routePattern = route.replace("[tenantId]", "[^\\/]+")
      const regex = new RegExp(`^${routePattern}$`)
      return regex.test(pathname)
    }
    return pathname === route || pathname.startsWith("/api/") || pathname.startsWith("/_next/")
  })

  // Si es una ruta pública, permitir el acceso
  if (isPublicRoute) {
    // Caso especial: si estamos en la página de login principal pero en un subdominio
    if (pathname === "/login" && isOnSubdomain && subdomain) {
      // Redirigir a la página de login del tenant
      return NextResponse.redirect(new URL(`/tenant/${subdomain}/login`, request.url))
    }

    // Caso especial: si estamos en la página de login de un tenant pero no en un subdominio
    if (pathname.startsWith("/tenant/") && pathname.includes("/login") && !isOnSubdomain) {
      // Extraer el tenantId de la URL
      const tenantId = pathname.split("/")[2]
      const rootDomain = getRootDomain()

      // Redirigir al subdominio correspondiente
      if (hostname === "localhost" || hostname === "localhost:3000") {
        return NextResponse.redirect(new URL(`http://${tenantId}.localhost:3000/tenant/${tenantId}/login`, request.url))
      } else {
        return NextResponse.redirect(new URL(`https://${tenantId}.${rootDomain}/tenant/${tenantId}/login`, request.url))
      }
    }

    return NextResponse.next()
  }

  // Rutas específicas para superadmin
  if (pathname.startsWith("/superadmin")) {
    // Solo permitir acceso desde el dominio principal
    if (isOnSubdomain) {
      // Redirigir a página no autorizada
      return NextResponse.redirect(new URL(`/tenant/${subdomain}/unauthorized`, request.url))
    }

    // Permitir acceso desde el dominio principal
    return NextResponse.next()
  }

  // Rutas específicas para tenant
  if (pathname.startsWith("/tenant/")) {
    // Extraer el tenantId de la URL
    const tenantId = pathname.split("/")[2]

    // Verificar si estamos en el subdominio correcto
    if (isOnSubdomain && subdomain !== tenantId) {
      // Redirigir a página no autorizada
      return NextResponse.redirect(new URL(`/tenant/${subdomain}/unauthorized`, request.url))
    }

    // Si estamos en el dominio principal, redirigir al subdominio
    if (!isOnSubdomain) {
      const rootDomain = getRootDomain()

      // Redirigir al subdominio correspondiente
      if (hostname === "localhost" || hostname === "localhost:3000") {
        return NextResponse.redirect(new URL(`http://${tenantId}.localhost:3000${pathname}`, request.url))
      } else {
        return NextResponse.redirect(new URL(`https://${tenantId}.${rootDomain}${pathname}`, request.url))
      }
    }

    // Permitir acceso desde el subdominio correcto
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
