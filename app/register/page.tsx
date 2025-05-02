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

export default function Register() {
  const [name, setName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { signUp, user } = useAuth()
  const router = useRouter()

  // Limpiar cualquier estado persistente al cargar la página
  useEffect(() => {
    // Limpiar cualquier cookie o localStorage que pueda estar causando redirecciones incorrectas
    if (typeof window !== "undefined") {
      // Limpiar localStorage
      localStorage.removeItem("lastTenant")
      localStorage.removeItem("lastRole")

      // Limpiar sessionStorage
      sessionStorage.removeItem("lastTenant")
      sessionStorage.removeItem("lastRole")

      // Forzar la recarga de la página si venimos de un subdominio
      const referrer = document.referrer
      const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"

      if (
        referrer &&
        !referrer.includes(`www.${rootDomain}`) &&
        !referrer.includes("localhost:3000") &&
        (referrer.includes(`.${rootDomain}`) || referrer.includes(".localhost"))
      ) {
        // Si venimos de un subdominio y estamos en el dominio principal, forzar recarga
        if (!window.location.href.includes("?reloaded=true")) {
          window.location.href = window.location.href + "?reloaded=true"
        }
      }
    }
  }, [])

  // Si el usuario ya está autenticado, redirigirlo
  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Registrar al usuario
      await signUp(email, password, name, companyName)

      // Crear el subdominio a partir del nombre de la compañía
      const tenantId = companyName.toLowerCase().replace(/[^a-z0-9]/g, "-")

      // Redirigir al subdominio creado
      const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"

      // Construir la URL del subdominio
      let subdomainUrl
      if (window.location.hostname === "localhost") {
        // Para desarrollo local
        subdomainUrl = `http://${tenantId}.localhost:3000/admin/dashboard`
      } else {
        // Para producción
        subdomainUrl = `https://${tenantId}.${rootDomain}/admin/dashboard`
      }

      console.log("Redirigiendo a:", subdomainUrl)
      window.location.href = subdomainUrl
    } catch (error: any) {
      console.error("Error en registro:", error)
      setError(error.message || "Error al registrarse")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Crear cuenta de restaurante</CardTitle>
          <CardDescription>Registra tu restaurante en la plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Nombre del restaurante</Label>
              <Input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Este nombre se usará para crear tu subdominio personalizado
              </p>
            </div>
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
                minLength={6}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registrando..." : "Registrar restaurante"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
