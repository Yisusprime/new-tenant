"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { validateSuperAdminKey } from "../actions"

export default function SuperAdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [keyValidated, setKeyValidated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const { signIn, user } = useAuth()

  // Verificar el estado de autenticación al cargar la página
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Si no hay usuario, permitir el login
        if (!user) {
          setIsCheckingAuth(false)
          return
        }

        // Verificar si el usuario ya está autenticado como superadmin
        // En una implementación real, verificaríamos el rol en la base de datos

        // Por ahora, simplemente redirigimos si hay un usuario autenticado
        window.location.href = "/superadmin/dashboard"
      } catch (error) {
        console.error("Error al verificar autenticación:", error)
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [user])

  // Función para validar la clave secreta
  const handleValidateKey = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Llamar a la acción del servidor para validar la clave
      const result = await validateSuperAdminKey(secretKey)

      if (result.valid) {
        setKeyValidated(true)
      } else {
        setError(result.message || "Clave secreta incorrecta")
      }
    } catch (error: any) {
      console.error("Error al validar la clave:", error)
      setError("Error al validar la clave secreta")
    } finally {
      setLoading(false)
    }
  }

  // Función para iniciar sesión
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Iniciar sesión con Firebase
      await signIn(email, password)

      // Redirigir al dashboard de superadmin
      window.location.href = "/superadmin/dashboard"
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error)
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
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">SuperAdmin Login</h2>
          <p className="mt-2 text-center text-sm text-gray-400">Acceso exclusivo para superadministradores</p>
        </div>

        {!keyValidated ? (
          // Paso 1: Validar la clave secreta
          <form className="mt-8 space-y-6" onSubmit={handleValidateKey}>
            <div>
              <label htmlFor="secret-key" className="block text-sm font-medium text-gray-300">
                Clave secreta
              </label>
              <input
                id="secret-key"
                name="secretKey"
                type="password"
                required
                className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-white shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">Se requiere una clave secreta para acceder como superadmin.</p>
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
                {loading ? "Validando..." : "Validar clave"}
              </button>
            </div>

            <div className="flex justify-center text-sm">
              <Link href="/" className="text-gray-400 hover:text-white">
                Volver al inicio
              </Link>
            </div>
          </form>
        ) : (
          // Paso 2: Iniciar sesión
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
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
                  className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-white shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
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
                  autoComplete="current-password"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-white shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
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
                {loading ? "Iniciando sesión..." : "Iniciar sesión"}
              </button>
            </div>

            <div className="flex justify-between text-sm">
              <Link href="/superadmin/register" className="text-gray-400 hover:text-white">
                Registrarse como SuperAdmin
              </Link>
              <button type="button" onClick={() => setKeyValidated(false)} className="text-gray-400 hover:text-white">
                Cambiar clave
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
