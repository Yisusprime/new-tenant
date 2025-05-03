import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SuperAdminSidebar } from "@/components/superadmin-sidebar"

export default function SuperAdminDashboardPage() {
  // Datos de ejemplo
  const tenants = [
    { id: "restaurant1", name: "Restaurante El Buen Sabor", domain: "restaurant1.gastroo.online", status: "active" },
    { id: "cafeteria", name: "Café del Centro", domain: "cafeteria.gastroo.online", status: "active" },
    { id: "pizzeria", name: "Pizza Express", domain: "pizzeria.gastroo.online", status: "pending" },
  ]

  return (
    <div className="flex min-h-screen">
      <SuperAdminSidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Panel de Super Administrador</h1>

        <Tabs defaultValue="tenants">
          <TabsList className="mb-4">
            <TabsTrigger value="tenants">Tenants</TabsTrigger>
            <TabsTrigger value="stats">Estadísticas</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="tenants">
            <div className="grid gap-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Tenants Registrados</h2>
                <Button>Añadir Nuevo Tenant</Button>
              </div>

              <div className="grid gap-4">
                {tenants.map((tenant) => (
                  <Card key={tenant.id}>
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{tenant.name}</h3>
                        <p className="text-sm text-muted-foreground">{tenant.domain}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block w-3 h-3 rounded-full ${
                            tenant.status === "active" ? "bg-green-500" : "bg-amber-500"
                          }`}
                        ></span>
                        <span className="text-sm">{tenant.status === "active" ? "Activo" : "Pendiente"}</span>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/superadmin/tenants/${tenant.id}`}>Gestionar</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas Generales</CardTitle>
                <CardDescription>Resumen de actividad en la plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <p className="text-4xl font-bold">{tenants.length}</p>
                    <p className="text-sm text-muted-foreground">Total Tenants</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <p className="text-4xl font-bold">{tenants.filter((t) => t.status === "active").length}</p>
                    <p className="text-sm text-muted-foreground">Tenants Activos</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <p className="text-4xl font-bold">{tenants.filter((t) => t.status === "pending").length}</p>
                    <p className="text-sm text-muted-foreground">Tenants Pendientes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de la Plataforma</CardTitle>
                <CardDescription>Gestiona la configuración global</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Configuración del sistema en construcción...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
