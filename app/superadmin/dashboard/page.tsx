"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import Link from "next/link"

export default function SuperAdminDashboard() {
  const { user, userProfile, loading, signOut } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTenants: 0,
  })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/superadmin/login")
    } else if (!loading && user && userProfile) {
      if (userProfile.role !== "superadmin") {
        router.push("/login")
      } else {
        // Cargar estadísticas
        loadStats()
      }
    }
  }, [loading, user, userProfile, router])

  const loadStats = async () => {
    try {
      setLoadingStats(true)

      // Contar usuarios
      const usersSnapshot = await getDocs(collection(db, "users"))
      const totalUsers = usersSnapshot.size

      // Contar tenants
      const tenantsSnapshot = await getDocs(collection(db, "tenants"))
      const totalTenants = tenantsSnapshot.size

      setStats({
        totalUsers,
        totalTenants,
      })
    } catch (error) {
      console.error("Error al cargar estadísticas:", error)
    } finally {
      setLoadingStats(false)
    }
  }

  if (loading || loadingStats) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Cargando...</p>
      </div>
    )
  }

  if (!user || !userProfile || userProfile.role !== "superadmin") {
    return null // Se redirigirá en el useEffect
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-gray-900 text-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">SuperAdmin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span>{userProfile.email}</span>
            <button onClick={() => signOut()} className="rounded bg-gray-700 px-3 py-1 text-sm hover:bg-gray-600">
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
                <Link href="/superadmin/dashboard" className="block rounded bg-blue-100 p-2 font-medium text-blue-800">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/superadmin/users" className="block rounded p-2 hover:bg-gray-200">
                  Usuarios
                </Link>
              </li>
              <li>
                <Link href="/superadmin/tenants" className="block rounded p-2 hover:bg-gray-200">
                  Tenants
                </Link>
              </li>
              <li>
                <Link href="/settings" className="block rounded p-2 hover:bg-gray-200">
                  Mi Perfil
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <div className="container mx-auto">
            <h2 className="mb-6 text-2xl font-bold">Panel de Control SuperAdmin</h2>

            <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h3 className="mb-2 text-lg font-semibold text-gray-700">Total de Usuarios</h3>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
              </div>
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h3 className="mb-2 text-lg font-semibold text-gray-700">Total de Tenants</h3>
                <p className="text-3xl font-bold">{stats.totalTenants}</p>
              </div>
            </div>

            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-xl font-semibold">Acciones Rápidas</h3>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/superadmin/users/create"
                  className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Crear Usuario
                </Link>
                <Link
                  href="/superadmin/tenants/create"
                  className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                >
                  Crear Tenant
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
