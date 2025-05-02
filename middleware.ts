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

  console.log(`Middleware processing: ${hostname}${path}`) // Añadir log para depuración

  // Obtener el dominio raíz (ej., gastroo.online)
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"
  console.log(`Root domain: ${rootDomain}`)

  // Verificar si es un subdominio del dominio raíz
  let subdomain: string | null = null

  if (hostname.endsWith(`.${rootDomain}`)) {
    subdomain = hostname.replace(`.${rootDomain}`, "")
    console.log(`Subdomain detected: ${subdomain}`)

    if (subdomain !== "www" && subdomain !== "app") {
      // Si estamos en la ruta raíz del subdominio, redirigir al dashboard
      if (path === "/") {
        console.log(`Redirecting to dashboard for subdomain: ${subdomain}`)
        return NextResponse.redirect(new URL(`/dashboard`, req.url))
      }

      // Para cualquier otra ruta, reescribir a la ruta del tenant
      const newPath = `/tenant/${subdomain}${path}`
      console.log(`Rewriting to: ${newPath}`)

      // Crear una nueva URL con la ruta reescrita
      const newUrl = new URL(newPath, req.url)
      return NextResponse.rewrite(newUrl)
    }
  }

  // Para desarrollo local
  if (hostname.includes("localhost")) {
    const subdomainMatch = hostname.match(/^([^.]+)\.localhost/)
    if (subdomainMatch) {
      subdomain = subdomainMatch[1]
      console.log(`Local subdomain detected: ${subdomain}`)

      if (subdomain !== "www" && subdomain !== "app") {
        // Si estamos en la ruta raíz del subdominio, redirigir al dashboard
        if (path === "/") {
          console.log(`Redirecting to dashboard for local subdomain: ${subdomain}`)
          return NextResponse.redirect(new URL(`/dashboard`, req.url))
        }

        // Para cualquier otra ruta, reescribir a la ruta del tenant
        const newPath = `/tenant/${subdomain}${path}`
        console.log(`Rewriting to: ${newPath}`)

        // Crear una nueva URL con la ruta reescrita
        const newUrl = new URL(newPath, req.url)
        return NextResponse.rewrite(newUrl)
      }
    }
  }

  // Si intentamos acceder a rutas de tenant desde el dominio principal
  if (
    (!subdomain || subdomain === "www" || subdomain === "app") &&
    (path.startsWith("/dashboard") || path.startsWith("/settings"))
  ) {
    console.log(`Redirecting from tenant path to main domain`)
    return NextResponse.redirect(new URL("/", req.url))
  }

  return NextResponse.next()
}
