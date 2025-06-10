"use client"

import { useState, useEffect } from "react"
import { useBranch } from "@/lib/context/branch-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MapPin, Store } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function BranchSelectorModal() {
  const { branches, currentBranch, setCurrentBranch, loading, hasActiveBranches } = useBranch()
  const [open, setOpen] = useState(false)

  // Mostrar el modal solo si:
  // 1. No hay una sucursal seleccionada
  // 2. Hay más de una sucursal activa
  // 3. No estamos en estado de carga
  useEffect(() => {
    if (!loading && hasActiveBranches && !currentBranch && branches.length > 1) {
      setOpen(true)
    } else if (!loading && hasActiveBranches && !currentBranch && branches.length === 1) {
      // Si solo hay una sucursal, seleccionarla automáticamente
      setCurrentBranch(branches[0])
    }
  }, [loading, hasActiveBranches, currentBranch, branches, setCurrentBranch])

  const handleSelectBranch = (branchId: string) => {
    const branch = branches.find((b) => b.id === branchId)
    if (branch) {
      setCurrentBranch(branch)
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Selecciona una sucursal</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {branches
            .filter((branch) => branch.isActive)
            .map((branch) => (
              <Card
                key={branch.id}
                className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                  currentBranch?.id === branch.id ? "border-primary" : ""
                }`}
                onClick={() => handleSelectBranch(branch.id)}
              >
                <CardContent className="flex items-center p-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                    <Store className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{branch.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {branch.address}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
        {branches.filter((branch) => branch.isActive).length > 0 && (
          <div className="flex justify-end">
            <Button onClick={() => setOpen(false)}>Cerrar</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
