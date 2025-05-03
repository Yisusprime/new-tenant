"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import DashboardLayout from "@/components/dashboard-layout"

export default function SuperAdminDashboard() {
  const [tenants, setTenants] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user, userProfile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (userProfile && userProfile.role !== "superadmin") {
      router.push("/unauthorized")
      return
    }

    async function fetchData() {
      try {
        // Obtener tenants
        const tenantsRef = collection(db, "tenants")
        const tenantsSnapshot = await getDocs(tenantsRef)
        const tenantsList = tenantsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setTenants(tenantsList)

        // Obtener usuarios
        const usersRef = collection(db, "users")
        const usersSnapshot = await getDocs(usersRef)
        const usersList = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setUsers(usersList)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, userProfile, router])

  return (
    <DashboardLayout>
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">Dashboard de SuperAdmin</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Tenants</CardTitle>
              <CardDescription>Total de tenants registrados</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{loading ? "..." : tenants.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usuarios</CardTitle>
              <CardDescription>Total de usuarios registrados</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{loading ? "..." : users.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sistema</CardTitle>
              <CardDescription>Estado del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-500">Activo</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
