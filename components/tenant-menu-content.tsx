"use client"

import Link from "next/link"
import { useTenantData } from "./tenant-data-provider"

// Datos de ejemplo para el menú
const menuCategories = [
  {
    id: "entradas",
    name: "Entradas",
    items: [
      {
        id: "1",
        name: "Ensalada César",
        description: "Lechuga romana, crutones, parmesano y aderezo César",
        price: 8.99,
      },
      {
        id: "2",
        name: "Carpaccio de Res",
        description: "Finas láminas de res con aceite de oliva y parmesano",
        price: 12.99,
      },
      { id: "3", name: "Bruschetta", description: "Pan tostado con tomate, ajo y albahaca", price: 6.99 },
    ],
  },
  {
    id: "principales",
    name: "Platos Principales",
    items: [
      {
        id: "4",
        name: "Pasta Carbonara",
        description: "Espagueti con salsa cremosa, panceta y queso parmesano",
        price: 14.99,
      },
      {
        id: "5",
        name: "Filete de Salmón",
        description: "Salmón a la parrilla con salsa de limón y hierbas",
        price: 18.99,
      },
      {
        id: "6",
        name: "Risotto de Hongos",
        description: "Arroz cremoso con variedad de hongos y parmesano",
        price: 15.99,
      },
    ],
  },
  {
    id: "postres",
    name: "Postres",
    items: [
      { id: "7", name: "Tiramisú", description: "Postre italiano con café, mascarpone y cacao", price: 7.99 },
      { id: "8", name: "Cheesecake", description: "Tarta de queso con salsa de frutos rojos", price: 6.99 },
      { id: "9", name: "Helado Artesanal", description: "Tres bolas de helado a elección", price: 5.99 },
    ],
  },
]

export default function TenantMenuContent({ tenant }: { tenant: string }) {
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

      <main className="flex-1 py-10">
        <div className="container mx-auto px-4">
          <h1 className="mb-10 text-center text-3xl font-bold">Nuestro Menú</h1>

          <div className="mb-8 flex justify-center space-x-4">
            {menuCategories.map((category) => (
              <a
                key={category.id}
                href={`#${category.id}`}
                className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200"
              >
                {category.name}
              </a>
            ))}
          </div>

          <div className="space-y-16">
            {menuCategories.map((category) => (
              <section key={category.id} id={category.id} className="scroll-mt-20">
                <h2 className="mb-6 text-2xl font-bold">{category.name}</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {category.items.map((item) => (
                    <div key={item.id} className="rounded-lg border bg-white p-6 shadow-sm">
                      <div className="flex justify-between">
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                        <span className="font-bold">${item.price.toFixed(2)}</span>
                      </div>
                      <p className="mt-2 text-gray-600">{item.description}</p>
                      <button className="mt-4 rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800">
                        Añadir al pedido
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2023 {tenantData.name}. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
