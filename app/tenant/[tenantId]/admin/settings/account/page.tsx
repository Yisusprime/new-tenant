import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Lock } from "lucide-react"

export default function AccountSettingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Configuración de Cuenta</h1>
        <p className="text-gray-500 mt-1">Administra tu cuenta y seguridad</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cambiar Contraseña</CardTitle>
            <CardDescription>Actualiza tu contraseña para mantener tu cuenta segura</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">
              <Lock className="mr-2 h-4 w-4" />
              Cambiar Contraseña
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Eliminar Cuenta</CardTitle>
            <CardDescription>Elimina permanentemente tu cuenta y todos tus datos</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Advertencia</AlertTitle>
              <AlertDescription>
                Esta acción es irreversible y eliminará permanentemente todos tus datos.
              </AlertDescription>
            </Alert>
            <Button variant="destructive" className="mt-4">
              Eliminar Cuenta
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
