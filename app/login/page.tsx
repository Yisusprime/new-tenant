"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [hostname, setHostname] = useState("")
  const { signIn, getUserProfile, user } = useAuth()
  const router = useRouter()

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

  // Usamos useEffect para detectar el subdominio
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Detectar si estamos en un subdominio
      const host = window.location.hostname
      setHostname(host)

      // Si estamos en un subdominio, redirigir a la página de login específica del tenant
      if (isSubdomain()) {
        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"
        const subdomain = host.replace(`.${rootDomain}`, "")
        router.push(`/tenant/${subdomain}/login`)
      }
    }
  }, [router])

  // Si el usuario ya está autenticado, redirigirlo
  useEffect(() => {
    if (user) {
      getUserProfile().then((profile) => {
        if (profile) {
          // Redirección basada en rol
          switch (profile.role) {
            case "superadmin":
              router.push("/superadmin/dashboard")
              break
            case "admin":
              // Si el usuario es admin y tiene un tenant, redirigirlo a su subdominio
              if (profile.tenantId) {
                const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"
                window.location.href = `https://${profile.tenantId}.${rootDomain}/admin/dashboard`
              } else {
                router.push("/admin/dashboard")
              }
              break
            default:
              router.push("/dashboard")
          }
        }
      })
    }
  }, [user, router, getUserProfile])

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

      // Lógica de redirección basada en el rol
      switch (userProfile.role) {
        case "superadmin":
          router.push("/superadmin/dashboard")
          break
        case "admin":
          // Si el usuario es admin y tiene un tenant, redirigirlo a su subdominio
          if (userProfile.tenantId) {
            const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"
            window.location.href = `https://${userProfile.tenantId}.${rootDomain}/admin/dashboard`
          } else {
            router.push("/admin/dashboard")
          }
          break
        default:
          router.push("/dashboard")
      }
    } catch (error: any) {
      console.error("Error completo:", error)
      setError(error.message || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  // Si estamos en un subdominio, no mostrar esta página (la redirección se maneja en useEffect)
  if (isSubdomain()) {
    return null
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
          <CardDescription>Ingresa tus credenciales para acceder al panel de administración</CardDescription>
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
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Registrarse
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
