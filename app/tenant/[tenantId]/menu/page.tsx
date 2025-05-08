import { getTenantById } from "@/services/tenant-service"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Datos de ejemplo para el menú
const menuCategories = [
  {
    id: "entradas",
    name: "Entradas",
    items: [
      {
        id: 1,
        name: "Ensalada César",
        description: "Lechuga romana, crutones, queso parmesano y aderezo César",
        price: 8.99,
      },
      {
        id: 2,
        name: "Carpaccio de res",
        description: "Finas láminas de res con aceite de oliva, limón y parmesano",
        price: 12.99,
      },
      { id: 3, name: "Sopa del día", description: "Pregunta por nuestra sopa especial del día", price: 6.99 },
    ],
  },
  {
    id: "principales",
    name: "Platos principales",
    items: [
      {
        id: 4,
        name: "Pasta Carbonara",
        description: "Espagueti con salsa cremosa, panceta y queso parmesano",
        price: 14.99,
      },
      {
        id: 5,
        name: "Filete de salmón",
        description: "Salmón a la parrilla con puré de papas y vegetales",
        price: 18.99,
      },
      {
        id: 6,
        name: "Risotto de hongos",
        description: "Arroz cremoso con variedad de hongos y queso parmesano",
        price: 15.99,
      },
    ],
  },
  {
    id: "postres",
    name: "Postres",
    items: [
      { id: 7, name: "Tiramisú", description: "Postre italiano con café, mascarpone y cacao", price: 7.99 },
      { id: 8, name: "Cheesecake", description: "Tarta de queso con salsa de frutos rojos", price: 6.99 },
      { id: 9, name: "Helado artesanal", description: "Tres bolas de helado a elección", price: 5.99 },
    ],
  },
  {
    id: "bebidas",
    name: "Bebidas",
    items: [
      { id: 10, name: "Agua mineral", description: "Con o sin gas", price: 2.99 },
      { id: 11, name: "Refresco", description: "Coca-Cola, Sprite, Fanta", price: 3.99 },
      { id: 12, name: "Café", description: "Espresso, americano, cappuccino", price: 3.49 },
    ],
  },
]

export default async function MenuPage({ params }: { params: { tenantId: string } }) {
  const tenant = await getTenantById(params.tenantId)

  if (!tenant) {
    return null // Esto será manejado por el layout
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Nuestro Menú</h1>

      <Tabs defaultValue={menuCategories[0].id} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
          {menuCategories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {menuCategories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">{category.name}</h2>

            <div className="grid gap-4">
              {category.items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      </div>
                      <div className="font-semibold">${item.price.toFixed(2)}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
