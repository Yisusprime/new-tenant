"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Globe, Database, BarChart3, Building, Shield } from "lucide-react"
import Link from "next/link"
import LoadingScreen from "@/components/loading-screen"
import { collection, getDocs, getDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function SuperAdminDashboard() {
  const router = useRouter()
  const { user, userProfile, loading } = useAuth()
  const [tenantCount, setTenantCount] = useState(0)
  const [userCount, setUserCount] = useState(0)
  const [domainCount, setDomainCount] = useState(0)
  const [systemStats, setSystemStats] = useState<any>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (!loading && (!user || userProfile?.role !== "superadmin")) {
      router.push("/login")
    }
  }, [user, userProfile, loading, router])

  // Cargar datos reales para el dashboard de superadmin
  useEffect(() => {
    if (!user || !userProfile || userProfile.role !== "superadmin") return

    const fetchStats = async () => {
      try {
        setLoadingStats(true)

        // Obtener conteo de tenants
        const tenantsRef = collection(db, "tenants")
        const tenantsSnapshot = await getDocs(tenantsRef)
        setTenantCount(tenantsSnapshot.size)

        // Obtener conteo de usuarios
        const usersRef = collection(db, "users")
        const usersSnapshot = await getDocs(usersRef)
        setUserCount(usersSnapshot.size)

        // Obtener conteo de dominios personalizados
        const domainsRef = collection(db, "domains")
        const domainsSnapshot = await getDocs(domainsRef)
        setDomainCount(domainsSnapshot.size)

        // Obtener estadísticas del sistema
        const statsDoc = await getDoc(doc(db, "system", "stats"))
        if (statsDoc.exists()) {
          setSystemStats(statsDoc.data())
        }

        setLoadingStats(false)
      } catch (error) {
        console.error("Error fetching stats:", error)
        setLoadingStats(false)
      }
    }

    fetchStats()
  }, [user, userProfile])

  if (loading || !user || !userProfile) {
    return <LoadingScreen />
  }

  return (
    <DashboardLayout>
      <div className="container py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard de Superadministrador</h1>
            <p className="text-muted-foreground">Gestión global de la plataforma gastroo.online</p>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Superadmin: {userProfile.name}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Restaurantes</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loadingStats ? "..." : tenantCount}</div>
              <p className="text-xs text-muted-foreground">Restaurantes registrados en la plataforma</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loadingStats ? "..." : userCount}</div>
              <p className="text-xs text-muted-foreground">Usuarios registrados en todos los restaurantes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Dominios Personalizados</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loadingStats ? "..." : domainCount}</div>
              <p className="text-xs text-muted-foreground">Dominios personalizados configurados</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>Gestión global de la plataforma</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Link href="/superadmin/tenants">
                <Button variant="outline" className="w-full justify-start">
                  <Building className="mr-2 h-4 w-4" />
                  Gestionar Restaurantes
                </Button>
              </Link>
              <Link href="/superadmin/users">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Gestionar Usuarios
                </Button>
              </Link>
              <Link href="/superadmin/domains">
                <Button variant="outline" className="w-full justify-start">
                  <Globe className="mr-2 h-4 w-4" />
                  Gestionar Dominios
                </Button>
              </Link>
              <Link href="/superadmin/database">
                <Button variant="outline" className="w-full justify-start">
                  <Database className="mr-2 h-4 w-4" />
                  Gestionar Base de Datos
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estadísticas del Sistema</CardTitle>
              <CardDescription>Información global de la plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="flex items-center justify-center h-40">
                  <p>Cargando estadísticas...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Último registro</p>
                      <p className="text-lg">
                        {systemStats?.lastRegistration
                          ? new Date(systemStats.lastRegistration).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Usuarios totales</p>
                      <p className="text-lg">{systemStats?.userCount || 0}</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      Última actualización:{" "}
                      {systemStats?.lastUpdated ? new Date(systemStats.lastUpdated).toLocaleString() : "Nunca"}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Actividad de la Plataforma</CardTitle>
            <CardDescription>Uso y rendimiento global</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Las estadísticas detalladas estarán disponibles pronto</p>
              <Button variant="outline" className="mt-4">
                Ver Análisis Completo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
