"use client"

import { useEffect, useState } from "react"
import { useBranch } from "@/lib/context/branch-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export function BranchAlertModal() {
  const { loading, hasBranches, hasActiveBranches } = useBranch()
  const [open, setOpen] = useState(false)

  // Mostrar el modal solo cuando termine de cargar y se cumpla alguna condición
  useEffect(() => {
    if (!loading) {
      // Si no hay sucursales o no hay sucursales activas, mostrar el modal
      if (!hasBranches || !hasActiveBranches) {
        setOpen(true)
      }
    }
  }, [loading, hasBranches, hasActiveBranches])

  // No renderizar nada mientras está cargando
  if (loading) return null

  // Si hay sucursales activas, no mostrar el modal
  if (hasActiveBranches) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="h-5 w-5" />
            Atención
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            {!hasBranches
              ? "No tienes ninguna sucursal creada. Debes crear al menos una sucursal para comenzar a usar el sistema."
              : "Tienes sucursales creadas, pero ninguna está activa. Debes activar al menos una sucursal."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button asChild>
            <Link href="/admin/branches">{!hasBranches ? "Crear Sucursal" : "Activar Sucursal"}</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
