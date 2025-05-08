"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { getBranches, type Branch } from "@/lib/services/branch-service"
import { useAuth } from "@/lib/context/auth-context"

interface BranchContextType {
  branches: Branch[]
  currentBranch: Branch | null
  setCurrentBranch: (branch: Branch) => void
  loading: boolean
  error: string | null
}

const BranchContext = createContext<BranchContextType>({
  branches: [],
  currentBranch: null,
  setCurrentBranch: () => {},
  loading: true,
  error: null,
})

export const useBranch = () => useContext(BranchContext)

export const BranchProvider = ({ children, tenantId }: { children: React.ReactNode; tenantId: string }) => {
  const [branches, setBranches] = useState<Branch[]>([])
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!tenantId || !user) return

    const fetchBranches = async () => {
      try {
        setLoading(true)
        const branchesData = await getBranches(tenantId)
        setBranches(branchesData)

        // Si hay sucursales, seleccionar la primera por defecto
        if (branchesData.length > 0) {
          // Intentar recuperar la última sucursal seleccionada del localStorage
          const savedBranchId = localStorage.getItem(`${tenantId}_currentBranch`)
          const savedBranch = savedBranchId ? branchesData.find((b) => b.id === savedBranchId) : null

          setCurrentBranch(savedBranch || branchesData[0])
        }

        setError(null)
      } catch (err) {
        console.error("Error al cargar sucursales:", err)
        setError("No se pudieron cargar las sucursales")
      } finally {
        setLoading(false)
      }
    }

    fetchBranches()
  }, [tenantId, user])

  const handleSetCurrentBranch = (branch: Branch) => {
    setCurrentBranch(branch)
    // Guardar la selección en localStorage para persistencia
    localStorage.setItem(`${tenantId}_currentBranch`, branch.id)
  }

  return (
    <BranchContext.Provider
      value={{
        branches,
        currentBranch,
        setCurrentBranch: handleSetCurrentBranch,
        loading,
        error,
      }}
    >
      {children}
    </BranchContext.Provider>
  )
}
