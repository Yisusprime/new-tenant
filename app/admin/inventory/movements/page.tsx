import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InventoryNavigation } from "@/components/inventory/inventory-navigation"

export default function MovementsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Inventario</h1>
      <InventoryNavigation />

      <Card>
        <CardHeader>
          <CardTitle>Movimientos de Inventario</CardTitle>
          <CardDescription>Registra consumos, desperdicios y ajustes de stock</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <div className="grid grid-cols-6 gap-4 p-4 border-b font-medium">
              <div>Fecha</div>
              <div>Tipo</div>
              <div>Ingrediente</div>
              <div>Cantidad</div>
              <div>Notas</div>
              <div>Acciones</div>
            </div>
            <div className="grid grid-cols-6 gap-4 p-4 border-b">
              <div>2023-05-15</div>
              <div>Entrada</div>
              <div>Harina</div>
              <div>10 kg</div>
              <div>Recepción OC-001</div>
              <div>
                <button className="text-blue-500 mr-2">Editar</button>
                <button className="text-red-500">Eliminar</button>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-4 p-4 border-b">
              <div>2023-05-14</div>
              <div>Consumo</div>
              <div>Tomate</div>
              <div>1.5 kg</div>
              <div>Producción del día</div>
              <div>
                <button className="text-blue-500 mr-2">Editar</button>
                <button className="text-red-500">Eliminar</button>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-4 p-4">
              <div>2023-05-13</div>
              <div>Ajuste</div>
              <div>Cebolla</div>
              <div>-0.5 kg</div>
              <div>Merma por mal estado</div>
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
