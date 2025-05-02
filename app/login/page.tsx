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
  const [tenantId, setTenantId] = useState<string | null>(null)
  const { signIn, getUserProfile } = useAuth()
  const router = useRouter()

  // Usamos useEffect para detectar el subdominio
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Detectar si estamos en un subdominio
      const host = window.location.hostname
      setHostname(host)

      // Obtener el dominio raíz (ej., gastroo.online)
      const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"

      // Verificar si es un subdominio del dominio raíz
      if (host.endsWith(`.${rootDomain}`)) {
        const subdomain = host.replace(`.${rootDomain}`, "")
        if (subdomain !== "www" && subdomain !== "app") {
          setTenantId(subdomain)
        }
      }

      // Para desarrollo local
      if (host.includes("localhost")) {
        const subdomainMatch = host.match(/^([^.]+)\.localhost/)
        if (subdomainMatch) {
          const subdomain = subdomainMatch[1]
          if (subdomain !== "www" && subdomain !== "app") {
            setTenantId(subdomain)
          }
        }
      }
    }
  }, [])

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

      // Lógica de redirección basada en el contexto y rol
      if (tenantId) {
        // Estamos en un subdominio de tenant
        console.log(`Estamos en el subdominio ${tenantId}, verificando acceso...`)

        // Verificar si el usuario pertenece a este tenant
        if (userProfile.tenantId !== tenantId) {
          console.log(`Usuario no pertenece al tenant ${tenantId}, verificando roles alternativos...`)

          // Si el usuario es admin, permitir acceso a cualquier tenant
          if (userProfile.role === "admin") {
            console.log("Usuario es admin, permitiendo acceso")
            router.push("/dashboard")
            return
          }

          throw new Error(`No tienes acceso al tenant ${tenantId}`)
        }

        // Redirección basada en rol dentro del tenant
        switch (userProfile.role) {
          case "admin":
            router.push("/dashboard")
            break
          case "client":
            router.push("/client")
            break
          case "delivery":
            router.push("/delivery")
            break
          case "waiter":
            router.push("/waiter")
            break
          case "manager":
            router.push("/manager")
            break
          default:
            router.push("/dashboard")
        }
      } else {
        // Estamos en el dominio principal
        console.log("Estamos en el dominio principal")

        // Si el usuario es dueño de un tenant, redirigir a su subdominio
        if (userProfile.isTenantOwner && userProfile.tenantId) {
          console.log(`Usuario es dueño del tenant ${userProfile.tenantId}, redirigiendo...`)
          const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"
          window.location.href = `https://${userProfile.tenantId}.${rootDomain}/dashboard`
        } else {
          // Si no es dueño de un tenant, redirigir al dashboard principal
          console.log("Usuario no es dueño de un tenant, redirigiendo al dashboard principal")
          router.push("/dashboard")
        }
      }
    } catch (error: any) {
      console.error("Error completo:", error)
      setError(error.message || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
          <CardDescription>
            {tenantId
              ? `Ingresa tus credenciales para acceder a tu cuenta en ${tenantId}`
              : "Ingresa tus credenciales para acceder a tu cuenta"}
          </CardDescription>
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
