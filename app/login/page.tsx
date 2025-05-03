"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Función para eliminar todas las cookies de Firebase
const deleteFirebaseCookies = () => {
  const cookies = document.cookie.split(";")

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i]
    const eqPos = cookie.indexOf("=")
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()

    // Eliminar todas las cookies relacionadas con Firebase
    if (name.includes("firebase") || name.includes("__session") || name.includes("auth")) {
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"

      // Intentar con diferentes dominios (para cubrir subdominios)
      const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + rootDomain
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + rootDomain
    }
  }

  // Limpiar localStorage y sessionStorage
  localStorage.clear()
  sessionStorage.clear()

  console.log("Todas las cookies de Firebase han sido eliminadas")
}

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [cleaningSession, setCleaningSession] = useState(false)
  const { signIn, getUserProfile, user, signOut } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Verificar si estamos en un subdominio
  const isSubdomain = () => {
    if (typeof window === "undefined") return false

    const hostname = window.location.hostname
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"

    // Verificar si es un subdominio del dominio raíz
    if (hostname.endsWith(`.${rootDomain}`) && hostname !== `www.${rootDomain}`) {
      return true
    }

    // Para desarrollo local
    if (hostname.includes("localhost")) {
      const subdomainMatch = hostname.match(/^([^.]+)\.localhost/)
      if (subdomainMatch && subdomainMatch[1] !== "www" && subdomainMatch[1] !== "app") {
        return true
      }
    }

    return false
  }

  // Limpiar cualquier estado persistente al cargar la página
  useEffect(() => {
    // Si hay un parámetro clean=true, limpiar las cookies
    const clean = searchParams?.get("clean")

    if (clean === "true") {
      setCleaningSession(true)

      // Eliminar todas las cookies de Firebase
      deleteFirebaseCookies()

      // Esperar un momento y luego recargar sin el parámetro clean
      setTimeout(() => {
        const url = new URL(window.location.href)
        url.searchParams.delete("clean")
        url.searchParams.delete("t")

        // Usar replace en lugar de asignar a window.location.href para evitar añadir a la historia
        window.history.replaceState({}, document.title, url.toString())

        // Marcar que ya limpiamos la sesión
        setCleaningSession(false)
      }, 500)

      return
    }
  }, [searchParams])

  // Si el usuario ya está autenticado, redirigirlo
  useEffect(() => {
    if (user && !cleaningSession) {
      getUserProfile().then((profile) => {
        if (profile) {
          // Solo permitir superadmin en el dominio principal
          if (profile.role === "superadmin") {
            router.push("/superadmin/dashboard")
          } else {
            // Si no es superadmin, redirigir a su tenant
            if (profile.tenantId) {
              const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"
              let tenantUrl
              if (window.location.hostname === "localhost") {
                tenantUrl = `http://${profile.tenantId}.localhost:3000/admin/dashboard`
              } else {
                tenantUrl = `https://${profile.tenantId}.${rootDomain}/admin/dashboard`
              }
              window.location.href = tenantUrl
            } else {
              setError("No tienes acceso a esta área. Por favor, contacta al administrador.")
            }
          }
        }
      })
    }
  }, [user, router, getUserProfile, cleaningSession])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      console.log("Intentando iniciar sesión con:", email)
      await signIn(email, password)
      console.log("Autenticación exitosa, obteniendo perfil...")

      // Obtener el perfil del usuario para determinar su rol
      let userProfile
      try {
        userProfile = await getUserProfile()
        console.log("Perfil obtenido:", userProfile)
      } catch (profileError: any) {
        console.error("Error al obtener perfil:", profileError)
        setError("No se pudo obtener el perfil del usuario. Por favor, intenta de nuevo.")
        setLoading(false)
        return
      }

      if (!userProfile) {
        setError("No se encontró el perfil del usuario. Por favor, contacta al administrador.")
        setLoading(false)
        return
      }

      // Solo permitir superadmin en el dominio principal
      if (userProfile.role !== "superadmin") {
        setError("Solo los superadministradores pueden iniciar sesión en el dominio principal.")
        setLoading(false)

        // Cerrar sesión automáticamente si no es superadmin
        setTimeout(() => {
          signOut()
        }, 1000)

        return
      }

      // Redirigir al dashboard de superadmin
      router.push("/superadmin/dashboard")
    } catch (error: any) {
      console.error("Error completo:", error)
      setError(error.message || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  // Si estamos limpiando la sesión, mostrar un mensaje de carga
  if (cleaningSession) {
    return (
      <div className="container flex items-center justify-center min-h-screen py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Limpiando sesión anterior...</CardTitle>
            <CardDescription>Por favor espera un momento</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Si estamos en un subdominio, no mostrar esta página
  if (isSubdomain()) {
    return null
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Iniciar sesión como Superadmin</CardTitle>
          <CardDescription>Solo los superadministradores pueden iniciar sesión en el dominio principal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="text-right">
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            ¿Quieres registrar un nuevo restaurante?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Registrarse
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
