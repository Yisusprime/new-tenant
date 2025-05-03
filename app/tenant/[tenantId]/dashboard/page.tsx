"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

export default function TenantDashboard({ params }: { params: { tenantId: string } }) {
  const { user, userProfile, loading, signOut } = useAuth()
  const router = useRouter()
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(`/tenant/${params.tenantId}/login`)
      } else {
        setLoadingData(false)
      }
    }
  }, [loading, user, router, params.tenantId])

  if (loading || loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Cargando...</p>
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
            <h1 className="text-xl font-bold">{params.tenantId} - Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span>{userProfile.name || userProfile.email}</span>
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
                <strong>Nombre:</strong> {userProfile.name || "No disponible"}
              </p>
              <p>
                <strong>Email:</strong> {userProfile.email}
              </p>
              <p>
                <strong>Rol:</strong> {userProfile.role || "No definido"}
              </p>
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
              {userProfile.role === "admin" && (
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
