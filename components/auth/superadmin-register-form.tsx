"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createSuperAdmin } from "@/lib/services/auth-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export function SuperAdminRegisterForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    try {
      const user = await createSuperAdmin(email, password, name, secretKey)

      if (user) {
        router.push("/superadmin/dashboard")
      } else {
        setError("Error al crear la cuenta de superadmin")
      }
    } catch (err: any) {
      setError(err.message || "Ocurrió un error durante el registro")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Crear cuenta de SuperAdmin</CardTitle>
        <CardDescription>Ingresa tus datos para crear una cuenta de superadministrador</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="secretKey">Clave secreta</Label>
            <Input
              id="secretKey"
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="Clave secreta de superadmin"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creando cuenta..." : "Registrarse como SuperAdmin"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/superadmin/login" className="text-primary hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
