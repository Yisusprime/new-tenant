"use client"

import { useTenant } from "@/lib/context/tenant-context"
import { TenantNav } from "@/components/layout/tenant-nav"
import { notFound } from "next/navigation"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

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

// Datos de ejemplo para el menú
const menuItems = [
  {
    id: "1",
    name: "Hamburguesa Clásica",
    description: "Carne de res, lechuga, tomate, cebolla y queso",
    price: 8.99,
    category: "Hamburguesas",
    image: "/classic-beef-burger.png",
  },
  {
    id: "2",
    name: "Pizza Margarita",
    description: "Salsa de tomate, mozzarella y albahaca",
    price: 10.99,
    category: "Pizzas",
    image: "/delicious-pizza.png",
  },
  {
    id: "3",
    name: "Ensalada César",
    description: "Lechuga romana, crutones, queso parmesano y aderezo césar",
    price: 7.99,
    category: "Ensaladas",
    image: "/vibrant-salad-bowl.png",
  },
  {
    id: "4",
    name: "Pasta Carbonara",
    description: "Espagueti con salsa carbonara, panceta y queso parmesano",
    price: 12.99,
    category: "Pastas",
    image: "/colorful-pasta-arrangement.png",
  },
  {
    id: "5",
    name: "Taco de Pollo",
    description: "Tortilla de maíz, pollo, cebolla, cilantro y salsa",
    price: 6.99,
    category: "Tacos",
    image: "/delicious-taco.png",
  },
  {
    id: "6",
    name: "Sushi Roll California",
    description: "Arroz, alga nori, aguacate, pepino y cangrejo",
    price: 9.99,
    category: "Sushi",
    image: "/assorted-sushi-platter.png",
  },
]

// Agrupar los elementos del menú por categoría
const groupedMenu = menuItems.reduce(
  (acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  },
  {} as Record<string, typeof menuItems>,
)

export default function TenantMenuPage() {
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
        <h1 className="text-3xl font-bold mb-6">Menú - {tenant.name}</h1>

        {Object.entries(groupedMenu).map(([category, items]) => (
          <div key={category} className="mb-10">
            <h2 className="text-2xl font-bold mb-4">{category}</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div>
                        <CardTitle>{item.name}</CardTitle>
                        <CardDescription>{item.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardFooter className="flex justify-between">
                    <span className="text-lg font-bold">${item.price.toFixed(2)}</span>
                    <Button>Ordenar</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        ))}
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
