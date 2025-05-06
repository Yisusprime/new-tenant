"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { SuperAdminSidebar } from "@/components/superadmin-sidebar"
import { createTenant } from "@/lib/actions"

export default function NewTenantPage() {
  const router = useRouter()
  const { user, loading, checkUserRole } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    tenant: "",
    ownerEmail: "",
    ownerName: "",
  })

  useEffect(() => {
    // Verificar si el usuario está autenticado y es superadmin
    if (!loading && (!user || !checkUserRole("superadmin"))) {
      toast({
        title: "Acceso denegado",
        description: "No tienes permisos de Super Admin para acceder a esta página.",
        variant: "destructive",
      })
      router.push("/superadmin/login")
    }
  }, [user, loading, router, toast, checkUserRole])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: id === "tenant" ? value.toLowerCase().replace(/[^a-z0-9]/g, "") : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!user) {
        throw new Error("Usuario no autenticado")
      }

      // Usar el Server Action para crear el tenant
      const result = await createTenant({
        ...formData,
        userId: user.uid,
      })

      if (result.success) {
        toast({
          title: "Tenant creado",
          description: result.message,
        })
        router.push("/superadmin/dashboard")
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error al crear tenant:", error)
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al crear el tenant.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  return (
    <div className="flex min-h-screen">
      <SuperAdminSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Crear Nuevo Tenant</h1>

          <Card>
            <CardHeader>
              <CardTitle>Información del Tenant</CardTitle>
              <CardDescription>Ingresa los datos para crear un nuevo tenant</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Restaurante</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Restaurante El Buen Sabor"
                    required
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenant">Subdominio</Label>
                  <div className="flex items-center">
                    <Input
                      id="tenant"
                      type="text"
                      placeholder="restaurante"
                      required
                      value={formData.tenant}
                      onChange={handleChange}
                      className="rounded-r-none"
                    />
                    <span className="bg-muted px-3 py-2 border border-l-0 rounded-r-md">.gastroo.online</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Este será el subdominio para acceder a la plataforma del tenant
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Nombre del Propietario</Label>
                  <Input
                    id="ownerName"
                    type="text"
                    placeholder="Juan Pérez"
                    required
                    value={formData.ownerName}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerEmail">Correo del Propietario</Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    placeholder="propietario@ejemplo.com"
                    required
                    value={formData.ownerEmail}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                  <Button type="button" variant="outline" asChild>
                    <Link href="/superadmin/dashboard">Cancelar</Link>
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Creando..." : "Crear Tenant"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
