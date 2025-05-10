"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase/client"
import { getUserProfile } from "@/lib/services/profile-service"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileInfo } from "./components/profile-info"
import { OrderHistory } from "./components/order-history"
import { ProfileAddresses } from "./components/profile-addresses"
import { ProfilePreferences } from "./components/profile-preferences"
import { Button } from "@/components/ui/button"
import { Loader2, LogOut } from "lucide-react"
import { DesktopNavigation } from "../components/desktop-navigation"
import { MobileNavigation } from "../components/mobile-navigation"

export default function ProfilePage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        try {
          const userProfile = await getUserProfile(tenantId, currentUser.uid)
          setProfile(userProfile || { userId: currentUser.uid })
        } catch (error) {
          console.error("Error al cargar el perfil:", error)
        }
      } else {
        // Redirigir al login si no hay usuario autenticado
        router.push(`/tenant/${tenantId}/menu/login`)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [tenantId, router])

  const handleSignOut = async () => {
    try {
      await auth.signOut()
      router.push(`/tenant/${tenantId}/menu`)
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <DesktopNavigation />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <div className="md:hidden">
          <MobileNavigation />
        </div>
      </div>
    )
  }

  if (!user) {
    return null // El useEffect redirigirá al login
  }

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      <DesktopNavigation />

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Mi Perfil</h1>
          <Button variant="outline" size="sm" onClick={handleSignOut} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            <span>Cerrar Sesión</span>
          </Button>
        </div>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="addresses">Direcciones</TabsTrigger>
            <TabsTrigger value="preferences">Preferencias</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <ProfileInfo user={user} profile={profile} tenantId={tenantId} />
          </TabsContent>

          <TabsContent value="orders">
            <OrderHistory tenantId={tenantId} userId={user.uid} />
          </TabsContent>

          <TabsContent value="addresses">
            <ProfileAddresses tenantId={tenantId} userId={user.uid} />
          </TabsContent>

          <TabsContent value="preferences">
            <ProfilePreferences tenantId={tenantId} userId={user.uid} profile={profile} />
          </TabsContent>
        </Tabs>
      </div>

      <div className="md:hidden">
        <MobileNavigation />
      </div>
    </div>
  )
}
