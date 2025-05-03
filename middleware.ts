// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Configuración de dominios
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"
const WWW_DOMAIN = `www.${ROOT_DOMAIN}`

// Función mejorada para detectar subdominios
function getSubdomain(host: string): string | null {
  // Eliminar puerto si existe (para desarrollo)
  const cleanHost = host.split(':')[0]

  // Casos especiales
  if (cleanHost === ROOT_DOMAIN || cleanHost === WWW_DOMAIN) return null
  
  // Desarrollo local
  if (cleanHost.includes('localhost')) {
    const parts = cleanHost.split('.')
    return parts.length > 1 ? parts[0] : null
  }

  // Producción: extraer subdominio
  if (cleanHost.endsWith(`.${ROOT_DOMAIN}`)) {
    const subdomain = cleanHost.replace(`.${ROOT_DOMAIN}`, '')
    return subdomain && subdomain !== 'www' ? subdomain : null
  }

  return null
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const host = request.headers.get('host') || ''
  const pathname = url.pathname
  const subdomain = getSubdomain(host)

  // 1. Excluir archivos estáticos y API routes
  const EXCLUDED_PATHS = [
    '/_next', 
    '/api', 
    '/static',
    '/favicon.ico',
    '/public',
    '/images'
  ]
  
  if (EXCLUDED_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // 2. Manejo para el dominio principal (www o root)
  if (!subdomain) {
    // Permitir acceso directo a rutas públicas
    const PUBLIC_ROUTES = ['/registro', '/login', '/']
    if (PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/auth')) {
      return NextResponse.next()
    }
    
    // Redirigir otras rutas no definidas
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 3. Manejo para subdominios de tenants
  const tenant = subdomain
  
  // Ruta base del tenant
  if (pathname === '/') {
    const newUrl = new URL(`/${tenant}`, request.url)
    return NextResponse.rewrite(newUrl)
  }

  // Ruta de administración
  if (pathname.startsWith('/admin')) {
    const newPath = pathname.replace('/admin', `/${tenant}/admin`)
    const newUrl = new URL(newPath, request.url)
    return NextResponse.rewrite(newUrl)
  }

  // Otras rutas del tenant
  if (!pathname.startsWith(`/${tenant}`)) {
    const newUrl = new URL(`/${tenant}${pathname}`, request.url)
    return NextResponse.rewrite(newUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
