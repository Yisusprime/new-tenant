"use client"

import { useTenant } from "@/lib/context/tenant-context"
import { LoginForm } from "@/components/auth/login-form"
import { TenantNav } from "@/components/layout/tenant-nav"
import { notFound } from "next/navigation"

const navItems = [
  {
    title: "Inicio",
    href: "/",
  },
  {
    title: "Menú",
    href: "/menu",
  },
]

export default function TenantLoginPage() {
  const { tenant, loading, error } = useTenant()

  if (loading) {
    return <div>Cargando...</div>
  }

  if (error || !tenant) {
    return notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <TenantNav items={navItems} />
        </div>
      </header>
      <main className="flex-1 container py-10">
        <div className="mx-auto max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">{tenant.name} - Iniciar sesión</h1>
          <LoginForm redirectUrl="/admin/dashboard" tenantMode={true} tenantSubdomain={tenant.subdomain} />
        </div>
      </main>
    </div>
  )
}
