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

    // Si la ruta es la raíz, redirigir a la landing page
    if (path === "/") {
      const newUrl = new URL(`/(tenant)/home`, req.url)
      console.log("Middleware - Rewriting root to tenant home:", newUrl.toString())
      return NextResponse.rewrite(newUrl)
    }

    // Para todas las demás rutas en un subdominio, apuntar a la carpeta (tenant)
    const newPath = `/(tenant)${path}`
    const newUrl = new URL(newPath, req.url)
    console.log("Middleware - Rewriting to tenant path:", newUrl.toString())
    return NextResponse.rewrite(newUrl)
  }

  // Si estamos en el dominio principal, no hacer nada
  console.log("Middleware - On main domain, continuing")
  return NextResponse.next()
}
