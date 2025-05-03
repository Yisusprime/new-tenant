"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface RegisterFormProps {
  redirectUrl?: string
  isSuperAdmin?: boolean
}

export function RegisterForm({ redirectUrl = "/", isSuperAdmin = false }: RegisterFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [tenantName, setTenantName] = useState("")
  const [restaurantName, setRestaurantName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setLoading(true)

    try {
      if (isSuperAdmin) {
        // Registrar superadmin
        const response = await fetch("/api/superadmin/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            secretKey,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Error al registrar superadmin")
        }

        // Iniciar sesión con el token personalizado
        await fetch("/api/auth/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idToken: data.customToken }),
        })

        router.push("/superadmin/dashboard")
      } else {
        // Registrar tenant
        if (!tenantName || !restaurantName) {
          setError("El nombre del tenant y del restaurante son obligatorios")
          setLoading(false)
          return
        }

        const response = await fetch("/api/tenants/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            tenantName,
            restaurantName,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Error al registrar tenant")
        }

        // Iniciar sesión con el token personalizado
        await fetch("/api/auth/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idToken: data.customToken }),
        })

        // Redirigir al dashboard del tenant
        window.location.href = `https://${data.tenantId}.gastroo.online/admin/dashboard`
      }
    } catch (err: any) {
      setError(err.message || "Error al registrarse")
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isSuperAdmin ? "Registrarse como Super Admin" : "Registrar Restaurante"}</CardTitle>
        <CardDescription>
          {isSuperAdmin ? "Crea una cuenta de super administrador" : "Crea tu cuenta y configura tu restaurante"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isSuperAdmin && (
            <>
              <div className="space-y-2">
                <Label htmlFor="restaurantName">Nombre del Restaurante</Label>
                <Input
                  id="restaurantName"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  required
                  placeholder="Mi Restaurante"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenantName">Subdominio</Label>
                <div className="flex items-center">
                  <Input
                    id="tenantName"
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    required
                    placeholder="mirestaurante"
                    className="rounded-r-none"
                  />
                  <span className="bg-muted px-3 py-2 border border-l-0 rounded-r-md">.gastroo.online</span>
                </div>
                <p className="text-xs text-muted-foreground">Solo letras minúsculas, números y guiones</p>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="********"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="********"
            />
          </div>

          {isSuperAdmin && (
            <div className="space-y-2">
              <Label htmlFor="secretKey">Clave Secreta</Label>
              <Input
                id="secretKey"
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                required
                placeholder="Clave secreta de superadmin"
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Registrando..." : "Registrarse"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          ¿Ya tienes una cuenta?{" "}
          <a href={isSuperAdmin ? "/superadmin/login" : "/login"} className="text-primary hover:underline">
            Iniciar Sesión
          </a>
        </p>
      </CardFooter>
    </Card>
  )
}
