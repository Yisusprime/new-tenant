import type React from "react"
import { redirect } from "next/navigation"

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { tenantId: string }
}) {
  const tenantId = params.tenantId

  // Si no hay tenantId, redirigir a home
  if (!tenantId) {
    redirect("/")
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* No renderizamos el TenantNavbar aquí para evitar duplicación */}
      <main className="flex-1">{children}</main>
    </div>
  )
}
