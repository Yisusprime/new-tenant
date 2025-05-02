"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { updateTenantOwnersRoles } from "@/app/actions/admin-actions"

export default function AdminSystemPage() {
  const { userProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null)

  const handleUpdateTenantOwners = async () => {
    setLoading(true)
    setResult(null)

    try {
      // Llamar a la acción del servidor
      const response = await updateTenantOwnersRoles()

      if (response.success) {
        setResult({
          success: true,
          message: response.message || `Actualización completada. ${response.updated} usuarios actualizados.`,
        })
      } else {
        setResult({
          success: false,
          error: response.error || "Error al actualizar los propietarios de tenants",
        })
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || "Error al actualizar los propietarios de tenants",
      })
    } finally {
      setLoading(false)
    }
  }

  // Solo permitir acceso a superadmin o admin
  if (userProfile?.role !== "superadmin" && userProfile?.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="container py-12">
          <Alert variant="destructive">
            <AlertDescription>No tienes permiso para acceder a esta página</AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">Administración del Sistema</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Actualizar Roles de Propietarios de Tenants</CardTitle>
            <CardDescription>
              Esta acción actualizará todos los usuarios que son propietarios de tenants pero tienen rol "user" a rol
              "admin".
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result && (
              <Alert variant={result.success ? "default" : "destructive"} className="mb-4">
                <AlertDescription>{result.message || result.error}</AlertDescription>
              </Alert>
            )}
            <p className="text-muted-foreground mb-4">
              Utiliza esta función para corregir los roles de los propietarios de tenants que fueron creados con el rol
              incorrecto.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleUpdateTenantOwners} disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar Roles"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  )
}
