"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugPage() {
  const { user, loading, refreshUserData } = useAuth()

  const handleRefresh = async () => {
    await refreshUserData()
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Página de Depuración</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Estado de Autenticación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              <strong>Cargando:</strong> {loading ? "Sí" : "No"}
            </p>
            <p>
              <strong>Usuario autenticado:</strong> {user ? "Sí" : "No"}
            </p>
            {user && (
              <>
                <p>
                  <strong>UID:</strong> {user.uid}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Nombre:</strong> {user.name || "No disponible"}
                </p>
                <p>
                  <strong>Rol:</strong> {user.role || "No disponible"}
                </p>
                <p>
                  <strong>Tenant ID:</strong> {user.tenantId || "No disponible"}
                </p>
              </>
            )}
          </div>
          <Button onClick={handleRefresh} className="mt-4">
            Refrescar datos de usuario
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Enlaces de Superadmin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <a href="/superadmin/login" className="text-blue-500 hover:underline">
                Login de Superadmin
              </a>
            </p>
            <p>
              <a href="/superadmin/dashboard" className="text-blue-500 hover:underline">
                Dashboard de Superadmin
              </a>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enlaces de Tenant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <a href="/login" className="text-blue-500 hover:underline">
                Login Principal
              </a>
            </p>
            <p>
              <a href="/register" className="text-blue-500 hover:underline">
                Registro de Tenant
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
