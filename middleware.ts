import { type NextRequest, NextResponse } from "next/server"

export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * 1. /api (rutas API)
     * 2. /_next (archivos internos de Next.js)
     * 3. /_static (si usas Vercel para servir archivos estáticos)
     * 4. Todos los archivos estáticos (imágenes, fuentes, favicon, etc.)
     */
    "/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)",
  ],
}

export default function middleware(req: NextRequest) {
  const url = req.nextUrl
  const hostname = req.headers.get("host") || ""

  // Definir el dominio principal (en producción sería tu dominio real)
  const currentHost =
    process.env.NODE_ENV === "production"
      ? hostname.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, "")
      : hostname.replace(`.localhost:3000`, "")

  // Si es el dominio principal, no hacer nada
  if (hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN || hostname === "localhost:3000") {
    return NextResponse.next()
  }

  // Si es un subdominio, reescribir la URL para usar la ruta [domain]
  url.pathname = `/${currentHost}${url.pathname}`
  return NextResponse.rewrite(url)
}
