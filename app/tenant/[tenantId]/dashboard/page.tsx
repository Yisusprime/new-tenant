"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

export default function TenantDashboard({ params }: { params: { tenantId: string } }) {
  const { user, userProfile, loading, signOut } = useAuth()
  const router = useRouter()
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(`/tenant/${params.tenantId}/login`)
      } else {
        console.log("Dashboard - Usuario autenticado:", user.email)
        console.log("Dashboard - Perfil de usuario:", userProfile)
        setLoadingData(false)
      }
    }
  }, [loading, user, router, params.tenantId, userProfile])

  if (loading || loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Cargando...</p>
      </div>
    )
  }

  if (!user) {
    return null // Se redirigirá en el useEffect
  }

  // Si el usuario está autenticado pero no tiene perfil, mostrar un mensaje
  if (!userProfile) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="border-b bg-white">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">{params.tenantId} - Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span>{user.email}</span>
              <button onClick={() => signOut()} className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300">
                Cerrar sesión
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="container mx-auto">
            <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-6">
              <h2 className="mb-4 text-xl font-semibold text-yellow-800">Perfil de usuario no encontrado</h2>
              <p className="mb-4 text-yellow-700">
                Tu usuario está autenticado correctamente, pero no se encontró un perfil asociado. Esto puede ocurrir
                si:
              </p>
              <ul className="mb-4 list-disc pl-5 text-yellow-700">
                <li>Tu cuenta fue creada pero el perfil no se guardó correctamente</li>
                <li>Tu perfil fue eliminado</li>
                <li>Hay un problema de permisos para acceder a tu perfil</li>
              </ul>
              <div className="mt-4 flex space-x-4">
                <button
                  onClick={() => {
                    // Intentar crear un perfil básico
                    router.push(`/tenant/${params.tenantId}/complete-profile`)
                  }}
                  className="rounded bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700"
                >
                  Completar perfil
                </button>
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

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">{params.tenantId} - Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span>{userProfile.name || userProfile.email || user.email}</span>
            <button onClick={() => signOut()} className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300">
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="container mx-auto">
          <h2 className="mb-6 text-2xl font-bold">Bienvenido al Dashboard</h2>

          <div className="mb-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h3 className="mb-2 text-lg font-semibold text-gray-700">Información del Usuario</h3>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>UID:</strong> {user.uid}
              </p>
              {userProfile && (
                <>
                  <p>
                    <strong>Nombre:</strong> {userProfile.name || "No disponible"}
                  </p>
                  <p>
                    <strong>Rol:</strong> {userProfile.role || "No definido"}
                  </p>
                </>
              )}
            </div>
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h3 className="mb-2 text-lg font-semibold text-gray-700">Información del Tenant</h3>
              <p>
                <strong>ID del Tenant:</strong> {params.tenantId}
              </p>
              <p>
                <strong>URL actual:</strong> {typeof window !== "undefined" ? window.location.href : ""}
              </p>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xl font-semibold">Enlaces</h3>
            <div className="flex flex-wrap gap-4">
              <Link
                href={`/tenant/${params.tenantId}`}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Inicio del Tenant
              </Link>
              {userProfile?.role === "admin" && (
                <Link
                  href={`/tenant/${params.tenantId}/admin/dashboard`}
                  className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                >
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
