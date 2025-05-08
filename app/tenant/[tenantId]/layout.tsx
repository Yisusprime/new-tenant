import type React from "react"
import { notFound } from "next/navigation"
import { getTenant } from "@/lib/services/tenant-service"
import { AuthProvider } from "@/lib/context/auth-context"

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { tenantId: string }
}) {
  const { tenantId } = params

  // Verificar que el tenant existe
  const tenant = await getTenant(tenantId)

  if (!tenant) {
    notFound()
  }

  return (
    <AuthProvider tenantId={tenantId}>
      <div className="min-h-screen flex flex-col">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="text-2xl font-bold">{tenant.name}</div>
            <nav className="flex gap-4">
              <a href={`/tenant/${tenantId}/login`} className="hover:underline">
                Iniciar Sesión
              </a>
              <a href={`/tenant/${tenantId}/register`} className="hover:underline">
                Registrarse
              </a>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="bg-gray-800 text-white py-4">
          <div className="container mx-auto px-4 text-center">
            &copy; {new Date().getFullYear()} {tenant.name} | Powered by Gastroo
          </div>
        </footer>
      </div>
    </AuthProvider>
  )
}
