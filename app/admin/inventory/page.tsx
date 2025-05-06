import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InventoryNavigation } from "@/components/inventory/inventory-navigation"

export default function InventoryPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Inventario</h1>
      <InventoryNavigation />

      <Card>
        <CardHeader>
          <CardTitle>Dashboard de Inventario</CardTitle>
          <CardDescription>Resumen y estadísticas de tu inventario</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total de Ingredientes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">24</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Valor del Inventario</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">$1,245.00</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Ingredientes Bajos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">3</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Ingredientes con Stock Bajo</h3>
            <div className="border rounded-md">
              <div className="grid grid-cols-4 gap-4 p-4 border-b font-medium">
                <div>Ingrediente</div>
                <div>Stock Actual</div>
                <div>Stock Mínimo</div>
                <div>Unidad</div>
              </div>
              <div className="grid grid-cols-4 gap-4 p-4 border-b">
                <div>Tomate</div>
                <div>2.5</div>
                <div>5</div>
                <div>kg</div>
              </div>
              <div className="grid grid-cols-4 gap-4 p-4 border-b">
                <div>Cebolla</div>
                <div>1.2</div>
                <div>3</div>
                <div>kg</div>
              </div>
              <div className="grid grid-cols-4 gap-4 p-4">
                <div>Queso Mozzarella</div>
                <div>0.8</div>
                <div>2</div>
                <div>kg</div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Últimos Movimientos</h3>
            <div className="border rounded-md">
              <div className="grid grid-cols-4 gap-4 p-4 border-b font-medium">
                <div>Fecha</div>
                <div>Tipo</div>
                <div>Ingrediente</div>
                <div>Cantidad</div>
              </div>
              <div className="grid grid-cols-4 gap-4 p-4 border-b">
                <div>2023-05-15</div>
                <div>Entrada</div>
                <div>Harina</div>
                <div>10 kg</div>
              </div>
              <div className="grid grid-cols-4 gap-4 p-4 border-b">
                <div>2023-05-14</div>
                <div>Consumo</div>
                <div>Tomate</div>
                <div>1.5 kg</div>
              </div>
              <div className="grid grid-cols-4 gap-4 p-4">
                <div>2023-05-13</div>
                <div>Ajuste</div>
                <div>Cebolla</div>
                <div>-0.5 kg</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
