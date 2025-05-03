"use client"

import { useTenantContext } from "@/contexts/tenant-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function TenantLayout() {
  const { tenant, isLoading } = useTenantContext()

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>
  }

  if (!tenant) {
    return <div className="flex items-center justify-center min-h-screen">Tenant no encontrado</div>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header
        className="sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/60"
        style={{ backgroundColor: tenant.primaryColor || "#ffffff" }}
      >
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            {tenant.logo ? (
              <img src={tenant.logo || "/placeholder.svg"} alt={tenant.name} className="h-8 w-auto" />
            ) : (
              <span className="text-xl">{tenant.name}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Iniciar sesión
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Bienvenido a {tenant.name}
              </h1>
              <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Este es tu espacio personalizado en Gastroo
              </p>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Características disponibles
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {tenant.features.map((feature, index) => (
                  <div key={index} className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} {tenant.name} - Powered by Gastroo
          </p>
        </div>
      </footer>
    </div>
  )
}
