"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { getAllTenants } from "@/lib/services/tenant-service"
import type { Tenant } from "@/lib/models/tenant"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MainNav } from "@/components/layout/main-nav"
import Link from "next/link"

const navItems = [
  {
    title: "Dashboard",
    href: "/superadmin/dashboard",
  },
  {
    title: "Tenants",
    href: "/superadmin/tenants",
  },
  {
    title: "Usuarios",
    href: "/superadmin/usuarios",
  },
]

export default function SuperAdminDashboardPage() {
  const { user, loading } = useAuth()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      if (!loading && (!user || !user.isSuperAdmin)) {
        router.push("/superadmin/login")
      } else if (user) {
        try {
          const tenantsData = await getAllTenants()
          setTenants(tenantsData)
        } catch (error) {
          console.error("Error fetching tenants:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    checkAuth()
  }, [user, loading, router])

  if (loading || isLoading) {
    return <div>Cargando...</div>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <MainNav items={navItems} />
        </div>
      </header>
      <main className="flex-1 container py-10">
        <h1 className="text-3xl font-bold mb-6">Panel de SuperAdmin</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Tenants</CardTitle>
              <CardDescription>Gestiona los tenants de la plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{tenants.length}</p>
              <p className="text-sm text-muted-foreground">Total de tenants</p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/superadmin/tenants">Ver todos</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usuarios</CardTitle>
              <CardDescription>Gestiona los usuarios de la plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">-</p>
              <p className="text-sm text-muted-foreground">Total de usuarios</p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/superadmin/usuarios">Ver todos</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Crear Tenant</CardTitle>
              <CardDescription>Crea un nuevo tenant en la plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Configura un nuevo tenant con su subdominio personalizado</p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/superadmin/tenants/crear">Crear tenant</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
