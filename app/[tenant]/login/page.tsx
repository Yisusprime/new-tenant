"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase/client"

export default function TenantLoginPage({ params }: { params: { tenant: string } }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const { signIn, user, userProfile } = useAuth()
  const router = useRouter()

  // Verificar el estado de autenticación al cargar la página
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Verificando autenticación:", user?.email)

        // Si no hay usuario, permitir el login
        if (!user) {
          setIsCheckingAuth(false)
          return
        }

        // Si hay usuario pero no hay perfil, esperar a que se cargue
        if (!userProfile) {
          console.log("Usuario autenticado pero sin perfil cargado aún")
          return
        }

        console.log("Usuario autenticado con perfil:", userProfile)

        // Redirigir según el rol
        if (userProfile.role === "admin") {
          console.log("Redirigiendo a admin dashboard")
          router.push(`/${params.tenant}/admin/dashboard`)
        } else {
          setIsCheckingAuth(false)
        }
      } catch (error) {
        console.error("Error al verificar autenticación:", error)
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [user, userProfile, router, params.tenant])

  // Actualizar la función handleSubmit para redirigir correctamente según el rol

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log(`Attempting login for: ${email} on tenant: ${params.tenant}`)
      const userCredential = await signIn(email, password)
      console.log("Login successful, checking profile")

      // Verificar si el perfil existe
      if (userCredential && userCredential.user) {
        const uid = userCredential.user.uid
        const userDocRef = doc(db, "users", uid)
        const userDoc = await getDoc(userDocRef)

        // Si el perfil no existe, crearlo como cliente
        if (!userDoc.exists()) {
          console.log("Profile not found, creating a basic profile")
          await setDoc(userDocRef, {
            email: userCredential.user.email,
            tenantId: params.tenant,
            role: "client", // Por defecto, los usuarios que se registran en un tenant son clientes
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
          console.log("Basic profile created as client")

          // Redirigir al dashboard de cliente
          router.push(`/${params.tenant}/client/dashboard`)
          return
        }

        // Obtener el rol del usuario para redirigir correctamente
        const userData = userDoc.data()
        const role = userData.role || "client"
        console.log(`User role: ${role}`)

        // Redirigir según el rol
        if (role === "admin") {
          console.log("Redirecting to admin dashboard")
          router.push(`/${params.tenant}/admin/dashboard`)
        } else {
          console.log("Redirecting to client dashboard")
          router.push(`/${params.tenant}/client/dashboard`)
        }
      } else {
        // Redirigir al dashboard general si no hay información de usuario
        router.push(`/${params.tenant}/dashboard`)
      }
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-2">Verificando autenticación...</p>
          <div className="h-1 w-32 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full w-1/2 animate-[pulse_1s_ease-in-out_infinite] rounded-full bg-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="mb-6 text-4xl font-bold">Login - Tenant: {params.tenant}</h1>

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

        <div className="mt-4 text-center">
          <Link href={`/${params.tenant}`} className="text-sm text-gray-600 hover:text-gray-900">
            Volver al inicio
          </Link>
        </div>
        <div className="mt-2 text-center">
          <Link href={`/${params.tenant}/registro`} className="text-sm font-medium text-blue-600 hover:text-blue-500">
            ¿No tienes una cuenta? Regístrate
          </Link>
        </div>
      </div>
    </div>
  )
}
