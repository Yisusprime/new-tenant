import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { User, Shield, CreditCard } from "lucide-react"

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-gray-500 mt-1">Administra tu cuenta y preferencias</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Perfil
            </CardTitle>
            <CardDescription>Actualiza tu información personal</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">Gestiona tu foto de perfil, información de contacto y detalles personales.</p>
            <Button asChild>
              <Link href="/admin/settings/profile">Ir a Perfil</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Cuenta
            </CardTitle>
            <CardDescription>Gestiona tu cuenta y seguridad</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">Cambia tu contraseña, configura la autenticación de dos factores y más.</p>
            <Button asChild>
              <Link href="/admin/settings/account">Ir a Cuenta</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Plan y Facturación
            </CardTitle>
            <CardDescription>Gestiona tu suscripción y pagos</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">Actualiza tu plan, revisa facturas y gestiona métodos de pago.</p>
            <Button asChild>
              <Link href="/admin/plans">Ir a Planes</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
