"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/client"

export default function ClientDashboard({ params }: { params: { tenantId: string } }) {
  const { user, userProfile, loading, signOut, refreshUserProfile } = useAuth()
  const router = useRouter()
  const [tenantData, setTenantData] = useState<any>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(`/tenant/${params.tenantId}/login`)
      } else {
        console.log("Cliente Dashboard - Usuario autenticado:", user.email)
        console.log("Cliente Dashboard - Perfil de usuario:", userProfile)

        // Verificar que el usuario tenga un perfil y sea cliente de este tenant
        if (userProfile) {
          if (userProfile.tenantId !== params.tenantId) {
            setError("No tienes acceso a este tenant")
            return
          }

          // Cargar datos del tenant
          loadTenantData()
        } else {
          // Si no hay perfil, intentar crearlo
          createClientProfile()
        }
      }
    }
  }, [loading, user, userProfile, router, params.tenantId])

  const createClientProfile = async () => {
    if (!user) return

    try {
      setError(null)
      console.log("Creando perfil de cliente para:", user.email)

      // Redirigir a la página de completar perfil
      router.push(`/tenant/${params.tenantId}/complete-profile`)
    } catch (error: any) {
      console.error("Error:", error)
      setError(error.message || "Error al crear perfil")
      setLoadingData(false)
    }
  }

  const loadTenantData = async () => {
    try {
      const tenantDoc = await getDoc(doc(db, "tenants", params.tenantId))

      if (tenantDoc.exists()) {
        setTenantData({
          id: tenantDoc.id,
          ...tenantDoc.data(),
        })
      } else {
        setError("Tenant no encontrado")
      }
    } catch (error: any) {
      console.error("Error al cargar datos del tenant:", error)
      setError(error.message || "Error al cargar datos")
    } finally {
      setLoadingData(false)
    }
  }

  if (loading || loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-2">Cargando...</p>
          <div className="h-1 w-32 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full w-1/2 animate-[pulse_1s_ease-in-out_infinite] rounded-full bg-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !userProfile) {
    return null // Se redirigirá en el useEffect
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">{tenantData?.name || params.tenantId} - Panel de Cliente</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span>{userProfile.name || user.email}</span>
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
                  href={`/tenant/${params.tenantId}/client/dashboard`}
                  className="block rounded bg-blue-100 p-2 font-medium text-blue-800"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href={`/tenant/${params.tenantId}/client/orders`} className="block rounded p-2 hover:bg-gray-200">
                  Mis Pedidos
                </Link>
              </li>
              <li>
                <Link href={`/tenant/${params.tenantId}/menu`} className="block rounded p-2 hover:bg-gray-200">
                  Ver Menú
                </Link>
              </li>
              <li>
                <Link
                  href={`/tenant/${params.tenantId}/client/profile`}
                  className="block rounded p-2 hover:bg-gray-200"
                >
                  Mi Perfil
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <div className="container mx-auto">
            {error ? (
              <div className="rounded-lg border border-red-300 bg-red-50 p-6">
                <h2 className="mb-4 text-xl font-semibold text-red-800">Error</h2>
                <p className="text-red-700">{error}</p>
              </div>
            ) : (
              <>
                <h2 className="mb-6 text-2xl font-bold">Bienvenido, {userProfile.name || "Cliente"}</h2>

                <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <h3 className="mb-2 text-lg font-semibold text-gray-700">Mis Pedidos</h3>
                    <p className="text-3xl font-bold">0</p>
                    <Link
                      href={`/tenant/${params.tenantId}/client/orders`}
                      className="mt-4 inline-block text-sm text-blue-600 hover:underline"
                    >
                      Ver todos mis pedidos →
                    </Link>
                  </div>
                  <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <h3 className="mb-2 text-lg font-semibold text-gray-700">Puntos de Fidelidad</h3>
                    <p className="text-3xl font-bold">0</p>
                    <Link
                      href={`/tenant/${params.tenantId}/client/rewards`}
                      className="mt-4 inline-block text-sm text-blue-600 hover:underline"
                    >
                      Ver programa de fidelidad →
                    </Link>
                  </div>
                  <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <h3 className="mb-2 text-lg font-semibold text-gray-700">Estado de Cuenta</h3>
                    <p className="text-3xl font-bold">Activo</p>
                    <p className="text-sm text-gray-500">Cliente desde: {new Date().toLocaleDateString()}</p>
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
                      href={`/tenant/${params.tenantId}/client/orders/new`}
                      className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                    >
                      Nuevo Pedido
                    </Link>
                    <Link
                      href={`/tenant/${params.tenantId}/client/profile`}
                      className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                    >
                      Editar Perfil
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
