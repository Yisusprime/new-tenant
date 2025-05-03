"use client"

import { useTenant } from "@/lib/context/tenant-context"
import { Button } from "@/components/ui/button"
import { TenantNav } from "@/components/layout/tenant-nav"
import Link from "next/link"

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

export default function TenantHomePage() {
  const { tenant, loading, error } = useTenant()

  if (loading) {
    return <div>Cargando...</div>
  }

  if (error || !tenant) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Tenant no encontrado</h1>
        <p className="text-muted-foreground mb-6">El tenant que estás buscando no existe o no está disponible.</p>
        <Button asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <TenantNav items={navItems} />
        </div>
      </header>
      <main className="flex-1">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">{tenant.name}</h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Bienvenido a nuestra plataforma. Explora nuestro menú y descubre nuestras deliciosas opciones.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/menu">Ver Menú</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/login">Iniciar sesión</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} {tenant.name}. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
