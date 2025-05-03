"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useTenantData } from "@/components/tenant-data-provider"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase/client"

export default function TenantRegisterPage({ params }: { params: { tenant: string } }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { signUp } = useAuth()
  const { tenantData, loading: tenantLoading, error: tenantError } = useTenantData()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    // Validar contraseñas
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    try {
      // Verificar que el tenant exista
      if (!tenantData) {
        throw new Error(`El tenant "${params.tenant}" no existe o no está disponible.`)
      }

      // Registrar usuario con rol de cliente para este tenant
      const userCredential = await signUp(email, password)
      const uid = userCredential.uid

      // Crear perfil de usuario en Firestore
      await setDoc(doc(db, "users", uid), {
        name,
        email,
        role: "client",
        tenantId: tenantData.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      // Mostrar mensaje de éxito
      setSuccess("Registro exitoso. Ahora puedes iniciar sesión.")

      // Limpiar formulario
      setName("")
      setEmail("")
      setPassword("")
      setConfirmPassword("")

      // Redirigir después de 2 segundos
      setTimeout(() => {
        window.location.href = `/${params.tenant}/login`
      }, 2000)
    } catch (error: any) {
      console.error("Error en registro:", error)
      setError(error.message || "Error al registrarse")
    } finally {
      setLoading(false)
    }
  }

  if (tenantLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-2">Cargando información del restaurante...</p>
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
      <header className="border-b w-full bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href={`/${params.tenant}`} className="font-bold text-xl">
              {tenantData.name}
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link href={`/${params.tenant}`} className="text-sm font-medium hover:text-primary hover:underline">
              Inicio
            </Link>
            <Link href={`/${params.tenant}/menu`} className="text-sm font-medium hover:text-primary hover:underline">
              Menú
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href={`/${params.tenant}/login`}>
              <button className="text-sm font-medium hover:text-primary">Iniciar sesión</button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 py-10">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-md">
            <h1 className="mb-6 text-2xl font-bold">Registro en {tenantData.name}</h1>

            {error && <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}

            {success && <div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-700">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nombre completo
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar contraseña
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? "Registrando..." : "Registrarse"}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <Link href={`/${params.tenant}/login`} className="font-medium text-blue-600 hover:text-blue-500">
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2023 {tenantData.name}. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
