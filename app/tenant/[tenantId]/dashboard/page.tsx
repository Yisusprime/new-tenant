"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase/client"

export default function TenantDashboard({ params }: { params: { tenantId: string } }) {
  const { user, userProfile, loading, signOut, refreshUserProfile } = useAuth()
  const router = useRouter()
  const [loadingData, setLoadingData] = useState(true)
  const [creatingProfile, setCreatingProfile] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(`/tenant/${params.tenantId}/login`)
      } else {
        console.log("Dashboard - Usuario autenticado:", user.email)
        console.log("Dashboard - Perfil de usuario:", userProfile)

        // Si hay perfil, verificar el rol y redirigir
        if (userProfile) {
          const role = userProfile.role || "client"

          // Redirigir según el rol
          if (role === "admin") {
            console.log("Redirigiendo a dashboard de admin")
            router.push(`/tenant/${params.tenantId}/admin/dashboard`)
            return
          } else if (role === "client") {
            console.log("Redirigiendo a dashboard de cliente")
            router.push(`/tenant/${params.tenantId}/client/dashboard`)
            return
          }
        }

        // Si no hay perfil, intentar crearlo automáticamente
        if (user && !userProfile && !creatingProfile) {
          createBasicProfile()
        } else {
          setLoadingData(false)
        }
      }
    }
  }, [loading, user, userProfile, router, params.tenantId, creatingProfile])

  const createBasicProfile = async () => {
    if (!user || creatingProfile) return

    try {
      setCreatingProfile(true)
      console.log("Creando perfil básico para el usuario:", user.uid)

      await setDoc(
        doc(db, "users", user.uid),
        {
          email: user.email,
          tenantId: params.tenantId,
          role: "client", // Por defecto, asignar rol de cliente
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )

      console.log("Perfil básico creado, refrescando datos...")
      await refreshUserProfile()
    } catch (error: any) {
      console.error("Error al crear perfil básico:", error)
      setError(error.message || "Error al crear perfil básico")
    } finally {
      setCreatingProfile(false)
      setLoadingData(false)
    }
  }

  if (loading || loadingData || creatingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-2">{creatingProfile ? "Creando perfil..." : "Cargando..."}</p>
          <div className="h-1 w-32 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full w-1/2 animate-[pulse_1s_ease-in-out_infinite] rounded-full bg-blue-600"></div>
          </div>
        </div>
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
                  onClick={createBasicProfile}
                  className="rounded bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700"
                >
                  Crear perfil básico
                </button>
                <Link
                  href={`/tenant/${params.tenantId}/complete-profile`}
                  className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Completar perfil
                </Link>
                <button
                  onClick={() => signOut()}
                  className="rounded border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cerrar sesión
                </button>
              </div>
              {error && (
                <div className="mt-4 rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Si llegamos aquí, mostrar un mensaje de redirección
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="mb-4 text-xl">Redirigiendo al dashboard correspondiente...</p>
        <div className="h-1 w-32 mx-auto overflow-hidden rounded-full bg-gray-200">
          <div className="h-full w-1/2 animate-[pulse_1s_ease-in-out_infinite] rounded-full bg-blue-600"></div>
        </div>
        <div className="mt-6 space-y-2">
          <p>Si no eres redirigido automáticamente, selecciona tu dashboard:</p>
          <div className="flex justify-center space-x-4">
            {userProfile.role === "admin" && (
              <Link
                href={`/tenant/${params.tenantId}/admin/dashboard`}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Dashboard de Admin
              </Link>
            )}
            <Link
              href={`/tenant/${params.tenantId}/client/dashboard`}
              className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Dashboard de Cliente
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
