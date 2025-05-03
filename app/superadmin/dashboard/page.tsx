import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { requireSuperAdmin } from "@/lib/auth/server-auth"
import { firestore } from "@/lib/firebase/admin"
import { isFirebaseAdminInitialized } from "@/lib/firebase/admin"

async function getTenantCount() {
  try {
    if (!isFirebaseAdminInitialized() || !firestore) {
      console.error("Firebase Admin no está inicializado")
      return 0
    }

    const tenantsSnapshot = await firestore.collection("tenants").count().get()
    return tenantsSnapshot.data().count
  } catch (error) {
    console.error("Error al obtener el conteo de tenants:", error)
    return 0
  }
}

export default async function SuperAdminDashboardPage() {
  // Verificar autenticación
  const session = await requireSuperAdmin()

  const tenantCount = await getTenantCount()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isSuperAdmin />
      <main className="flex-1 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Panel de Super Administrador</h1>
          <p className="mb-4">Bienvenido, {session.email}</p>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total de Tenants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{tenantCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tenants Activos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{tenantCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Usuarios Registrados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">--</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
