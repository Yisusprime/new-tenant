"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import Link from "next/link"

export default function TenantDashboardPage({ params }: { params: { tenantId: string } }) {
  const { user, userProfile, loading, signOut } = useAuth()
  const router = useRouter()
  const [tenantData, setTenantData] = useState<any>(null)
  const [loadingTenant, setLoadingTenant] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/tenant/${params.tenantId}/login`)
    } else if (!loading && user) {
      // Verificar que el usuario pertenece a este tenant
      if (userProfile && userProfile.tenantId !== params.tenantId) {
        router.push(`/tenant/${params.tenantId}/login`)
      } else {
        // Cargar datos del tenant
        loadTenantData()
      }
    }
  }, [loading, user, userProfile, router, params.tenantId])

  const loadTenantData = async () => {
    try {
      setLoadingTenant(true)
      const tenantDoc = await getDoc(doc(db, "tenants", params.tenantId))

      if (tenantDoc.exists()) {
        setTenantData({
          id: tenantDoc.id,
          ...tenantDoc.data(),
        })
      } else {
        router.push("/not-found")
      }
    } catch (error) {
      console.error("Error al cargar datos del tenant:", error)
    } finally {
      setLoadingTenant(false)
    }
  }

  if (loading || loadingTenant) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Cargando...</p>
      </div>
    )
  }

  if (!user || !userProfile || !tenantData) {
    return null // Se redirigirá en el useEffect
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">{tenantData.name} - Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span>{userProfile.name}</span>
            <button onClick={() => signOut()} className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300">
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-64 border-r bg-gray-50">
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/tenant/${params.tenantId}/dashboard`}
                  className="block rounded bg-blue-100 p-2 font-medium text-blue-800"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href={`/tenant/${params.tenantId}/orders`} className="block rounded p-2 hover:bg-gray-200">
                  Mis Pedidos
                </Link>
              </li>
              <li>
                <Link href={`/tenant/${params.tenantId}/menu`} className="block rounded p-2 hover:bg-gray-200">
                  Menú
                </Link>
              </li>
              <li>
                <Link href={`/tenant/${params.tenantId}/profile`} className="block rounded p-2 hover:bg-gray-200">
                  Mi Perfil
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <div className="container mx-auto">
            <h2 className="mb-6 text-2xl font-bold">Bienvenido, {userProfile.name}</h2>

            <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h3 className="mb-2 text-lg font-semibold text-gray-700">Pedidos Recientes</h3>
                <p className="text-3xl font-bold">0</p>
                <Link
                  href={`/tenant/${params.tenantId}/orders`}
                  className="mt-4 inline-block text-sm text-blue-600 hover:underline"
                >
                  Ver todos los pedidos →
                </Link>
              </div>
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h3 className="mb-2 text-lg font-semibold text-gray-700">Puntos de Fidelidad</h3>
                <p className="text-3xl font-bold">0</p>
                <Link
                  href={`/tenant/${params.tenantId}/rewards`}
                  className="mt-4 inline-block text-sm text-blue-600 hover:underline"
                >
                  Ver programa de fidelidad →
                </Link>
              </div>
            </div>

            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-xl font-semibold">Acciones Rápidas</h3>
              <div className="flex flex-wrap gap-4">
                <Link
                  href={`/tenant/${params.tenantId}/menu`}
                  className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Ver Menú
                </Link>
                <Link
                  href={`/tenant/${params.tenantId}/orders/new`}
                  className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                >
                  Nuevo Pedido
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
