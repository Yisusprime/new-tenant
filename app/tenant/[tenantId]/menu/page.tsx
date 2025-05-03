import Link from "next/link"
import { Button } from "@/components/ui/button"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import TenantPublicNavbar from "@/components/tenant-public-navbar"

// Función para obtener los datos del tenant
async function getTenantData(tenantId: string) {
  try {
    const tenantDoc = await getDoc(doc(db, "tenants", tenantId))
    if (tenantDoc.exists()) {
      return {
        id: tenantDoc.id,
        ...tenantDoc.data(),
      }
    }
    return null
  } catch (error) {
    console.error("Error fetching tenant data:", error)
    return null
  }
}

// Función para obtener los elementos del menú (simulado por ahora)
async function getMenuItems(tenantId: string) {
  // Aquí podrías obtener los elementos del menú desde Firebase
  // Por ahora, retornamos datos de ejemplo
  return [
    {
      id: "1",
      name: "Hamburguesa Clásica",
      description: "Carne de res, lechuga, tomate, cebolla y queso",
      price: 8.99,
      category: "Hamburguesas",
      image: "/placeholder.svg?key=13p7h",
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
      image: "/vibrant-mixed-salad.png",
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
}

export default async function TenantMenuPage({ params }: { params: { tenantId: string } }) {
  const tenantId = params.tenantId
  const tenantData = await getTenantData(tenantId)
  const menuItems = await getMenuItems(tenantId)

  if (!tenantData) {
    return (
      <div className="flex flex-col min-h-screen">
        <TenantPublicNavbar tenantId={tenantId} tenantName="Restaurante" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Restaurante no encontrado</h1>
            <p className="mt-2 text-muted-foreground">No pudimos encontrar información para este restaurante.</p>
          </div>
        </main>
      </div>
    )
  }

  const tenantName = tenantData.name || "Restaurante"
  const logoUrl = tenantData.logoUrl || "/restaurant-logo.png"

  // Agrupar elementos del menú por categoría
  const menuByCategory: Record<string, typeof menuItems> = {}
  menuItems.forEach((item) => {
    if (!menuByCategory[item.category]) {
      menuByCategory[item.category] = []
    }
    menuByCategory[item.category].push(item)
  })

  return (
    <div className="flex flex-col min-h-screen">
      <TenantPublicNavbar tenantId={tenantId} tenantName={tenantName} logoUrl={logoUrl} />

      <main className="flex-1 py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-10">Nuestro Menú</h1>

          {/* Navegación de categorías */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {Object.keys(menuByCategory).map((category) => (
              <a
                key={category}
                href={`#${category}`}
                className="px-4 py-2 bg-muted rounded-full text-sm font-medium hover:bg-primary hover:text-white transition-colors"
              >
                {category}
              </a>
            ))}
          </div>

          {/* Elementos del menú por categoría */}
          {Object.entries(menuByCategory).map(([category, items]) => (
            <div key={category} id={category} className="mb-16">
              <h2 className="text-2xl font-bold mb-6 pb-2 border-b">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <div key={item.id} className="bg-card rounded-lg overflow-hidden shadow-sm">
                    <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-48 object-cover" />
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold">{item.name}</h3>
                        <span className="font-bold text-primary">${item.price.toFixed(2)}</span>
                      </div>
                      <p className="text-muted-foreground text-sm mb-4">{item.description}</p>
                      <Button size="sm" className="w-full">
                        Añadir al carrito
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2024 {tenantName}. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <Link href={`/tenant/${tenantId}/terms`} className="text-sm text-muted-foreground hover:underline">
              Términos
            </Link>
            <Link href={`/tenant/${tenantId}/privacy`} className="text-sm text-muted-foreground hover:underline">
              Privacidad
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
