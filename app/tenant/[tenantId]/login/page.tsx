"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/client"

export default function TenantLoginPage({ params }: { params: { tenantId: string } }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tenantName, setTenantName] = useState("")
  const { signIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Obtener información del tenant
    async function fetchTenantData() {
      try {
        console.log(`Fetching tenant data for: ${params.tenantId}`)
        const tenantDoc = await getDoc(doc(db, "tenants", params.tenantId))
        if (tenantDoc.exists()) {
          console.log(`Tenant found: ${tenantDoc.data().name}`)
          setTenantName(tenantDoc.data().name || params.tenantId)
        } else {
          console.error(`Tenant not found: ${params.tenantId}`)
          setError("Este tenant no existe")
        }
      } catch (error) {
        console.error("Error al obtener datos del tenant:", error)
        setError("Error al cargar información del tenant")
      }
    }

    fetchTenantData()
  }, [params.tenantId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log(`Attempting login for: ${email} on tenant: ${params.tenantId}`)
      await signIn(email, password)
      console.log("Login successful, redirecting to dashboard")

      // Redirigir al dashboard del tenant
      router.push(`/tenant/${params.tenantId}/dashboard`)
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="mb-6 text-4xl font-bold">Login - Tenant: {params.tenantId}</h1>

      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-md">
        <h2 className="mb-4 text-2xl font-semibold">Formulario de login</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <div className="text-center">
          <Link href={`/tenant/${params.tenantId}`} className="text-sm text-gray-600 hover:text-gray-900">
            Volver al inicio
          </Link>
        </div>
        <div className="text-center">
          <Link
            href={`/tenant/${params.tenantId}/forgot-password`}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <p className="mt-2 text-center text-sm text-gray-600">
          ¿No tienes una cuenta?{" "}
          <Link href={`/tenant/${params.tenantId}/register`} className="font-medium text-blue-600 hover:text-blue-500">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}
