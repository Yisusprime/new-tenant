import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InventoryNavigation } from "@/components/inventory/inventory-navigation"

export default function RecipesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Inventario</h1>
      <InventoryNavigation />

      <Card>
        <CardHeader>
          <CardTitle>Recetas</CardTitle>
          <CardDescription>Gestiona las recetas y su relación con los ingredientes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <div className="grid grid-cols-4 gap-4 p-4 border-b font-medium">
              <div>Nombre</div>
              <div>Categoría</div>
              <div>Ingredientes</div>
              <div>Acciones</div>
            </div>
            <div className="grid grid-cols-4 gap-4 p-4 border-b">
              <div>Pizza Margarita</div>
              <div>Pizzas</div>
              <div>5</div>
              <div>
                <button className="text-blue-500 mr-2">Ver</button>
                <button className="text-blue-500 mr-2">Editar</button>
                <button className="text-red-500">Eliminar</button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 p-4 border-b">
              <div>Pasta Carbonara</div>
              <div>Pastas</div>
              <div>6</div>
              <div>
                <button className="text-blue-500 mr-2">Ver</button>
                <button className="text-blue-500 mr-2">Editar</button>
                <button className="text-red-500">Eliminar</button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 p-4">
              <div>Ensalada César</div>
              <div>Ensaladas</div>
              <div>7</div>
              <div>
                <button className="text-blue-500 mr-2">Ver</button>
                <button className="text-blue-500 mr-2">Editar</button>
                <button className="text-red-500">Eliminar</button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
