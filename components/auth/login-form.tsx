"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { loginWithEmail } from "@/lib/firebase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface LoginFormProps {
  redirectUrl?: string
  isSuperAdmin?: boolean
}

export function LoginForm({ redirectUrl = "/", isSuperAdmin = false }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await loginWithEmail(email, password)
      router.push(redirectUrl)
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isSuperAdmin ? "Iniciar Sesión como Super Admin" : "Iniciar Sesión"}</CardTitle>
        <CardDescription>Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          ¿No tienes una cuenta?{" "}
          <a href={isSuperAdmin ? "/superadmin/register" : "/register"} className="text-primary hover:underline">
            Regístrate
          </a>
        </p>
      </CardFooter>
    </Card>
  )
}
