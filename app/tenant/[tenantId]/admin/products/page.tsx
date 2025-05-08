"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useBranch } from "@/lib/context/branch-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function ProductsPage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { currentBranch } = useBranch()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Productos</h1>
      </div>

      {/* Añadir el componente de alerta */}

      {!currentBranch && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Debes seleccionar una sucursal para gestionar los productos</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lista de Productos</CardTitle>
          <CardDescription>
            {currentBranch
              ? `Productos de la sucursal: ${currentBranch.name}`
              : "Selecciona una sucursal para ver sus productos"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              La funcionalidad de productos está en desarrollo y estará disponible próximamente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
