"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Dashboard() {
  const router = useRouter()
  const { user, userProfile, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si el usuario está autenticado
    if (!authLoading && !user) {
      console.log("Usuario no autenticado, redirigiendo a login")
      router.push("/login")
      return
    }

    // Si el usuario está autenticado y tiene un tenant, redirigir al subdominio
    if (user && userProfile?.tenantId && userProfile?.isTenantOwner) {
      const hostname = window.location.hostname
      const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"

      // Si estamos en el dominio principal (no en un subdominio)
      if (hostname === rootDomain || hostname === `www.${rootDomain}` || hostname === "localhost") {
        console.log(`Redirigiendo al subdominio del tenant: ${userProfile.tenantId}`)
        window.location.href = `https://${userProfile.tenantId}.${rootDomain}/dashboard`
        return
      }
    }

    setLoading(false)
  }, [user, userProfile, authLoading, router])

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="container py-12">
          <p>Cargando...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return null // La redirección ya se maneja en el useEffect
  }

  return (
    <DashboardLayout>
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">Dashboard Principal</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Bienvenido a tu dashboard</CardTitle>
              <CardDescription>Este es el dashboard principal de la plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Aquí podrás gestionar todos los aspectos de tu negocio.</p>
              {userProfile?.tenantId && userProfile?.isTenantOwner && (
                <div className="mt-4">
                  <Button
                    onClick={() => {
                      const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"
                      window.location.href = `https://${userProfile.tenantId}.${rootDomain}/dashboard`
                    }}
                  >
                    Ir a mi subdominio
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información del usuario</CardTitle>
              <CardDescription>Detalles sobre tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {userProfile && (
                  <>
                    <p>
                      <strong>Nombre:</strong> {userProfile.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {userProfile.email}
                    </p>
                    <p>
                      <strong>Rol:</strong> {userProfile.role}
                    </p>
                    {userProfile.tenantId && (
                      <p>
                        <strong>Tenant ID:</strong> {userProfile.tenantId}
                      </p>
                    )}
                    {userProfile.companyName && (
                      <p>
                        <strong>Empresa:</strong> {userProfile.companyName}
                      </p>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
