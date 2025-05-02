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

  // Verificar si estamos en el dominio principal
  const isMainDomain = hostname === rootDomain || hostname === `www.${rootDomain}`

  // Verificar si es un subdominio
  const isSubdomain = !isMainDomain && (hostname.endsWith(`.${rootDomain}`) || hostname.includes(".localhost"))

  // Extraer el nombre del subdominio
  let subdomain: string | null = null
  if (hostname.endsWith(`.${rootDomain}`)) {
    subdomain = hostname.replace(`.${rootDomain}`, "")
  } else if (hostname.includes(".localhost")) {
    const subdomainMatch = hostname.match(/^([^.]+)\.localhost/)
    if (subdomainMatch) {
      subdomain = subdomainMatch[1]
    }
  }

  console.log(`[Middleware] Is main domain: ${isMainDomain}, Is subdomain: ${isSubdomain}, Subdomain: ${subdomain}`)

  // REGLA 1: Si intentamos acceder a rutas de superadmin desde un subdominio, redirigir a unauthorized
  if (isSubdomain && path.startsWith("/superadmin")) {
    console.log(`[Middleware] Blocking access to superadmin routes from subdomain: ${subdomain}`)
    return NextResponse.redirect(new URL(`/unauthorized`, req.url))
  }

  // REGLA 2: Si estamos en un subdominio e intentamos acceder a /login o /register, redirigir a la versión específica del tenant
  if (isSubdomain) {
    if (path === "/login") {
      console.log(`[Middleware] Redirecting login to tenant-specific login: ${subdomain}`)
      return NextResponse.redirect(new URL(`/tenant/${subdomain}/login`, req.url))
    }

    if (path === "/register") {
      console.log(`[Middleware] Redirecting register to tenant-specific register: ${subdomain}`)
      return NextResponse.redirect(new URL(`/tenant/${subdomain}/register`, req.url))
    }

    // Si estamos en la ruta raíz del subdominio, redirigir al dashboard
    if (path === "/") {
      console.log(`[Middleware] Redirecting to dashboard for subdomain: ${subdomain}`)
      return NextResponse.redirect(new URL(`/dashboard`, req.url))
    }
  }

  // REGLA 3: Si estamos en el dominio principal, permitir acceso a todas las rutas
  if (isMainDomain) {
    console.log(`[Middleware] Main domain access, allowing all routes`)
    return NextResponse.next()
  }

  // REGLA 4: Para subdominios, permitir acceso a rutas específicas
  if (isSubdomain) {
    // Permitir acceso directo a dashboards específicos de rol (excepto superadmin)
    const allowedDashboards = [
      "/dashboard",
      "/admin/dashboard",
      "/manager/dashboard",
      "/waiter/dashboard",
      "/delivery/dashboard",
      "/client/dashboard",
      "/user/dashboard",
    ]

    const isDashboardPath = allowedDashboards.some(
      (dashboard) => path === dashboard || path.startsWith(`${dashboard}/`),
    )

    if (isDashboardPath) {
      console.log(`[Middleware] Allowing direct access to dashboard for subdomain: ${subdomain}`)
      return NextResponse.next()
    }

    // Permitir acceso a rutas específicas de tenant
    if (path.startsWith(`/tenant/${subdomain}`)) {
      console.log(`[Middleware] Allowing access to tenant-specific route: ${path}`)
      return NextResponse.next()
    }
  }

  // Por defecto, permitir la solicitud
  return NextResponse.next()
}
