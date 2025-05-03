"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase/client"

// Función para validar la clave secreta
async function validateSuperAdminSecretKey(secretKey: string): Promise<boolean> {
  const expectedSecretKey = process.env.SUPERADMIN_SECRET_KEY || "superadmin123"
  return secretKey === expectedSecretKey
}

export default function SuperAdminRegister() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Verificar clave secreta
      const isValidKey = await validateSuperAdminSecretKey(secretKey)
      if (!isValidKey) {
        throw new Error("Clave secreta incorrecta. No tienes permiso para registrarte como superadmin.")
      }

      // Registrar usuario con rol de superadmin
      const userCredential = await signUp(email, password, {
        name,
        role: "superadmin",
      })

      // Verificar si es el primer superadmin
      const statsDoc = await getDoc(doc(db, "system", "stats"))
      if (!statsDoc.exists()) {
        // Crear documento de estadísticas
        await setDoc(doc(db, "system", "stats"), {
          totalUsers: 1,
          totalSuperadmins: 1,
          totalTenants: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      } else {
        // Actualizar estadísticas
        await setDoc(
          doc(db, "system", "stats"),
          {
            totalSuperadmins: (statsDoc.data()?.totalSuperadmins || 0) + 1,
            totalUsers: (statsDoc.data()?.totalUsers || 0) + 1,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        )
      }

      // Redirigir al dashboard de superadmin
      router.push("/superadmin/dashboard")
    } catch (error: any) {
      console.error("Error al registrarse:", error)
      setError(error.message || "Error al registrarse")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">Registro de SuperAdmin</h2>
          <p className="mt-2 text-center text-sm text-gray-400">Acceso exclusivo para superadministradores</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                Nombre completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-300">
                Correo electrónico
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="secret-key" className="block text-sm font-medium text-gray-300">
                Clave secreta
              </label>
              <input
                id="secret-key"
                name="secretKey"
                type="password"
                required
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">
                Se requiere una clave secreta para registrarse como superadmin.
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-900 p-4">
              <div className="text-sm text-white">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-blue-400"
            >
              {loading ? "Registrando..." : "Registrarse"}
            </button>
          </div>

          <div className="flex justify-between text-sm">
            <Link href="/superadmin/login" className="text-gray-400 hover:text-white">
              ¿Ya tienes una cuenta? Inicia sesión
            </Link>
            <Link href="/" className="text-gray-400 hover:text-white">
              Volver al inicio
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
