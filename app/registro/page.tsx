"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    subdomain: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signUp } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "subdomain" ? value.toLowerCase() : value,
    }))
  }

  const validateSubdomain = (subdomain: string) => {
    const regex = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/
    if (!subdomain) return "El subdominio es obligatorio"
    if (!regex.test(subdomain)) return "Subdominio inválido: solo letras minúsculas, números y guiones medios"
    if (subdomain.length < 3) return "El subdominio debe tener al menos 3 caracteres"
    if (subdomain.length > 63) return "El subdominio no puede exceder 63 caracteres"
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validación del subdominio
      const subdomainError = validateSubdomain(formData.subdomain)
      if (subdomainError) {
        throw new Error(subdomainError)
      }

      // Validación básica de otros campos
      if (!formData.name || !formData.email || !formData.password || !formData.companyName) {
        throw new Error("Todos los campos son obligatorios")
      }

      console.log(`Registrando usuario: ${formData.email} con subdominio: ${formData.subdomain}`)

      // Registrar el usuario - la función signUp devuelve directamente el userCredential
      await signUp(formData.email, formData.password, {
        name: formData.name,
        companyName: formData.companyName,
        subdomain: formData.subdomain,
        role: "admin",
      })

      console.log("Registro exitoso, redirigiendo...")

      // Construir URL de redirección
      const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"
      const isLocalhost = typeof window !== "undefined" && window.location.hostname.includes("localhost")
      const protocol = isLocalhost ? "http" : "https"
      const port = isLocalhost ? ":3000" : ""
      const baseUrl = isLocalhost ? "localhost" : rootDomain

      const dashboardUrl = `${protocol}://${formData.subdomain}.${baseUrl}${port}/admin/dashboard`

      console.log(`Redirigiendo a: ${dashboardUrl}`)
      window.location.href = dashboardUrl
    } catch (error: any) {
      console.error("Error en registro:", error)
      setError(error.message || "Ocurrió un error durante el registro")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">Crear cuenta de administrador</h2>
          <p className="mt-2 text-sm text-gray-600">Configura tu cuenta y subdominio único</p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nombre completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                value={formData.email}
                onChange={handleChange}
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
                minLength={8}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                Nombre de la empresa
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                value={formData.companyName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700">
                Subdominio único
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  id="subdomain"
                  name="subdomain"
                  type="text"
                  required
                  pattern="[a-z0-9-]+"
                  title="Solo letras minúsculas, números y guiones"
                  className="block w-full rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  placeholder="ej: miempresa"
                  value={formData.subdomain}
                  onChange={handleChange}
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

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 focus-visible:outline-blue-600"
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creando cuenta...
                </>
              ) : (
                "Registrarse"
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
