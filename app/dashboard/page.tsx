"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { Skeleton } from "@/components/ui/skeleton"

export default function Dashboard() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [hostname, setHostname] = useState<string>("")
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [tenantData, setTenantData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  // Verificar autenticación
  useEffect(() => {
    if (!authLoading && !user) {
      console.log("Usuario no autenticado, redirigiendo a login")
      router.push("/login")
    }
  }, [user, authLoading, router])

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
      if (!tenantId || !user) return

      try {
        console.log("Fetching tenant data for:", tenantId)
        const tenantDoc = await getDoc(doc(db, "tenants", tenantId))

        if (tenantDoc.exists()) {
          const data = tenantDoc.data()
          console.log("Tenant data found:", data)
          setTenantData(data)

          // Verificar si el usuario tiene acceso a este tenant
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()

            // El usuario tiene acceso si es el propietario o si tiene el mismo subdominio
            if (data.ownerId === user.uid || userData.subdomain === tenantId) {
              setAuthorized(true)
            } else {
              console.log("Usuario no autorizado para este tenant")
              router.push("/unauthorized")
            }
          }
        } else {
          console.log("No tenant found with ID:", tenantId)
          router.push("/not-found")
        }
      } catch (err) {
        console.error("Error fetching tenant data:", err)
      } finally {
        setLoading(false)
      }
    }

    if (tenantId && user) {
      fetchTenantData()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [tenantId, user, authLoading, router])

  // Si está cargando, mostrar un esqueleto
  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="container py-12">
          <Skeleton className="h-12 w-3/4 mb-8" />
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <Skeleton className="h-8 w-1/2 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <Skeleton className="h-8 w-1/2 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Si no está autenticado, no mostrar nada (la redirección ya se maneja en el useEffect)
  if (!user) {
    return null
  }

  // Si no está autorizado, no mostrar nada (la redirección ya se maneja en el useEffect)
  if (!authorized && tenantId) {
    return null
  }

  // Si estamos en el dominio principal y no en un subdominio
  if (!tenantId) {
    return (
      <DashboardLayout>
        <div className="container py-12">
          <h1 className="text-3xl font-bold mb-8">Dashboard Principal</h1>
          <p>Este es el dashboard del dominio principal.</p>
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
