"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/context/auth-context"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function SimpleProfilePage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [tenantData, setTenantData] = useState<any>(null)

  useEffect(() => {
    async function fetchData() {
      if (!user) {
        console.log("No user found, skipping data fetch")
        setLoading(false)
        return
      }

      try {
        console.log("Fetching data for user:", user.uid, "in tenant:", tenantId)

        // Fetch tenant data
        const tenantDoc = await getDoc(doc(db, "tenants", tenantId))
        if (tenantDoc.exists()) {
          console.log("Tenant data found:", tenantDoc.data())
          setTenantData(tenantDoc.data())
        } else {
          console.log("No tenant document found")
        }

        // Fetch user role data
        const roleDoc = await getDoc(doc(db, `tenants/${tenantId}/roles`, user.uid))
        if (roleDoc.exists()) {
          console.log("User role data found:", roleDoc.data())
          setUserData(roleDoc.data())
        } else {
          console.log("No user role document found")
        }
      } catch (err: any) {
        console.error("Error fetching data:", err)
        setError(err.message || "Error al cargar los datos")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, tenantId])

  if (loading) {
    return <div className="p-8 text-center">Cargando datos del perfil...</div>
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!user) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No hay usuario autenticado</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Perfil Simple</h1>
      <p className="text-gray-500">Versión simplificada para depuración</p>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Datos del Usuario</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify({ user: { uid: user.uid, email: user.email } }, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Datos del Rol</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(userData || "No data", null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Datos del Tenant</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(tenantData || "No data", null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
