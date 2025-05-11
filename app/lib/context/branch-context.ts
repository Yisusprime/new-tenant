"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useParams } from "next/navigation"

// Definir el tipo para una sucursal
interface Branch {
  id: string
  name: string
  address?: string
  isActive: boolean
}

// Definir el tipo para el contexto
interface BranchContextType {
  branches: Branch[]
  currentBranch: Branch | null
  loading: boolean
  error: string | null
  selectBranch: (branchId: string) => void
  hasActiveBranches: boolean
}

// Crear el contexto
const BranchContext = createContext<BranchContextType | undefined>(undefined)

// Proveedor del contexto
export function BranchProvider({ children }: { children: ReactNode }) {
  const params = useParams()
  const tenantId = params.tenantId as string

  const [branches, setBranches] = useState<Branch[]>([])
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar las sucursales al iniciar
  useEffect(() => {
    async function loadBranches() {
      if (!tenantId) return

      setLoading(true)
      try {
        // Aquí iría la lógica para cargar las sucursales desde Firebase
        // Por ahora, usamos datos de ejemplo
        const mockBranches: Branch[] = [
          { id: "branch1", name: "Sucursal Principal", isActive: true },
          { id: "branch2", name: "Sucursal Norte", isActive: true },
          { id: "branch3", name: "Sucursal Sur", isActive: false },
        ]

        setBranches(mockBranches)

        // Intentar cargar la sucursal seleccionada del localStorage
        const savedBranchId = localStorage.getItem(`${tenantId}_selectedBranch`)
        if (savedBranchId) {
          const savedBranch = mockBranches.find((b) => b.id === savedBranchId && b.isActive)
          if (savedBranch) {
            setCurrentBranch(savedBranch)
          } else if (mockBranches.some((b) => b.isActive)) {
            // Si no se encuentra la sucursal guardada, seleccionar la primera activa
            setCurrentBranch(mockBranches.find((b) => b.isActive) || null)
          }
        } else if (mockBranches.some((b) => b.isActive)) {
          // Si no hay sucursal guardada, seleccionar la primera activa
          setCurrentBranch(mockBranches.find((b) => b.isActive) || null)
        }

        setError(null)
      } catch (err) {
        console.error("Error al cargar sucursales:", err)
        setError("Error al cargar las sucursales")
      } finally {
        setLoading(false)
      }
    }

    loadBranches()
  }, [tenantId])

  // Función para seleccionar una sucursal
  const selectBranch = (branchId: string) => {
    const branch = branches.find((b) => b.id === branchId)
    if (branch && branch.isActive) {
      setCurrentBranch(branch)
      // Guardar la selección en localStorage
      if (tenantId) {
        localStorage.setItem(`${tenantId}_selectedBranch`, branchId)
      }
    }
  }

  // Verificar si hay sucursales activas
  const hasActiveBranches = branches.some((b) => b.isActive)

  return (
    <BranchContext.Provider
      value={{
        branches,
        currentBranch,
        loading,
        error,
        selectBranch,
        hasActiveBranches,
      }}
    >
      {children}
    </BranchContext.Provider>
  )
}

// Hook para usar el contexto
export function useBranch() {
  const context = useContext(BranchContext)
  if (context === undefined) {
    throw new Error("useBranch debe ser usado dentro de un BranchProvider")
  }
  return context
}
