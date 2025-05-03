"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import Link from "next/link"

export default function ClientDashboard({ params }: { params: { tenant: string } }) {
  const { user, userProfile, loading, signOut } = useAuth()
  const router = useRouter()
  const [tenantData, setTenantData] = useState<any>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login`)
    } else if (!loading && user && userProfile) {
      // Verificar que el usuario es cliente o admin
      if (userProfile?.role !== "client" && userProfile?.role !== "admin") {
        setError("No tienes permisos para acceder a esta página")
        setLoadingData(false)
      } else {
        // Cargar datos del tenant
        loadTenantData()
      }
    }
  }, [loading, user, userProfile, router, params.tenant])

  const loadTenantData = async () => {
    try {
      setLoadingData(true)

      // Cargar datos del tenant
      const tenantDoc = await getDoc(doc(db, "tenants", params.tenant))
      if (!tenantDoc.exists()) {
        setError("Tenant no encontrado")
        setLoadingData(false)
        return
      }

      setTenantData({
        id: tenantDoc.id,
        ...tenantDoc.data(),
      })
    } catch (error: any) {
      console.error("Error al cargar datos:", error)
      setError(error.message || "Error al cargar datos")
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

  // Si hay error de acceso pero el usuario está autenticado, mostrar mensaje de error
  if (error && user) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="border-b bg-white">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">{params.tenant} - Error de Acceso</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span>{userProfile?.email || user.email}</span>
              <button onClick={() => signOut()} className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300">
                Cerrar sesión
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="container mx-auto">
            <div className="rounded-lg border border-red-300 bg-red-50 p-6">
              <h2 className="mb-4 text-xl font-semibold text-red-800">Error de Acceso</h2>
              <p className="mb-4 text-red-700">{error}</p>
              <div className="mt-4 flex space-x-4">
                <button
                  onClick={() => signOut()}
                  className="rounded border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </main>
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
            <h1 className="text-xl font-bold">{tenantData.name} - Panel de Cliente</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span>{userProfile.name || userProfile.email}</span>
            <div className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">{userProfile.role}</div>
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
                <Link href="/client/dashboard" className="block rounded bg-blue-100 p-2 font-medium text-blue-800">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/client/orders" className="block rounded p-2 hover:bg-gray-200">
                  Mis Pedidos
                </Link>
              </li>
              <li>
                <Link href="/menu" className="block rounded p-2 hover:bg-gray-200">
                  Ver Menú
                </Link>
              </li>
              <li>
                <Link href="/client/profile" className="block rounded p-2 hover:bg-gray-200">
                  Mi Perfil
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <div className="container mx-auto">
            <h2 className="mb-6 text-2xl font-bold">Bienvenido, {userProfile.name || userProfile.email}</h2>

            <div className="mb-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h3 className="mb-2 text-lg font-semibold text-gray-700">Pedidos Recientes</h3>
                <p className="text-gray-600">No tienes pedidos recientes.</p>
                <Link href="/menu" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
                  Realizar un pedido →
                </Link>
              </div>
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h3 className="mb-2 text-lg font-semibold text-gray-700">Mi Perfil</h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Nombre:</span> {userProfile.name || "No especificado"}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {userProfile.email}
                  </p>
                </div>
                <Link href="/client/profile" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
                  Editar perfil →
                </Link>
              </div>
            </div>

            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-xl font-semibold">Acciones Rápidas</h3>
              <div className="flex flex-wrap gap-4">
                <Link href="/menu" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                  Ver Menú
                </Link>
                <Link href="/client/orders" className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                  Mis Pedidos
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
