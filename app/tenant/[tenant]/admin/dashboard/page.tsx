"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { useTenant } from "@/lib/context/tenant-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { TenantNav } from "@/components/layout/tenant-nav"
import Link from "next/link"
import { notFound } from "next/navigation"

const navItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
  },
  {
    title: "Menú",
    href: "/admin/menu",
  },
  {
    title: "Pedidos",
    href: "/admin/pedidos",
  },
  {
    title: "Configuración",
    href: "/admin/configuracion",
  },
]

export default function TenantAdminDashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { tenant, loading: tenantLoading, error } = useTenant()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  if (tenantLoading || authLoading) {
    return <div>Cargando...</div>
  }

  if (error || !tenant) {
    return notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <TenantNav items={navItems} />
        </div>
      </header>
      <main className="flex-1 container py-10">
        <h1 className="text-3xl font-bold mb-6">Panel de Administración - {tenant.name}</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Menú</CardTitle>
              <CardDescription>Gestiona los elementos del menú</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Añade, edita o elimina elementos del menú</p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/admin/menu">Gestionar menú</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pedidos</CardTitle>
              <CardDescription>Gestiona los pedidos recibidos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Visualiza y gestiona los pedidos de los clientes</p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/admin/pedidos">Ver pedidos</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
              <CardDescription>Configura tu restaurante</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Personaliza la apariencia y configuración de tu restaurante
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/admin/configuracion">Configurar</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
