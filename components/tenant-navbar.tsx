"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

export default function TenantNavbar({ tenantId }: { tenantId: string }) {
  const [tenantName, setTenantName] = useState("")
  const { user, signOut } = useAuth()

  useEffect(() => {
    async function fetchTenantData() {
      try {
        const tenantDoc = await getDoc(doc(db, "tenants", tenantId))
        if (tenantDoc.exists()) {
          setTenantName(tenantDoc.data().name)
        }
      } catch (error) {
        console.error("Error fetching tenant data:", error)
      }
    }

    fetchTenantData()
  }, [tenantId])

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl">
            {tenantName || "Tenant"}
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/dashboard" className="text-sm font-medium hover:underline">
              Dashboard
            </Link>
            <Link href="/settings" className="text-sm font-medium hover:underline">
              Configuración
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              Cerrar sesión
            </Button>
          ) : (
            <Link href="/login">
              <Button size="sm">Iniciar sesión</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
