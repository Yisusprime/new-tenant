import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InventoryNavigation } from "@/components/inventory/inventory-navigation"

export default function PurchasesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Inventario</h1>
      <InventoryNavigation />

      <Card>
        <CardHeader>
          <CardTitle>Compras</CardTitle>
          <CardDescription>Gestiona las órdenes de compra y recepciones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <div className="grid grid-cols-6 gap-4 p-4 border-b font-medium">
              <div>Número</div>
              <div>Fecha</div>
              <div>Proveedor</div>
              <div>Total</div>
              <div>Estado</div>
              <div>Acciones</div>
            </div>
            <div className="grid grid-cols-6 gap-4 p-4 border-b">
              <div>OC-001</div>
              <div>2023-05-15</div>
              <div>Distribuidora Alimentos S.A.</div>
              <div>$350.00</div>
              <div>Recibida</div>
              <div>
                <button className="text-blue-500 mr-2">Ver</button>
                <button className="text-red-500">Eliminar</button>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-4 p-4 border-b">
              <div>OC-002</div>
              <div>2023-05-16</div>
              <div>Lácteos del Valle</div>
              <div>$180.00</div>
              <div>Pendiente</div>
              <div>
                <button className="text-blue-500 mr-2">Ver</button>
                <button className="text-green-500 mr-2">Recibir</button>
                <button className="text-red-500">Eliminar</button>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-4 p-4">
              <div>OC-003</div>
              <div>2023-05-17</div>
              <div>Verduras Frescas</div>
              <div>$120.00</div>
              <div>Pendiente</div>
              <div>
                <button className="text-blue-500 mr-2">Ver</button>
                <button className="text-green-500 mr-2">Recibir</button>
                <button className="text-red-500">Eliminar</button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
