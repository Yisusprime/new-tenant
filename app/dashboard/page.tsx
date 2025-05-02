"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import DashboardLayout from "@/components/dashboard-layout"

export default function Dashboard() {
  const router = useRouter()
  const [hostname, setHostname] = useState<string>("")
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [tenantData, setTenantData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Solo se ejecuta en el cliente
    const host = window.location.hostname
    setHostname(host)

    // Obtener el dominio raíz (ej., gastroo.online)
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"

    // Verificar si es un subdominio del dominio raíz
    if (host.endsWith(`.${rootDomain}`)) {
      const subdomain = host.replace(`.${rootDomain}`, "")
      if (subdomain !== "www" && subdomain !== "app") {
        setTenantId(subdomain)
      }
    }

    // Para desarrollo local
    if (host.includes("localhost")) {
      const subdomainMatch = host.match(/^([^.]+)\.localhost/)
      if (subdomainMatch) {
        const subdomain = subdomainMatch[1]
        if (subdomain !== "www" && subdomain !== "app") {
          setTenantId(subdomain)
        }
      }
    }
  }, [])

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
        }
      } catch (err) {
        console.error("Error fetching tenant data:", err)
      } finally {
        setLoading(false)
      }
    }

    if (tenantId) {
      fetchTenantData()
    } else {
      setLoading(false)
    }
  }, [tenantId])

  // Si estamos en el dominio principal y no en un subdominio, mostrar el dashboard normal
  if (!tenantId && !loading) {
    return (
      <DashboardLayout>
        <div className="container py-12">
          <h1 className="text-3xl font-bold mb-8">Dashboard Principal</h1>
          <p>Este es el dashboard del dominio principal.</p>
        </div>
      </DashboardLayout>
    )
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container py-12">
          <p>Cargando datos del tenant...</p>
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
