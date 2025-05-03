"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { doc, getDoc } from "firebase/firestore"
import { getFirestore } from "firebase/firestore"
import { app } from "@/lib/firebase/client"
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

export default function TenantLogin() {
  const params = useParams()
  const tenantId = params?.tenantId as string
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [tenantData, setTenantData] = useState<any>(null)
  const [loadingTenant, setLoadingTenant] = useState(true)
  const [cleaningSession, setCleaningSession] = useState(false)
  const { user, signIn, getUserProfile, signOut } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const db = getFirestore(app)

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

  // Verificar si el usuario ya está autenticado
  useEffect(() => {
    if (user && !cleaningSession) {
      getUserProfile().then((profile) => {
        if (profile) {
          // Verificar si el usuario pertenece a este tenant
          if (profile.tenantId !== tenantId) {
            setError(`No tienes acceso al tenant ${tenantId}. Tu tenant es: ${profile.tenantId}`)
            // Cerrar sesión automáticamente si no pertenece a este tenant
            setTimeout(() => {
              signOut()
            }, 2000)
            return
          }

          // Si es superadmin, redirigir al dominio principal
          if (profile.role === "superadmin") {
            const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"
            window.location.href = `https://www.${rootDomain}/superadmin/dashboard`
            return
          }

          // Redirección basada en rol dentro del tenant
          switch (profile.role) {
            case "admin":
              router.push(`/admin/dashboard`)
              break
            case "manager":
              router.push(`/manager/dashboard`)
              break
            case "waiter":
              router.push(`/waiter/dashboard`)
              break
            case "delivery":
              router.push(`/delivery/dashboard`)
              break
            case "client":
              router.push(`/client/dashboard`)
              break
            default:
              router.push(`/dashboard`)
          }
        }
      })
    }
  }, [user, router, getUserProfile, tenantId, signOut, cleaningSession])

  useEffect(() => {
    async function fetchTenantData() {
      if (!tenantId) return

      try {
        const tenantDoc = await getDoc(doc(db, "tenants", tenantId))
        if (tenantDoc.exists()) {
          setTenantData(tenantDoc.data())
        } else {
          setError(`No se encontró el tenant: ${tenantId}`)
        }
      } catch (err) {
        console.error("Error fetching tenant data:", err)
        setError("Error al cargar los datos del tenant")
      } finally {
        setLoadingTenant(false)
      }
    }

    fetchTenantData()
  }, [tenantId, db])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      console.log("Intentando iniciar sesión con:", email)
      await signIn(email, password)
      console.log("Autenticación exitosa, obteniendo perfil...")

      // Obtener el perfil del usuario para determinar su rol y tenant
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

      // Verificar si el usuario pertenece a este tenant
      if (userProfile.tenantId !== tenantId) {
        setError(`No tienes acceso al tenant ${tenantId}. Tu tenant es: ${userProfile.tenantId}`)
        setLoading(false)

        // Cerrar sesión automáticamente si no pertenece a este tenant
        setTimeout(() => {
          signOut()
        }, 2000)

        return
      }

      // Si es superadmin, redirigir al dominio principal
      if (userProfile.role === "superadmin") {
        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"
        window.location.href = `https://www.${rootDomain}/superadmin/dashboard`
        return
      }

      // Redirección basada en rol dentro del tenant
      switch (userProfile.role) {
        case "admin":
          router.push(`/admin/dashboard`)
          break
        case "manager":
          router.push(`/manager/dashboard`)
          break
        case "waiter":
          router.push(`/waiter/dashboard`)
          break
        case "delivery":
          router.push(`/delivery/dashboard`)
          break
        case "client":
          router.push(`/client/dashboard`)
          break
        default:
          router.push(`/dashboard`)
      }
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

  if (loadingTenant) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <p>Cargando información del tenant...</p>
      </div>
    )
  }

  if (!tenantData) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error || `No se encontró el tenant: ${tenantId}`}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Iniciar sesión en {tenantData.name}</CardTitle>
          <CardDescription>Ingresa tus credenciales para acceder a los servicios de {tenantData.name}</CardDescription>
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
                <Link href={`/tenant/${tenantId}/forgot-password`} className="text-sm text-primary hover:underline">
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
            ¿No tienes una cuenta?{" "}
            <Link href={`/tenant/${tenantId}/register`} className="text-primary hover:underline">
              Registrarse
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
