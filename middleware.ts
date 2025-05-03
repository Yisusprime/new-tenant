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

  // Obtener el dominio principal configurado en las variables de entorno
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"

  // Verificar si estamos en un subdominio
  const isTenantDomain = hostname.includes(`.${rootDomain}`) && !hostname.startsWith("www.")

  // Extraer el subdominio (tenant)
  const subdomain = hostname.replace(`.${rootDomain}`, "")

  // Si estamos en un subdominio, redirigir a la ruta del tenant
  if (isTenantDomain) {
    // Si la ruta ya incluye el tenant, no hacer nada
    if (path.startsWith(`/${subdomain}`)) {
      return NextResponse.next()
    }

    // Redirigir a la ruta del tenant
    return NextResponse.rewrite(new URL(`/${subdomain}${path === "/" ? "" : path}`, req.url))
  }

  // Si estamos en el dominio principal, no hacer nada
  return NextResponse.next()
}
