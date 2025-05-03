import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Función para validar si un subdominio es válido
function isValidTenantSubdomain(subdomain: string): boolean {
  // Excluir subdominios comunes que no son tenants
  const commonSubdomains = ["www", "app", "api", "admin", "mail", "smtp", "pop", "imap"]
  if (commonSubdomains.includes(subdomain)) return false

  // Validar que el subdominio solo contenga caracteres alfanuméricos y guiones
  return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(subdomain)
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const { pathname } = url
  const hostname = request.headers.get("host") || ""
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"

  // Verificar si estamos en un subdominio
  let subdomain: string | null = null

  // Verificar si estamos en localhost (desarrollo)
  if (hostname.includes("localhost")) {
    const subdomainMatch = hostname.match(/^([^.]+)\.localhost/)
    if (subdomainMatch && subdomainMatch[1] !== "www") {
      subdomain = subdomainMatch[1]
    }
  }
  // Verificar si estamos en un subdominio de producción
  else if (hostname.includes(`.${rootDomain}`)) {
    subdomain = hostname.replace(`.${rootDomain}`, "")
    // Verificar que no sea "www"
    if (subdomain === "www") {
      subdomain = null
    }
  }

  // Si estamos en un subdominio válido, manejar las rutas
  if (subdomain && isValidTenantSubdomain(subdomain)) {
    console.log(`Middleware: Subdominio detectado: ${subdomain}, Ruta: ${pathname}`)

    // Si la ruta ya comienza con /tenant/[tenantId], no hacer nada
    if (pathname.startsWith(`/tenant/${subdomain}`)) {
      console.log(`Middleware: Ya estamos en la ruta correcta: ${pathname}`)
      return NextResponse.next()
    }

    // Rutas de admin en subdominios
    if (pathname.startsWith("/admin")) {
      console.log(`Middleware: Reescribiendo ruta admin: ${pathname} a /tenant/${subdomain}${pathname}`)
      // Reescribir /admin/* a /tenant/[subdomain]/admin/*
      url.pathname = `/tenant/${subdomain}${pathname}`
      return NextResponse.rewrite(url)
    }

    // Rutas de cliente en subdominios
    if (pathname.startsWith("/client")) {
      console.log(`Middleware: Reescribiendo ruta client: ${pathname} a /tenant/${subdomain}${pathname}`)
      // Reescribir /client/* a /tenant/[subdomain]/client/*
      url.pathname = `/tenant/${subdomain}${pathname}`
      return NextResponse.rewrite(url)
    }

    // Si la ruta comienza con /tenant pero no es para este tenant, redirigir al tenant correcto
    if (pathname.startsWith("/tenant/")) {
      console.log(`Middleware: Redirigiendo a la ruta correcta del tenant: ${pathname}`)
      const newPath = `/tenant/${subdomain}${pathname.substring(pathname.indexOf("/", 8))}`
      url.pathname = newPath
      return NextResponse.redirect(url)
    }

    // Para otras rutas en el subdominio, redirigir a la ruta del tenant
    console.log(`Middleware: Reescribiendo ruta genérica: ${pathname} a /tenant/${subdomain}${pathname}`)
    url.pathname = `/tenant/${subdomain}${pathname}`
    return NextResponse.rewrite(url)
  }

  // Si estamos en el dominio principal y la ruta comienza con /tenant, permitir el acceso
  if (!subdomain && pathname.startsWith("/tenant/")) {
    console.log(`Middleware: Acceso directo a ruta tenant desde dominio principal: ${pathname}`)
    return NextResponse.next()
  }

  console.log(`Middleware: Ruta normal: ${pathname}`)
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
