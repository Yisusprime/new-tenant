"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function TenantsPage() {
  const [tenants, setTenants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTenants() {
      try {
        const tenantsRef = collection(db, "tenants")
        const snapshot = await getDocs(tenantsRef)
        const tenantsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setTenants(tenantsList)
      } catch (error) {
        console.error("Error fetching tenants:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTenants()
  }, [])

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Tenants Disponibles</h1>

      {loading ? (
        <p>Cargando tenants...</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenants.map((tenant) => (
            <Card key={tenant.id}>
              <CardHeader>
                <CardTitle>{tenant.name}</CardTitle>
                <CardDescription>Subdominio: {tenant.subdomain}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Creado: {new Date(tenant.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex flex-col gap-2">
                    <Link href={`/tenant/${tenant.subdomain}/dashboard`}>
                      <Button className="w-full">Acceder vía Ruta</Button>
                    </Link>
                    {window.location.hostname.includes("vercel.app") ? (
                      <Link href={`https://${tenant.subdomain}--${window.location.hostname}`} target="_blank">
                        <Button variant="outline" className="w-full">
                          Acceder vía Subdominio Vercel
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`https://${tenant.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`} target="_blank">
                        <Button variant="outline" className="w-full">
                          Acceder vía Subdominio
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
