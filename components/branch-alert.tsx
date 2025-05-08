"use client"

import { useBranch } from "@/lib/context/branch-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export function BranchAlert() {
  const { loading, hasBranches, hasActiveBranches } = useBranch()

  // No mostrar nada mientras está cargando
  if (loading) return null

  // Si hay sucursales activas, no mostrar alerta
  if (hasActiveBranches) return null

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Atención</AlertTitle>
      <AlertDescription className="flex flex-col gap-4">
        {!hasBranches ? (
          <>
            <p>No tienes ninguna sucursal creada. Debes crear al menos una sucursal para comenzar a usar el sistema.</p>
            <div>
              <Button asChild size="sm" variant="outline">
                <Link href="/admin/branches">Crear Sucursal</Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            <p>Tienes sucursales creadas, pero ninguna está activa. Debes activar al menos una sucursal.</p>
            <div>
              <Button asChild size="sm" variant="outline">
                <Link href="/admin/branches">Activar Sucursal</Link>
              </Button>
            </div>
          </>
        )}
      </AlertDescription>
    </Alert>
  )
}
