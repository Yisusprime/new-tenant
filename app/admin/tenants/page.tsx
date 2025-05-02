"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    fetchTenants()
  }, [user, router])

  async function fetchTenants() {
    setLoading(true)
    try {
      const tenantsRef = collection(db, "tenants")
      const snapshot = await getDocs(tenantsRef)
      const tenantsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setTenants(tenantsList)
    } catch (error: any) {
      console.error("Error fetching tenants:", error)
      setError(error.message || "Error al cargar los tenants")
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteTenant(tenantId: string) {
    if (!confirm("¿Estás seguro de que deseas eliminar este tenant? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      // Eliminar el tenant
      await deleteDoc(doc(db, "tenants", tenantId))

      // Actualizar la lista de tenants
      setTenants((prevTenants) => prevTenants.filter((tenant) => tenant.id !== tenantId))
    } catch (error: any) {
      console.error("Error deleting tenant:", error)
      setError(error.message || "Error al eliminar el tenant")
    }
  }

  async function handleToggleActive(tenantId: string, currentStatus: boolean) {
    try {
      // Actualizar el estado activo del tenant
      await updateDoc(doc(db, "tenants", tenantId), {
        active: !currentStatus,
      })

      // Actualizar la lista de tenants
      setTenants((prevTenants) =>
        prevTenants.map((tenant) => (tenant.id === tenantId ? { ...tenant, active: !currentStatus } : tenant)),
      )
    } catch (error: any) {
      console.error("Error updating tenant:", error)
      setError(error.message || "Error al actualizar el tenant")
    }
  }

  return (
    <DashboardLayout>
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">Administración de Tenants</h1>

        {error && <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Tenants Registrados</CardTitle>
            <CardDescription>Gestiona los tenants de tu plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Cargando tenants...</div>
            ) : tenants.length === 0 ? (
              <div className="text-center py-4">No hay tenants registrados</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Subdominio</TableHead>
                    <TableHead>Dominio Personalizado</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Creado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">{tenant.name}</TableCell>
                      <TableCell>
                        <a
                          href={`https://${tenant.subdomain}.gastroo.online`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {tenant.subdomain}.gastroo.online
                        </a>
                      </TableCell>
                      <TableCell>
                        {tenant.customDomain ? (
                          <a
                            href={`https://${tenant.customDomain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {tenant.customDomain}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">No configurado</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            tenant.active !== false ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {tenant.active !== false ? "Activo" : "Inactivo"}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(tenant.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(tenant.id, tenant.active !== false)}
                          >
                            {tenant.active !== false ? "Desactivar" : "Activar"}
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteTenant(tenant.id)}>
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={fetchTenants} variant="outline">
              Actualizar Lista
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  )
}
