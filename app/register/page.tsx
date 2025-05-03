"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function Register() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [subdomain, setSubdomain] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validar subdominio
      if (subdomain) {
        const subdomainRegex = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/
        if (!subdomainRegex.test(subdomain)) {
          throw new Error(
            "El subdominio solo puede contener letras minúsculas, números y guiones. No puede comenzar ni terminar con guión.",
          )
        }
      }

      console.log(`Registrando usuario: ${email} con subdominio: ${subdomain || "ninguno"}`)

      await signUp(email, password, {
        name,
        companyName,
        subdomain,
        role: "admin", // Asignar explícitamente el rol de admin
      })

      console.log("Registro exitoso, redirigiendo...")

      // Redirigir al dashboard de admin o al tenant si se creó uno
      if (subdomain) {
        // Construir URL del subdominio
        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"
        const isLocalhost = window.location.hostname.includes("localhost")

        let dashboardUrl
        if (isLocalhost) {
          dashboardUrl = `http://${subdomain}.localhost:3000/tenant/${subdomain}/admin/dashboard`
        } else {
          dashboardUrl = `https://${subdomain}.${rootDomain}/tenant/${subdomain}/admin/dashboard`
        }

        console.log(`Redirigiendo a: ${dashboardUrl}`)

        // Usar window.location para una redirección completa
        window.location.href = dashboardUrl
      } else {
        // Redirigir al dashboard general
        router.push("/dashboard")
      }
    } catch (error: any) {
      console.error("Error en registro:", error)
      setError(error.message || "Error al registrarse")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Crear una cuenta</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Inicia sesión
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nombre completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="company-name" className="block text-sm font-medium text-gray-700">
                Nombre de la empresa
              </label>
              <input
                id="company-name"
                name="companyName"
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700">
                Subdominio
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  id="subdomain"
                  name="subdomain"
                  type="text"
                  className="block w-full flex-1 rounded-none rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                  placeholder="miempresa"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
                />
                <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                  .gastroo.online
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Solo letras minúsculas, números y guiones. No puede comenzar ni terminar con guión.
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
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
        </form>
      </div>
    </div>
  )
}
