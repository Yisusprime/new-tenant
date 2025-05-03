"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { doc, getDoc, collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import Link from "next/link"

export default function AdminDashboard({ params }: { params: { tenantId: string } }) {
  const { user, userProfile, loading, signOut, checkTenantAccess } = useAuth()
  const router = useRouter()
  const [tenantData, setTenantData] = useState<any>(null)
  const [stats, setStats] = useState({
    totalClients: 0,
    totalOrders: 0,
    totalProducts: 0,
  })
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    async function checkAccess() {
      if (!loading) {
        if (!user) {
          router.push(`/tenant/${params.tenantId}/login`)
        } else {
          // Verificar que el usuario tiene acceso a este tenant como admin
          const hasAccess = await checkTenantAccess(params.tenantId)
          if (!hasAccess || userProfile?.role !== "admin") {
            router.push(`/tenant/${params.tenantId}/login`)
          } else {
            loadData()
          }
        }
      }
    }

    checkAccess()
  }, [loading, user, userProfile, router, params.tenantId, checkTenantAccess])

  const loadData = async () => {
    try {
      setLoadingData(true)

      // Cargar datos del tenant
      const tenantDoc = await getDoc(doc(db, "tenants", params.tenantId))
      if (!tenantDoc.exists()) {
        router.push("/not-found")
        return
      }

      setTenantData({
        id: tenantDoc.id,
        ...tenantDoc.data(),
      })

      // Cargar estadísticas (ejemplo)
      // En una aplicación real, estas consultas serían más complejas
      const clientsQuery = await getDocs(
        collection(db, "users"),
        // where("tenantId", "==", params.tenantId),
        // where("role", "==", "client")
      )

      const totalClients = clientsQuery.size

      setStats({
        totalClients,
        totalOrders: 0, // Ejemplo
        totalProducts: 0, // Ejemplo
      })
    } catch (error) {
      console.error("Error al cargar datos:", error)
    } finally {
      setLoadingData(false)
    }
  }

  if (loading || loadingData) {
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
            <h1 className="text-xl font-bold">{tenantData.name} - Panel de Administración</h1>
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
                  href={`/tenant/${params.tenantId}/admin/dashboard`}
                  className="block rounded bg-blue-100 p-2 font-medium text-blue-800"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href={`/tenant/${params.tenantId}/admin/orders`} className="block rounded p-2 hover:bg-gray-200">
                  Pedidos
                </Link>
              </li>
              <li>
                <Link href={`/tenant/${params.tenantId}/admin/menu`} className="block rounded p-2 hover:bg-gray-200">
                  Gestionar Menú
                </Link>
              </li>
              <li>
                <Link href={`/tenant/${params.tenantId}/admin/clients`} className="block rounded p-2 hover:bg-gray-200">
                  Clientes
                </Link>
              </li>
              <li>
                <Link
                  href={`/tenant/${params.tenantId}/admin/settings`}
                  className="block rounded p-2 hover:bg-gray-200"
                >
                  Configuración
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <div className="container mx-auto">
            <h2 className="mb-6 text-2xl font-bold">Panel de Control</h2>

            <div className="mb-8 grid gap-6 md:grid-cols-3">
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h3 className="mb-2 text-lg font-semibold text-gray-700">Clientes</h3>
                <p className="text-3xl font-bold">{stats.totalClients}</p>
                <Link
                  href={`/tenant/${params.tenantId}/admin/clients`}
                  className="mt-4 inline-block text-sm text-blue-600 hover:underline"
                >
                  Ver todos los clientes →
                </Link>
              </div>
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h3 className="mb-2 text-lg font-semibold text-gray-700">Pedidos</h3>
                <p className="text-3xl font-bold">{stats.totalOrders}</p>
                <Link
                  href={`/tenant/${params.tenantId}/admin/orders`}
                  className="mt-4 inline-block text-sm text-blue-600 hover:underline"
                >
                  Ver todos los pedidos →
                </Link>
              </div>
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h3 className="mb-2 text-lg font-semibold text-gray-700">Productos</h3>
                <p className="text-3xl font-bold">{stats.totalProducts}</p>
                <Link
                  href={`/tenant/${params.tenantId}/admin/menu`}
                  className="mt-4 inline-block text-sm text-blue-600 hover:underline"
                >
                  Gestionar menú →
                </Link>
              </div>
            </div>

            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-xl font-semibold">Acciones Rápidas</h3>
              <div className="flex flex-wrap gap-4">
                <Link
                  href={`/tenant/${params.tenantId}/admin/orders/new`}
                  className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Nuevo Pedido
                </Link>
                <Link
                  href={`/tenant/${params.tenantId}/admin/menu/new`}
                  className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                >
                  Añadir Producto
                </Link>
                <Link
                  href={`/tenant/${params.tenantId}/admin/settings`}
                  className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                >
                  Configuración
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
