"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth, type UserRole } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TenantRegister() {
  const params = useParams()
  const tenantId = params?.tenantId as string
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("client")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [tenantData, setTenantData] = useState<any>(null)
  const [loadingTenant, setLoadingTenant] = useState(true)
  const { signUpTenantUser } = useAuth()
  const router = useRouter()

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
  }, [tenantId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      await signUpTenantUser(email, password, name, role, tenantId)
      setSuccess("Registro exitoso. Ahora puedes iniciar sesión.")

      // Redirigir a la página de login después de un registro exitoso
      setTimeout(() => {
        router.push(`/tenant/${tenantId}/login`)
      }, 2000)
    } catch (error: any) {
      setError(error.message || "Error al registrarse")
    } finally {
      setLoading(false)
    }
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
          <CardTitle className="text-2xl">Registrarse en {tenantData.name}</CardTitle>
          <CardDescription>Crea una cuenta para acceder a los servicios de {tenantData.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
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
            <div className="space-y-2">
              <Label htmlFor="role">Tipo de cuenta</Label>
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Cliente</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Por defecto, te registrarás como cliente. Otros roles son asignados por el administrador.
              </p>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registrando..." : "Registrarse"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{" "}
            <Link href={`/tenant/${tenantId}/login`} className="text-primary hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
