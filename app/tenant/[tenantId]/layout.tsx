import type React from "react"
import { notFound } from "next/navigation"
import { getTenantById } from "@/services/tenant-service"

export async function generateMetadata({ params }: { params: { tenantId: string } }) {
  const tenant = await getTenantById(params.tenantId)

  if (!tenant) {
    return {
      title: "Tenant no encontrado",
    }
  }

  return {
    title: `${tenant.name} - Gastroo`,
    description: `Sitio web de ${tenant.name}`,
  }
}

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { tenantId: string }
}) {
  const tenant = await getTenantById(params.tenantId)

  if (!tenant || tenant.status !== "active") {
    notFound()
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <div className="text-2xl font-bold">{tenant.name}</div>
          <nav className="flex gap-4">
            <a href="/menu" className="hover:underline">
              Menú
            </a>
            <a href="/login" className="hover:underline">
              Iniciar sesión
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center">
          <p>
            © {new Date().getFullYear()} {tenant.name}. Powered by Gastroo.
          </p>
        </div>
      </footer>
    </div>
  )
}
