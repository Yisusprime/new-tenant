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

export default function AdminDomainsPage() {
  const [domains, setDomains] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    fetchDomains()
  }, [user, router])

  async function fetchDomains() {
    setLoading(true)
    try {
      const domainsRef = collection(db, "domains")
      const snapshot = await getDocs(domainsRef)

      // Obtener datos de dominios
      const domainsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        domain: doc.id,
        ...doc.data(),
      }))

      // Obtener información de tenants para cada dominio
      const tenantsRef = collection(db, "tenants")
      const tenantIds = [...new Set(domainsList.map((domain) => domain.tenantId))]

      const tenantData: Record<string, any> = {}

      for (const tenantId of tenantIds) {
        if (tenantId) {
          const tenantDoc = await doc(tenantsRef, tenantId).get()
          if (tenantDoc.exists()) {
            tenantData[tenantId] = tenantDoc.data()
          }
        }
      }

      // Combinar datos de dominios con información de tenants
      const domainsWithTenantInfo = domainsList.map((domain) => ({
        ...domain,
        tenantName: domain.tenantId ? tenantData[domain.tenantId]?.name || "Desconocido" : "N/A",
        tenantSubdomain: domain.tenantId ? tenantData[domain.tenantId]?.subdomain || "Desconocido" : "N/A",
      }))

      setDomains(domainsWithTenantInfo)
    } catch (error: any) {
      console.error("Error fetching domains:", error)
      setError(error.message || "Error al cargar los dominios")
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteDomain(domainName: string) {
    if (!confirm("¿Estás seguro de que deseas eliminar este dominio? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      // Eliminar el dominio
      await deleteDoc(doc(db, "domains", domainName))

      // Actualizar la lista de dominios
      setDomains((prevDomains) => prevDomains.filter((domain) => domain.domain !== domainName))
    } catch (error: any) {
      console.error("Error deleting domain:", error)
      setError(error.message || "Error al eliminar el dominio")
    }
  }

  async function handleVerifyDomain(domainName: string) {
    try {
      // Simular verificación de dominio
      await updateDoc(doc(db, "domains", domainName), {
        verified: true,
        verifiedAt: new Date().toISOString(),
      })

      // Actualizar la lista de dominios
      setDomains((prevDomains) =>
        prevDomains.map((domain) =>
          domain.domain === domainName ? { ...domain, verified: true, verifiedAt: new Date().toISOString() } : domain,
        ),
      )
    } catch (error: any) {
      console.error("Error verifying domain:", error)
      setError(error.message || "Error al verificar el dominio")
    }
  }

  return (
    <DashboardLayout>
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">Administración de Dominios</h1>

        {error && <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Dominios Personalizados</CardTitle>
            <CardDescription>Gestiona los dominios personalizados de tu plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Cargando dominios...</div>
            ) : domains.length === 0 ? (
              <div className="text-center py-4">No hay dominios personalizados registrados</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dominio</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Subdominio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Verificado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {domains.map((domain) => (
                    <TableRow key={domain.domain}>
                      <TableCell className="font-medium">
                        <a
                          href={`https://${domain.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {domain.domain}
                        </a>
                      </TableCell>
                      <TableCell>{domain.tenantName}</TableCell>
                      <TableCell>
                        <a
                          href={`https://${domain.tenantSubdomain}.gastroo.online`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {domain.tenantSubdomain}.gastroo.online
                        </a>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            domain.active !== false ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {domain.active !== false ? "Activo" : "Inactivo"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            domain.verified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {domain.verified ? "Verificado" : "Pendiente"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {!domain.verified && (
                            <Button variant="outline" size="sm" onClick={() => handleVerifyDomain(domain.domain)}>
                              Verificar
                            </Button>
                          )}
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteDomain(domain.domain)}>
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
            <Button onClick={fetchDomains} variant="outline">
              Actualizar Lista
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  )
}
