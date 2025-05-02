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

  console.log(`[Middleware] Processing: ${hostname}${path}`)

  // Obtener el dominio raíz (ej., gastroo.online)
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"
  console.log(`[Middleware] Root domain: ${rootDomain}`)

  // Verificar si es un subdominio del dominio raíz
  let subdomain: string | null = null

  // Verificar si es un subdominio del dominio raíz
  if (hostname.endsWith(`.${rootDomain}`)) {
    subdomain = hostname.replace(`.${rootDomain}`, "")
    console.log(`[Middleware] Subdomain detected: ${subdomain}`)

    if (subdomain !== "www" && subdomain !== "app") {
      // Si estamos en la ruta raíz del subdominio, redirigir al dashboard
      if (path === "/") {
        console.log(`[Middleware] Redirecting to dashboard for subdomain: ${subdomain}`)
        return NextResponse.redirect(new URL(`/dashboard`, req.url))
      }

      // No reescribimos las rutas para que Next.js pueda manejarlas directamente
      console.log(`[Middleware] Allowing direct access to: ${path} for subdomain: ${subdomain}`)
      return NextResponse.next()
    }
  }

  // Para desarrollo local
  if (hostname.includes("localhost")) {
    const subdomainMatch = hostname.match(/^([^.]+)\.localhost/)
    if (subdomainMatch) {
      subdomain = subdomainMatch[1]
      console.log(`[Middleware] Local subdomain detected: ${subdomain}`)

      if (subdomain !== "www" && subdomain !== "app") {
        // Si estamos en la ruta raíz del subdominio, redirigir al dashboard
        if (path === "/") {
          console.log(`[Middleware] Redirecting to dashboard for local subdomain: ${subdomain}`)
          return NextResponse.redirect(new URL(`/dashboard`, req.url))
        }

        // No reescribimos las rutas para que Next.js pueda manejarlas directamente
        console.log(`[Middleware] Allowing direct access to: ${path} for local subdomain: ${subdomain}`)
        return NextResponse.next()
      }
    }
  }

  // Verificar si estamos accediendo a una ruta de tenant específica
  const tenantPathMatch = path.match(/^\/tenant\/([^/]+)/)
  if (tenantPathMatch) {
    const tenantId = tenantPathMatch[1]
    console.log(`[Middleware] Tenant path detected: ${tenantId}`)

    // Si estamos en la ruta raíz del tenant, redirigir al dashboard
    if (path === `/tenant/${tenantId}`) {
      console.log(`[Middleware] Redirecting to dashboard for tenant path: ${tenantId}`)
      return NextResponse.redirect(new URL(`/tenant/${tenantId}/dashboard`, req.url))
    }

    // Continuar con la solicitud
    return NextResponse.next()
  }

  // Si intentamos acceder a rutas de tenant desde el dominio principal
  if (
    (!subdomain || subdomain === "www" || subdomain === "app") &&
    (path.startsWith("/dashboard") || path.startsWith("/settings"))
  ) {
    // Permitir el acceso a estas rutas desde el dominio principal
    return NextResponse.next()
  }

  return NextResponse.next()
}
