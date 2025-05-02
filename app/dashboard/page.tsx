"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import DashboardLayout from "@/components/dashboard-layout"
import { PLAN_LIMITS, type PlanType, checkDomainLimit } from "@/lib/plans"
import { Progress } from "@/components/ui/progress"

export default function Dashboard() {
  const { user, getUserProfile } = useAuth()
  const [userProfile, setUserProfile] = useState<any>(null)
  const [tenantData, setTenantData] = useState<any>(null)
  const [customDomain, setCustomDomain] = useState("")
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

        // Get tenant data to check for custom domain
        if (profile?.subdomain) {
          const tenantDoc = await getDoc(doc(db, "tenants", profile.subdomain))
          if (tenantDoc.exists()) {
            const data = tenantDoc.data()
            setTenantData(data)
            if (data.customDomain) {
              setCustomDomain(data.customDomain)
            }
          }
        }
      } catch (error) {
        console.error("Error loading user profile:", error)
      }
    }

    loadUserProfile()
  }, [user, getUserProfile, router])

  const handleAddCustomDomain = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: "", text: "" })

    try {
      if (!userProfile?.subdomain) {
        throw new Error("No se encontró información del subdominio")
      }

      // Validate domain format
      const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/
      if (!customDomain || !domainRegex.test(customDomain)) {
        throw new Error("Formato de dominio inválido")
      }

      // Verificar límite de dominios según el plan
      const plan = tenantData?.plan || ("free" as PlanType)
      const canAddDomain = await checkDomainLimit(userProfile.subdomain, plan)

      if (!canAddDomain) {
        throw new Error(
          `Has alcanzado el límite de dominios para tu plan ${plan}. Actualiza tu plan para añadir más dominios.`,
        )
      }

      // Update tenant record with custom domain
      await updateDoc(doc(db, "tenants", userProfile.subdomain), {
        customDomain,
      })

      // Create domain record
      await updateDoc(doc(db, "domains", customDomain), {
        tenantId: userProfile.subdomain,
        createdAt: new Date().toISOString(),
        verified: false,
      })

      setMessage({
        type: "success",
        text: "Dominio personalizado agregado correctamente. Configura el registro CNAME en tu proveedor DNS.",
      })
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Error al agregar dominio personalizado",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!userProfile || !tenantData) {
    return <div>Cargando...</div>
  }

  const plan = tenantData.plan || ("free" as PlanType)
  const planLimits = PLAN_LIMITS[plan]

  return (
    <DashboardLayout>
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Información de tu sitio</CardTitle>
              <CardDescription>Detalles de tu subdominio y dominio personalizado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Tu subdominio</h3>
                  <p className="text-muted-foreground">
                    <a
                      href={`https://${userProfile.subdomain}.gastroo.online`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {userProfile.subdomain}.gastroo.online
                    </a>
                  </p>
                </div>

                {customDomain && (
                  <div>
                    <h3 className="font-medium mb-1">Tu dominio personalizado</h3>
                    <p className="text-muted-foreground">
                      <a
                        href={`https://${customDomain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {customDomain}
                      </a>
                    </p>
                  </div>
                )}

                <form onSubmit={handleAddCustomDomain} className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="customDomain">Agregar dominio personalizado</Label>
                    <Input
                      id="customDomain"
                      type="text"
                      placeholder="midominio.com"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Ingresa tu dominio sin http:// o https://</p>
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
                    {loading ? "Agregando..." : "Agregar dominio"}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tu Plan: {plan.charAt(0).toUpperCase() + plan.slice(1)}</CardTitle>
              <CardDescription>Límites y características de tu plan actual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Dominios personalizados</span>
                    <span className="text-sm font-medium">
                      {tenantData.domainCount || 0} / {planLimits.customDomains}
                    </span>
                  </div>
                  <Progress value={((tenantData.domainCount || 0) * 100) / planLimits.customDomains} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Almacenamiento</span>
                    <span className="text-sm font-medium">
                      {tenantData.storageUsed || 0} GB / {planLimits.storage} GB
                    </span>
                  </div>
                  <Progress value={((tenantData.storageUsed || 0) * 100) / planLimits.storage} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Usuarios</span>
                    <span className="text-sm font-medium">
                      {tenantData.userCount || 1} / {planLimits.users}
                    </span>
                  </div>
                  <Progress value={((tenantData.userCount || 1) * 100) / planLimits.users} />
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-2">Características incluidas:</h3>
                  <ul className="space-y-1">
                    {planLimits.features.map((feature, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button className="w-full" variant="outline">
                  Actualizar Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
