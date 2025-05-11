"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MapPin, Store } from "lucide-react"

interface Branch {
  id: string
  name: string
  address: string
  isActive: boolean
}

interface BranchSelectorProps {
  branches: Branch[]
  onSelect: (branchId: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BranchSelector({ branches, onSelect, open, onOpenChange }: BranchSelectorProps) {
  const activeBranches = branches.filter((branch) => branch.isActive)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Selecciona una sucursal</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {activeBranches.map((branch) => (
            <div
              key={branch.id}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => onSelect(branch.id)}
            >
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                  <Store className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{branch.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {branch.address}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
