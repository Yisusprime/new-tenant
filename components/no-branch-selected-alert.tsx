"use client"

import { useBranch } from "@/lib/context/branch-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export function NoBranchSelectedAlert() {
  const { currentBranch, loading, hasActiveBranches } = useBranch()

  // No mostrar nada mientras está cargando
  if (loading) return null

  // Si hay una sucursal seleccionada, no mostrar alerta
  if (currentBranch) return null

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>No hay sucursal seleccionada</AlertTitle>
      <AlertDescription className="flex flex-col gap-4">
        {!hasActiveBranches ? (
          <>
            <p>
              No tienes ninguna sucursal activa. Debes crear y activar al menos una sucursal para configurar tu
              restaurante.
            </p>
            <div>
              <Button asChild size="sm" variant="outline">
                <Link href="/admin/branches">Gestionar Sucursales</Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            <p>
              Debes seleccionar una sucursal para configurar la información del restaurante. Por favor, selecciona una
              sucursal en el menú superior.
            </p>
          </>
        )}
      </AlertDescription>
    </Alert>
  )
}
