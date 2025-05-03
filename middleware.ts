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

  // Extraer el subdominio (tenant)
  const subdomain = hostname.replace(`.${rootDomain}`, "")
  console.log("Middleware - Subdomain:", subdomain)

  // Si estamos en un subdominio, redirigir a la ruta del tenant
  if (isTenantDomain) {
    // Si la ruta ya incluye el tenant, no hacer nada
    if (path.startsWith(`/${subdomain}`)) {
      console.log("Middleware - Path already includes tenant, continuing")
      return NextResponse.next()
    }

    // Redirigir a la ruta del tenant
    const newUrl = new URL(`/${subdomain}${path === "/" ? "" : path}`, req.url)
    console.log("Middleware - Rewriting to:", newUrl.toString())
    return NextResponse.rewrite(newUrl)
  }

  // Si estamos en el dominio principal, no hacer nada
  console.log("Middleware - On main domain, continuing")
  return NextResponse.next()
}
