"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import TenantNavbar from "@/components/tenant-navbar"

export default function TenantDashboard() {
  const params = useParams()
  const tenantId = params?.tenantId as string
  const router = useRouter()
  const { user, userProfile, loading: authLoading } = useAuth()
  const [tenantData, setTenantData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    // Solo verificar autenticación una vez que authLoading sea false
    if (!authLoading) {
      if (!user) {
        console.log("Usuario no autenticado, redirigiendo a login")
        router.push(`/tenant/${tenantId}/login`)
      }
      setAuthChecked(true)
    }
  }, [user, authLoading, tenantId, router])

  useEffect(() => {
    // Cargar datos del tenant solo si el usuario está autenticado
    async function fetchTenantData() {
      if (!tenantId || !authChecked || !user) return

      try {
        console.log("Fetching tenant data for:", tenantId)
        const tenantDoc = await getDoc(doc(db, "tenants", tenantId))

        if (tenantDoc.exists()) {
          console.log("Tenant data found:", tenantDoc.data())
          setTenantData(tenantDoc.data())
        } else {
          console.log("No tenant found with ID:", tenantId)
        }
      } catch (err) {
        console.error("Error fetching tenant data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchTenantData()
  }, [tenantId, authChecked, user])

  // Mostrar estado de carga mientras se verifica la autenticación
  if (authLoading || (loading && user)) {
    return (
      <div className="flex flex-col min-h-screen">
        <TenantNavbar tenantId={tenantId} />
        <div className="container py-12">
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario autenticado, no renderizar nada (la redirección ya se maneja en useEffect)
  if (!user) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen">
      <TenantNavbar tenantId={tenantId} />
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">Dashboard de {tenantData?.name || tenantId}</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Bienvenido a tu dashboard</CardTitle>
              <CardDescription>Este es el dashboard personalizado para el tenant {tenantId}.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Aquí podrás gestionar todos los aspectos de tu negocio.</p>
              <div className="mt-4">
                <Button>Comenzar</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información del tenant</CardTitle>
              <CardDescription>Detalles sobre tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>Tenant ID:</strong> {tenantId}
                </p>
                <p>
                  <strong>Dominio:</strong> {tenantId}.gastroo.online
                </p>
                {tenantData && (
                  <>
                    <p>
                      <strong>Nombre:</strong> {tenantData.name}
                    </p>
                    <p>
                      <strong>Creado:</strong> {new Date(tenantData.createdAt).toLocaleDateString()}
                    </p>
                  </>
                )}
                {userProfile && (
                  <>
                    <p>
                      <strong>Usuario:</strong> {userProfile.name}
                    </p>
                    <p>
                      <strong>Rol:</strong> {userProfile.role}
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
