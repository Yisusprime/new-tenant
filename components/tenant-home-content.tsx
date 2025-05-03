"use client"

import Link from "next/link"
import { useTenantData } from "./tenant-data-provider"

export default function TenantHomeContent({ tenant }: { tenant: string }) {
  const { tenantData, loading, error } = useTenantData()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-2">Cargando información del restaurante...</p>
          <div className="h-1 w-32 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full w-1/2 animate-[pulse_1s_ease-in-out_infinite] rounded-full bg-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !tenantData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="mb-6 text-4xl font-bold">Tenant no encontrado</h1>
        <p className="mb-4">El tenant {tenant} no existe o no está disponible.</p>
        <Link href="/" className="text-blue-600 hover:underline">
          Volver al inicio
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b w-full bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href={`/${tenant}`} className="font-bold text-xl">
              {tenantData.name}
            </Link>
          </div>

          {/* Menú para pantallas medianas y grandes */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href={`/${tenant}`} className="text-sm font-medium hover:text-primary hover:underline">
              Inicio
            </Link>
            <Link href={`/${tenant}/menu`} className="text-sm font-medium hover:text-primary hover:underline">
              Menú
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href={`/${tenant}/login`}>
              <button className="text-sm font-medium hover:text-primary">Iniciar sesión</button>
            </Link>
            <Link href={`/${tenant}/registro`}>
              <button className="rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
                Registrarse
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 text-center">
          <div className="container mx-auto px-4">
            <h1 className="mb-6 text-4xl font-bold md:text-5xl">Bienvenido a {tenantData.name}</h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
              Descubre nuestra deliciosa selección de platos preparados con los mejores ingredientes.
            </p>
            <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <Link href={`/${tenant}/menu`} className="rounded bg-black px-6 py-3 text-white hover:bg-gray-800">
                Ver Menú →
              </Link>
              <Link href={`/${tenant}/login`} className="rounded border border-gray-300 px-6 py-3 hover:bg-gray-50">
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">Nuestras Especialidades</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-3 text-xl font-semibold">Platos Gourmet</h3>
                <p className="text-gray-600">
                  Disfruta de nuestros platos gourmet preparados por chefs profesionales con ingredientes de primera
                  calidad.
                </p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-3 text-xl font-semibold">Servicio Rápido</h3>
                <p className="text-gray-600">
                  Entrega rápida y eficiente para que disfrutes de tu comida en el momento perfecto.
                </p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-3 text-xl font-semibold">Opciones Saludables</h3>
                <p className="text-gray-600">
                  Variedad de opciones saludables para todos los gustos y necesidades dietéticas.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2023 {tenantData.name}. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
