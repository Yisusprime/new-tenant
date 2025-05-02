"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import DashboardLayout from "@/components/dashboard-layout"

export default function Settings() {
  const { user, getUserProfile } = useAuth()
  const [userProfile, setUserProfile] = useState<any>(null)
  const [name, setName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    async function loadUserProfile() {
      try {
        const profile = await getUserProfile()
        setUserProfile(profile)
        setName(profile?.name || "")
        setCompanyName(profile?.companyName || "")
      } catch (error) {
        console.error("Error loading user profile:", error)
      }
    }

    loadUserProfile()
  }, [user, getUserProfile, router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: "", text: "" })

    try {
      if (!user) {
        throw new Error("Usuario no autenticado")
      }

      // Update user profile
      await updateDoc(doc(db, "users", user.uid), {
        name,
        companyName,
      })

      // Update tenant record if company name changed
      if (userProfile?.companyName !== companyName && userProfile?.subdomain) {
        await updateDoc(doc(db, "tenants", userProfile.subdomain), {
          name: companyName,
        })
      }

      setMessage({
        type: "success",
        text: "Perfil actualizado correctamente",
      })
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Error al actualizar perfil",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!userProfile) {
    return <div>Cargando...</div>
  }

  return (
    <DashboardLayout>
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">Configuración</h1>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Perfil de usuario</CardTitle>
              <CardDescription>Actualiza tu información personal</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input id="email" type="email" value={user?.email || ""} disabled />
                  <p className="text-xs text-muted-foreground">El correo electrónico no se puede cambiar</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Nombre de la empresa</Label>
                  <Input
                    id="companyName"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subdomain">Subdominio</Label>
                  <Input id="subdomain" type="text" value={userProfile.subdomain} disabled />
                  <p className="text-xs text-muted-foreground">El subdominio no se puede cambiar</p>
                </div>

                {message.text && (
                  <div
                    className={`p-3 rounded text-sm ${
                      message.type === "error" ? "bg-destructive/10 text-destructive" : "bg-green-100 text-green-800"
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <Button type="submit" disabled={loading}>
                  {loading ? "Actualizando..." : "Actualizar perfil"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
