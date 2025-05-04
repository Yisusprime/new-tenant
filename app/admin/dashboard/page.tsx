"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TenantAdminSidebar } from "@/components/tenant-admin-sidebar"
import { getTenantInfo } from "@/lib/tenant-utils"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ShoppingBag, Users, TrendingUp, ArrowRight } from "lucide-react"

export default function TenantAdminDashboardPage() {
  const { user, loading, logout, checkUserRole } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [tenantInfo, setTenantInfo] = useState<any>(null)
  const [loadingTenant, setLoadingTenant] = useState(true)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [isLogoutRef, setIsLogoutRef] = useState(false)

  // Estadísticas de ejemplo
  const stats = [
    { name: "Pedidos hoy", value: 24, icon: ShoppingBag, change: "+12%" },
    { name: "Clientes nuevos", value: 8, icon: Users, change: "+5%" },
    { name: "Ingresos", value: "€1,240", icon: TrendingUp, change: "+18%" },
    { name: "Valoración media", value: "4.8", icon: Star, change: "+0.2" },
  ]

  // Obtener el tenantId del hostname
  useEffect(() => {
    const hostname = window.location.hostname
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"

    if (hostname.includes(`.${rootDomain}`) && !hostname.startsWith("www.")) {
      const subdomain = hostname.replace(`.${rootDomain}`, "")
      setTenantId(subdomain)
    }
  }, [])

  useEffect(() => {
    async function fetchTenantInfo() {
      if (!tenantId) return

      try {
        const info = await getTenantInfo(tenantId)
        setTenantInfo(info)
      } catch (error) {
        console.error("Error al obtener información del tenant:", error)
      } finally {
        setLoadingTenant(false)
      }
    }

    if (tenantId) {
      fetchTenantInfo()
    }
  }, [tenantId])

  useEffect(() => {
    // Verificar si el usuario está autenticado y tiene acceso a este tenant
    if (
      !loading &&
      !isLogoutRef &&
      tenantId &&
      (!user || (user.tenantId !== tenantId && !checkUserRole("superadmin")))
    ) {
      toast({
        title: "Acceso denegado",
        description: "No tienes permisos para acceder a este dashboard.",
        variant: "destructive",
      })
      router.push(`/login`)
    }
  }, [user, loading, tenantId, router, toast, checkUserRole, isLogoutRef])

  const handleLogout = async () => {
    setIsLogoutRef(true)
    await logout()
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
    })
    router.push(`/login`)
  }

  if (loading || loadingTenant || !tenantId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando...</span>
      </div>
    )
  }

  if (!tenantInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Tenant no encontrado</h2>
            <p className="text-muted-foreground mb-4">El tenant "{tenantId}" no existe o no está disponible</p>
            <Link href="/">
              <Button>Volver al inicio</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <TenantAdminSidebar tenantid={tenantId} />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Panel de Administración</h1>
            <p className="text-muted-foreground">Bienvenido, {user?.name || user?.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </div>
        </div>

        {/* Resumen de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-sm">{stat.name}</span>
                  <span className="text-2xl font-bold">{stat.value}</span>
                  <span className={`text-xs ${stat.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                    {stat.change} vs. ayer
                  </span>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Accesos rápidos */}
        <h2 className="text-xl font-bold mb-4">Accesos rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/admin/profile">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-lg">Perfil Personal</h3>
                  <p className="text-muted-foreground text-sm">Gestiona tu información personal</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/restaurant">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-lg">Datos del Local</h3>
                  <p className="text-muted-foreground text-sm">Configura la información de tu restaurante</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/menu">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-lg">Menú</h3>
                  <p className="text-muted-foreground text-sm">Gestiona tus productos y categorías</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Actividad reciente */}
        <h2 className="text-xl font-bold mb-4">Actividad reciente</h2>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Nuevo pedido #{1000 + index}</p>
                    <p className="text-sm text-muted-foreground">Cliente: Juan Pérez</p>
                    <p className="text-xs text-muted-foreground">Hace {10 + index * 5} minutos</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="font-medium">€{(25.99 + index * 10).toFixed(2)}</p>
                    <Badge variant="outline" className="mt-1">
                      Pendiente
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Star(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function Badge({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode
  className?: string
  variant?: "default" | "outline" | "secondary" | "destructive"
}) {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"

  const variantClasses = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "border border-input",
    destructive: "bg-destructive text-destructive-foreground",
  }

  return <span className={`${baseClasses} ${variantClasses[variant]} ${className || ""}`}>{children}</span>
}
