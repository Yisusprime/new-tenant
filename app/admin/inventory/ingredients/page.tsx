import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InventoryNavigation } from "@/components/inventory/inventory-navigation"

export default function IngredientsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Inventario</h1>
      <InventoryNavigation />

      <Card>
        <CardHeader>
          <CardTitle>Ingredientes</CardTitle>
          <CardDescription>Gestiona los ingredientes de tu inventario</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <div className="grid grid-cols-5 gap-4 p-4 border-b font-medium">
              <div>Nombre</div>
              <div>Categoría</div>
              <div>Stock</div>
              <div>Unidad</div>
              <div>Acciones</div>
            </div>
            <div className="grid grid-cols-5 gap-4 p-4 border-b">
              <div>Tomate</div>
              <div>Verduras</div>
              <div>2.5</div>
              <div>kg</div>
              <div>
                <button className="text-blue-500 mr-2">Editar</button>
                <button className="text-red-500">Eliminar</button>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-4 p-4 border-b">
              <div>Cebolla</div>
              <div>Verduras</div>
              <div>1.2</div>
              <div>kg</div>
              <div>
                <button className="text-blue-500 mr-2">Editar</button>
                <button className="text-red-500">Eliminar</button>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-4 p-4">
              <div>Queso Mozzarella</div>
              <div>Lácteos</div>
              <div>0.8</div>
              <div>kg</div>
              <div>
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
