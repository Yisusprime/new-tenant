import { Navbar } from "@/components/layout/navbar"
import { requireTenantAdmin } from "@/lib/auth/server-auth"
import { firestore } from "@/lib/firebase/admin"
import { isFirebaseAdminInitialized } from "@/lib/firebase/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

async function getTenantInfo(tenantId: string) {
  try {
    if (!isFirebaseAdminInitialized() || !firestore) {
      console.error("Firebase Admin no está inicializado")
      return null
    }

    const tenantDoc = await firestore.collection("tenants").doc(tenantId).get()

    if (!tenantDoc.exists) {
      return null
    }

    return {
      id: tenantDoc.id,
      ...tenantDoc.data(),
    }
  } catch (error) {
    console.error("Error al obtener información del tenant:", error)
    return null
  }
}

export default async function TenantAdminDashboardPage() {
  // Verificar autenticación
  const session = await requireTenantAdmin()
  const tenantId = session.tenantId as string

  const tenantInfo = await getTenantInfo(tenantId)

  if (!tenantInfo) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar isTenant isAdmin />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Restaurante no encontrado</h1>
            <p className="text-gray-600">No se pudo encontrar la información de tu restaurante.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isTenant tenantName={tenantInfo.name} isAdmin />
      <main className="flex-1 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>
          <p className="mb-4">
            Bienvenido al panel de administración de <strong>{tenantInfo.name}</strong>
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Visitas Hoy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Productos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
