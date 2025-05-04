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

  // Si estamos en un subdominio, manejar las rutas correctamente
  if (isTenantDomain) {
    // Extraer el subdominio (tenant)
    const subdomain = hostname.replace(`.${rootDomain}`, "")

    // Si la ruta es la raíz, redirigir a la landing page
    if (path === "/") {
      return NextResponse.rewrite(new URL(`/admin`, req.url))
    }

    // Si la ruta comienza con /[tenantid], redirigir a la ruta sin el tenant
    if (path.startsWith(`/${subdomain}/`)) {
      const newPath = path.replace(`/${subdomain}`, "")
      return NextResponse.rewrite(new URL(newPath, req.url))
    }

    // Handle custom routes that should map to admin routes without showing "admin" in the URL
    if (path === "/dashboard") {
      return NextResponse.rewrite(new URL(`/admin/dashboard`, req.url))
    }

    if (path === "/menu") {
      return NextResponse.rewrite(new URL(`/admin/menu`, req.url))
    }

    if (path === "/settings") {
      return NextResponse.rewrite(new URL(`/admin/settings`, req.url))
    }
  }

  // Si estamos en el dominio principal, no hacer nada
  return NextResponse.next()
}
