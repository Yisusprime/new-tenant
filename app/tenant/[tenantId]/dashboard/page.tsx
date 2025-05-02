"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import DashboardLayout from "@/components/dashboard-layout"

export default function TenantDashboard() {
  const params = useParams()
  const tenantId = params?.tenantId as string
  const [tenantData, setTenantData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTenantData() {
      if (!tenantId) return

      try {
        console.log("Fetching tenant data for:", tenantId)
        const tenantDoc = await getDoc(doc(db, "tenants", tenantId))

        if (tenantDoc.exists()) {
          console.log("Tenant data found:", tenantDoc.data())
          setTenantData(tenantDoc.data())
        } else {
          console.log("No tenant found with ID:", tenantId)
          setError(`No se encontró el tenant: ${tenantId}`)
        }
      } catch (err) {
        console.error("Error fetching tenant data:", err)
        setError("Error al cargar los datos del tenant")
      } finally {
        setLoading(false)
      }
    }

    fetchTenantData()
  }, [tenantId])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container py-12">
          <p>Cargando datos del tenant...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="container py-12">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">Dashboard de {tenantData?.name || tenantId}</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">Bienvenido a tu dashboard</h2>
            <p className="text-muted-foreground">Este es el dashboard personalizado para el tenant {tenantId}.</p>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">Información del tenant</h2>
            <p className="text-muted-foreground">Tenant ID: {tenantId}</p>
            <p className="text-muted-foreground mt-2">Dominio: {tenantId}.gastroo.online</p>
            {tenantData && (
              <>
                <p className="text-muted-foreground mt-2">Nombre: {tenantData.name}</p>
                <p className="text-muted-foreground mt-2">
                  Creado: {new Date(tenantData.createdAt).toLocaleDateString()}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
