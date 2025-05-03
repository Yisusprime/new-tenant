import { CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TenantAdminSidebar } from "@/components/tenant-admin-sidebar"
import { getTenantInfo } from "@/lib/tenant-utils"

export default async function TenantAdminDashboardPage({ params }: { params: { tenantid: string } }) {
  const { tenantid } = params
  const tenantInfo = await getTenantInfo(tenantid)

  if (!tenantInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Tenant no encontrado</CardTitle>
            <CardDescription className="text-center">
              El tenant "{tenantid}" no existe o no está disponible
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Link href="/">
              <Button>Volver al inicio</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <TenantAdminSidebar tenantid={tenantid} />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Panel de Administración - {tenantInfo.name}</h1>

        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Información del Tenant</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Nombre:</span>
                      <span>{tenantInfo.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Subdominio:</span>
                      <span>{tenantid}.gastroo.online</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Estado:</span>
                      <span className="flex items-center">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                        Activo
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <p className="text-3xl font-bold">24</p>
                      <p className="text-sm text-muted-foreground">Usuarios</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <p className="text-3xl font-bold">142</p>
                      <p className="text-sm text-muted-foreground">Transacciones</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Usuarios</CardTitle>
                  <CardDescription>Gestiona los usuarios de tu tenant</CardDescription>
                </div>
                <Button>Añadir Usuario</Button>
              </CardHeader>
              <CardContent>
                <p>Lista de usuarios en construcción...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Tenant</CardTitle>
                <CardDescription>Personaliza la configuración de tu tenant</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Configuración del tenant en construcción...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
