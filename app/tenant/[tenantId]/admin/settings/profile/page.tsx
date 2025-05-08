"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/context/auth-context"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

export default function ProfilePage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [tenantData, setTenantData] = useState<any>(null)
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    position: "",
    bio: "",
  })

  useEffect(() => {
    async function fetchData() {
      if (!user) return

      try {
        setLoading(true)

        // Fetch tenant data
        const tenantDoc = await getDoc(doc(db, "tenants", tenantId))
        if (tenantDoc.exists()) {
          setTenantData(tenantDoc.data())
        }

        // Fetch user role data
        const roleDoc = await getDoc(doc(db, `tenants/${tenantId}/roles`, user.uid))
        if (roleDoc.exists()) {
          const roleData = roleDoc.data()
          setUserData(roleData)

          // Initialize form with existing data if available
          setFormData({
            fullName: roleData.fullName || "",
            phone: roleData.phone || "",
            position: roleData.position || "",
            bio: roleData.bio || "",
          })
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, tenantId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    try {
      setSaving(true)

      // Update user profile in Firebase
      const userRef = doc(db, `tenants/${tenantId}/roles`, user.uid)
      await updateDoc(userRef, {
        ...formData,
        updatedAt: new Date().toISOString(),
      })

      toast({
        title: "Perfil actualizado",
        description: "Tu información de perfil ha sido actualizada correctamente",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Import updateDoc only when needed to avoid issues with SSR
  const updateDoc = async (docRef: any, data: any) => {
    const { updateDoc } = await import("firebase/firestore")
    return updateDoc(docRef, data)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Perfil de Usuario</h1>
        <p className="text-gray-500">Administra tu información personal y configuración de cuenta</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>Actualiza tu información de perfil</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre completo</Label>
                {loading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="Tu nombre completo"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                {loading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Tu número de teléfono"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Cargo</Label>
                {loading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input
                    id="position"
                    name="position"
                    placeholder="Tu cargo en la empresa"
                    value={formData.position}
                    onChange={handleChange}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografía</Label>
                {loading ? (
                  <Skeleton className="h-24 w-full" />
                ) : (
                  <Textarea
                    id="bio"
                    name="bio"
                    placeholder="Cuéntanos sobre ti"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                  />
                )}
              </div>

              <Button type="submit" disabled={saving || loading}>
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Cuenta</CardTitle>
            <CardDescription>Información de tu cuenta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-semibold">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <h3 className="font-medium">Usuario</h3>
                <p className="text-sm text-gray-500">
                  {loading ? <Skeleton className="h-4 w-32" /> : user?.email || "No disponible"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email:</h3>
                <p>{loading ? <Skeleton className="h-4 w-48" /> : user?.email || "No disponible"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">ID de Usuario:</h3>
                <p>{loading ? <Skeleton className="h-4 w-48" /> : user?.uid || "No disponible"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Rol:</h3>
                <p>
                  {loading ? (
                    <Skeleton className="h-4 w-24" />
                  ) : (
                    (userData?.role === "admin" ? "Administrador" : userData?.role) || "Usuario"
                  )}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Tenant:</h3>
                <p>{loading ? <Skeleton className="h-4 w-32" /> : tenantData?.name || tenantId}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Cuenta creada:</h3>
                <p>
                  {loading ? (
                    <Skeleton className="h-4 w-40" />
                  ) : userData?.createdAt ? (
                    new Date(userData.createdAt).toLocaleDateString()
                  ) : (
                    "No disponible"
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
