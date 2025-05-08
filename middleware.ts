import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export const config = {
  matcher: [
    // Excluir explícitamente las rutas de API y otros archivos del sistema
    "/((?!api|_next|_static|_vercel|favicon.ico|.*\\..*|.*\\.[^\\/]+$).*)",
  ],
}

export default function middleware(req: NextRequest) {
  const url = req.nextUrl
  const hostname = req.headers.get("host") || ""
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"

  // Verificar si estamos en localhost para desarrollo
  const isLocalhost = hostname.includes("localhost") || hostname.includes("127.0.0.1")

  // Si estamos en localhost, no aplicamos la lógica de subdominios
  if (isLocalhost) {
    return NextResponse.next()
  }

  // Verificar si es una ruta de API
  if (url.pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  // Check if hostname is a subdomain
  const currentHost = hostname.replace(`.${rootDomain}`, "")

  // If it's the root domain, don't rewrite
  if (hostname === rootDomain || hostname === `www.${rootDomain}`) {
    return NextResponse.next()
  }

  // Rewrite for subdomain - IMPORTANTE: Asegurarse de que la ruta sea correcta
  const newUrl = new URL(`/tenant/${currentHost}${url.pathname}`, req.url)
  console.log(`Rewriting ${req.url} to ${newUrl.toString()}`)

  return NextResponse.rewrite(newUrl)
}
