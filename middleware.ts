import { type NextRequest, NextResponse } from "next/server"

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /fonts (inside /public)
     * 4. /examples (inside /public)
     * 5. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api|_next|fonts|examples|[\\w-]+\\.\\w+).*)",
  ],
}

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl
  const hostname = req.headers.get("host") || ""
  const path = url.pathname

  console.log("Middleware - Hostname:", hostname)
  console.log("Middleware - Path:", path)

  // Obtener el dominio principal configurado en las variables de entorno
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"
  console.log("Middleware - Root Domain:", rootDomain)

  // Verificar si estamos en un subdominio
  const isTenantDomain = hostname.includes(`.${rootDomain}`) && !hostname.startsWith("www.")
  console.log("Middleware - Is Tenant Domain:", isTenantDomain)

  // Si estamos en un subdominio, manejar las rutas correctamente
  if (isTenantDomain) {
    // Extraer el subdominio (tenant)
    const subdomain = hostname.replace(`.${rootDomain}`, "")
    console.log("Middleware - Subdomain:", subdomain)

    // Corregido: No añadir el tenant a la ruta si ya está en el subdominio
    // En lugar de eso, reescribir directamente a las rutas de admin/dashboard, etc.

    // Si la ruta es la raíz o una ruta que no comienza con /admin, /login, etc.
    if (path === "/" || (!path.startsWith("/admin") && !path.startsWith("/login") && !path.startsWith("/register"))) {
      // Reescribir a la ruta correcta sin duplicar el tenant
      const newPath = path === "/" ? `/admin/dashboard` : `/admin${path}`
      const newUrl = new URL(newPath, req.url)
      console.log("Middleware - Rewriting to:", newUrl.toString())
      return NextResponse.rewrite(newUrl)
    }

    // Para otras rutas, simplemente continuar
    return NextResponse.next()
  }

  // Si estamos en el dominio principal, no hacer nada
  console.log("Middleware - On main domain, continuing")
  return NextResponse.next()
}
