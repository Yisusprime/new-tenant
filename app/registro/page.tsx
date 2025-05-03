"use client"

import type React from "react"
import { useState, useTransition, useEffect } from "react"
import Link from "next/link"
import { registerTenant } from "../actions"

export default function Registro() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [subdomain, setSubdomain] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isPending, startTransition] = useTransition()
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [debugMode, setDebugMode] = useState(false)

  // Verificar que las variables de entorno estén disponibles
  useEffect(() => {
    const checkEnvVars = async () => {
      try {
        const envCheck = {
          apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          rootDomain: !!process.env.NEXT_PUBLIC_ROOT_DOMAIN,
        }

        setDebugInfo({
          env: envCheck,
          firebase: {
            initialized: true, // Asumimos que está inicializado
          },
        })

        if (Object.values(envCheck).some((val) => !val)) {
          console.warn(
            "Algunas variables de entorno no están definidas:",
            Object.keys(envCheck).filter((key) => !envCheck[key as keyof typeof envCheck]),
          )
        }
      } catch (error) {
        console.error("Error al verificar variables de entorno:", error)
      }
    }

    checkEnvVars()
  }, [])

  const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convertir a minúsculas y eliminar caracteres no permitidos
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
    setSubdomain(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (subdomain.length < 3) {
      setError("El subdominio debe tener al menos 3 caracteres")
      return
    }

    // Validar que el subdominio solo contenga letras, números y guiones
    if (!/^[a-z0-9-]+$/.test(subdomain)) {
      setError("El subdominio solo puede contener letras minúsculas, números y guiones")
      return
    }

    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append("name", name)
        formData.append("email", email)
        formData.append("password", password)
        formData.append("confirmPassword", confirmPassword)
        formData.append("subdomain", subdomain)

        const result = await registerTenant(formData)

        if (result.success) {
          setSuccess("¡Registro exitoso! Redirigiendo al dashboard...")
          // Redirigir al dashboard del tenant
          setTimeout(() => {
            window.location.href = result.tenantUrl
          }, 2000)
        } else {
          setError(result.message || "Error al registrarse")
        }
      } catch (error: any) {
        console.error("Error en el registro:", error)
        setError(error.message || "Error inesperado durante el registro")
      }
    })
  }

  // Función para activar/desactivar el modo de depuración
  const toggleDebugMode = () => {
    setDebugMode(!debugMode)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Barra de navegación */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            Multi-Cliente
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900">
              Iniciar sesión
            </Link>
            <button
              onClick={toggleDebugMode}
              className="text-xs text-gray-500 hover:text-gray-700"
              title="Activar/desactivar modo de depuración"
            >
              {debugMode ? "Ocultar debug" : "Debug"}
            </button>
          </div>
        </div>
      </header>

      {/* Formulario de registro */}
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Crear tu restaurante</h2>

          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>
          )}

          {/* Información de depuración */}
          {debugMode && debugInfo && (
            <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Información de depuración</p>
              <details className="mt-2" open>
                <summary className="cursor-pointer text-sm">Variables de entorno</summary>
                <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto">
                  {JSON.stringify(debugInfo.env, null, 2)}
                </pre>
              </details>
              <details className="mt-2">
                <summary className="cursor-pointer text-sm">Firebase</summary>
                <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto">
                  {JSON.stringify(debugInfo.firebase, null, 2)}
                </pre>
              </details>
              <p className="mt-2 text-xs text-gray-500">
                Nota: Si alguna variable de entorno muestra "false", significa que no está definida correctamente.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del restaurante
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Restaurante Ejemplo"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700 mb-1">
                Subdominio
              </label>
              <div className="flex items-center">
                <input
                  id="subdomain"
                  type="text"
                  value={subdomain}
                  onChange={handleSubdomainChange}
                  required
                  placeholder="tu-restaurante"
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="bg-gray-100 px-3 py-2 border border-l-0 border-gray-300 rounded-r-md text-gray-500">
                  .gastroo.online
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">Solo letras minúsculas, números y guiones.</p>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isPending ? "Registrando..." : "Registrarse"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-800">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 py-4">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Gastroo. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
