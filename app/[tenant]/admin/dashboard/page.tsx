"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useTenantData } from "@/components/tenant-data-provider"
import { signOutUser } from "@/app/actions"
import Link from "next/link"

export default function TenantAdminDashboard({ params }: { params: { tenant: string } }) {
  const { user, userProfile, loading } = useAuth()
  const { tenantData, loading: tenantLoading, error: tenantError } = useTenantData()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Si no hay usuario o está cargando, esperar
        if (loading) return

        // Si no hay usuario autenticado, redirigir al login
        if (!user) {
          window.location.href = `/${params.tenant}/login`
          return
        }

        // Si no hay perfil o está cargando el tenant, esperar
        if (!userProfile || tenantLoading) return

        // Verificar que el usuario sea admin de este tenant
        if (userProfile.role !== "admin" || userProfile.tenantId !== params.tenant) {
          window.location.href = `/${params.tenant}/login`
          return
        }

        setIsCheckingAuth(false)
      } catch (error) {
        console.error("Error al verificar autenticación:", error)
        window.location.href = `/${params.tenant}/login`
      }
    }

    checkAuth()
  }, [user, userProfile, loading, tenantLoading, params.tenant])

  const handleSignOut = async () => {
    try {
      await signOutUser({ domain: "tenant" })
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  if (isCheckingAuth || tenantLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-2">Cargando dashboard...</p>
          <div className="h-1 w-32 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full w-1/2 animate-[pulse_1s_ease-in-out_infinite] rounded-full bg-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (tenantError || !tenantData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="mb-6 text-4xl font-bold">Tenant no encontrado</h1>
        <p className="mb-4">El tenant {params.tenant} no existe o no está disponible.</p>
        <Link href="/" className="text-blue-600 hover:underline">
          Volver al inicio
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">{tenantData.name} - Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span>{userProfile?.email}</span>
            <button onClick={handleSignOut} className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300">
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
                  href={`/${params.tenant}/admin/dashboard`}
                  className="block rounded bg-blue-100 p-2 font-medium text-blue-800"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href={`/${params.tenant}/admin/menu`} className="block rounded p-2 hover:bg-gray-200">
                  Gestionar Menú
                </Link>
              </li>
              <li>
                <Link href={`/${params.tenant}/admin/orders`} className="block rounded p-2 hover:bg-gray-200">
                  Pedidos
                </Link>
              </li>
              <li>
                <Link href={`/${params.tenant}/admin/settings`} className="block rounded p-2 hover:bg-gray-200">
                  Configuración
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <div className="container mx-auto">
            <h2 className="mb-6 text-2xl font-bold">Panel de Control</h2>

            <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h3 className="mb-2 text-lg font-semibold text-gray-700">Pedidos Hoy</h3>
                <p className="text-3xl font-bold">0</p>
              </div>
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h3 className="mb-2 text-lg font-semibold text-gray-700">Productos</h3>
                <p className="text-3xl font-bold">0</p>
              </div>
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h3 className="mb-2 text-lg font-semibold text-gray-700">Clientes</h3>
                <p className="text-3xl font-bold">0</p>
              </div>
            </div>

            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-xl font-semibold">Acciones Rápidas</h3>
              <div className="flex flex-wrap gap-4">
                <Link
                  href={`/${params.tenant}/admin/menu/create`}
                  className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Añadir Producto
                </Link>
                <Link
                  href={`/${params.tenant}/admin/settings`}
                  className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                >
                  Configurar Restaurante
                </Link>
                <Link
                  href={`/${params.tenant}`}
                  className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100"
                  target="_blank"
                >
                  Ver Sitio Público
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
