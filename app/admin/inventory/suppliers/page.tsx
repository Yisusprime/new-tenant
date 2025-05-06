import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InventoryNavigation } from "@/components/inventory/inventory-navigation"

export default function SuppliersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Inventario</h1>
      <InventoryNavigation />

      <Card>
        <CardHeader>
          <CardTitle>Proveedores</CardTitle>
          <CardDescription>Gestiona los proveedores de tu restaurante</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <div className="grid grid-cols-5 gap-4 p-4 border-b font-medium">
              <div>Nombre</div>
              <div>Contacto</div>
              <div>Teléfono</div>
              <div>Email</div>
              <div>Acciones</div>
            </div>
            <div className="grid grid-cols-5 gap-4 p-4 border-b">
              <div>Distribuidora Alimentos S.A.</div>
              <div>Juan Pérez</div>
              <div>555-1234</div>
              <div>juan@distribuidora.com</div>
              <div>
                <button className="text-blue-500 mr-2">Editar</button>
                <button className="text-red-500">Eliminar</button>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-4 p-4 border-b">
              <div>Lácteos del Valle</div>
              <div>María Gómez</div>
              <div>555-5678</div>
              <div>maria@lacteos.com</div>
              <div>
                <button className="text-blue-500 mr-2">Editar</button>
                <button className="text-red-500">Eliminar</button>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-4 p-4">
              <div>Verduras Frescas</div>
              <div>Carlos Rodríguez</div>
              <div>555-9012</div>
              <div>carlos@verduras.com</div>
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
