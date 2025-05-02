"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function TenantLogin() {
  const params = useParams()
  const tenantId = params?.tenantId as string
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [tenantData, setTenantData] = useState<any>(null)
  const [loadingTenant, setLoadingTenant] = useState(true)
  const { signIn, getUserProfile } = useAuth()
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
      if (userProfile.tenantId !== tenantId && userProfile.role !== "admin") {
        setError(`No tienes acceso al tenant ${tenantId}`)
        setLoading(false)
        return
      }

      // Redirección basada en rol
      switch (userProfile.role) {
        case "admin":
          router.push(`/dashboard`)
          break
        case "client":
          router.push(`/tenant/${tenantId}/client`)
          break
        case "delivery":
          router.push(`/tenant/${tenantId}/delivery`)
          break
        case "waiter":
          router.push(`/tenant/${tenantId}/waiter`)
          break
        case "manager":
          router.push(`/tenant/${tenantId}/manager`)
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
