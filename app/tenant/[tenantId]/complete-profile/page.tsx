"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase/client"

export default function CompleteProfile({ params }: { params: { tenantId: string } }) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/tenant/${params.tenantId}/login`)
    }
  }, [loading, user, router, params.tenantId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setError(null)

    try {
      // Crear o actualizar el perfil del usuario
      await setDoc(
        doc(db, "users", user.uid),
        {
          name,
          email: user.email,
          tenantId: params.tenantId,
          role: "client", // Asignar rol de cliente por defecto
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(), // Solo se usará si es un documento nuevo
        },
        { merge: true },
      )

      setSuccess(true)

      // Esperar un momento antes de redirigir
      setTimeout(() => {
        router.push(`/tenant/${params.tenantId}/dashboard`)
      }, 2000)
    } catch (error: any) {
      console.error("Error al guardar perfil:", error)
      setError(error.message || "Error al guardar el perfil")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Cargando...</p>
      </div>
    )
  }

  if (!user) {
    return null // Se redirigirá en el useEffect
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">{params.tenantId} - Completar Perfil</h1>
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
        <div className="container mx-auto max-w-md">
          <div className="rounded-lg border bg-white p-6 shadow-md">
            <h2 className="mb-6 text-2xl font-bold">Completa tu perfil</h2>

            {success ? (
              <div className="rounded-md bg-green-50 p-4 text-green-800">
                <p>¡Perfil guardado correctamente! Redirigiendo al dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={user.email || ""}
                    disabled
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-500 shadow-sm"
                  />
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  />
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {saving ? "Guardando..." : "Guardar perfil"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
