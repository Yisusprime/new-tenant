import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get("host") || ""
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"
  const currentHost = hostname.replace(`.${rootDomain}`, "")

  // Si es el dominio principal, no hacemos nada
  if (hostname === rootDomain || hostname.startsWith("www.")) {
    return NextResponse.next()
  }

  // Si es un subdominio
  const pathWithoutPrefix = url.pathname

  // Redirigir a la ruta del tenant
  url.pathname = `/tenant/${currentHost}${pathWithoutPrefix}`

  return NextResponse.rewrite(url)
}

export const config = {
  matcher: [
    // Excluir rutas estáticas
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
}
