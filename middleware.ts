import { type NextRequest, NextResponse } from "next/server"

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /static (public files)
     * 4. /_vercel (Vercel internals)
     * 5. all root files inside /public (robots.txt, favicon.ico, etc.)
     */
    "/((?!api|_next|static|_vercel|[\\w-]+\\.\\w+).*)",
  ],
}

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl
  const hostname = req.headers.get("host") || ""
  const path = url.pathname

  // Verificar si estamos usando la ruta /tenant/[tenant-name]
  const tenantPathMatch = path.match(/^\/tenant\/([^/]+)/)
  if (tenantPathMatch) {
    const tenantId = tenantPathMatch[1]

    // Si estamos en la ruta raíz del tenant, redirigir al dashboard
    if (path === `/tenant/${tenantId}`) {
      return NextResponse.redirect(new URL(`/tenant/${tenantId}/dashboard`, req.url))
    }

    // Continuar con la solicitud
    return NextResponse.next()
  }

  // Obtener información del dominio a través de la API
  const domainResponse = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/domains?hostname=${encodeURIComponent(hostname)}`,
  )

  if (!domainResponse.ok) {
    // Si hay un error, continuar con la solicitud normal
    return NextResponse.next()
  }

  const domainInfo = await domainResponse.json()

  // Define the paths that are only accessible on the main domain
  const mainDomainPaths = ["/", "/login", "/register", "/pricing"]

  // If it's a custom domain or subdomain
  if (domainInfo.isCustomDomain || domainInfo.isSubdomain) {
    // If trying to access main domain paths on a custom domain, redirect to dashboard
    if (mainDomainPaths.includes(url.pathname)) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Rewrite to the tenant path
    url.pathname = `/tenant${url.pathname}`
    return NextResponse.rewrite(url)
  }

  // If trying to access tenant paths on the main domain, redirect to home
  if (url.pathname.startsWith("/dashboard") || url.pathname.startsWith("/settings")) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return NextResponse.next()
}
