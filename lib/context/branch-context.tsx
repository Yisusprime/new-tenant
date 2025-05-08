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
  hasActiveBranches: boolean // Nueva propiedad para verificar si hay sucursales activas
  hasBranches: boolean // Nueva propiedad para verificar si hay sucursales creadas
}

const BranchContext = createContext<BranchContextType>({
  branches: [],
  currentBranch: null,
  setCurrentBranch: () => {},
  loading: true,
  error: null,
  hasActiveBranches: false,
  hasBranches: false,
})

export const useBranch = () => useContext(BranchContext)

export const BranchProvider = ({ children, tenantId }: { children: React.ReactNode; tenantId: string }) => {
  const [branches, setBranches] = useState<Branch[]>([])
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasActiveBranches, setHasActiveBranches] = useState(false)
  const [hasBranches, setHasBranches] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (!tenantId) {
      setLoading(false)
      return
    }

    const fetchBranches = async () => {
      try {
        setLoading(true)
        const branchesData = await getBranches(tenantId)

        // Establecer el array de sucursales
        setBranches(branchesData || [])

        // Verificar si hay sucursales creadas
        setHasBranches(branchesData.length > 0)

        // Verificar si hay sucursales activas
        const activeBranches = branchesData.filter((branch) => branch.isActive)
        setHasActiveBranches(activeBranches.length > 0)

        // Si hay sucursales activas, seleccionar una por defecto
        if (activeBranches.length > 0) {
          // Intentar recuperar la última sucursal seleccionada del localStorage
          const savedBranchId = localStorage.getItem(`${tenantId}_currentBranch`)

          // Verificar que la sucursal guardada esté activa
          const savedBranch = savedBranchId ? activeBranches.find((b) => b.id === savedBranchId) : null

          setCurrentBranch(savedBranch || activeBranches[0])
        } else {
          // Si no hay sucursales activas, establecer currentBranch como null
          setCurrentBranch(null)
        }

        setError(null)
      } catch (err) {
        console.error("Error al cargar sucursales:", err)
        setError("No se pudieron cargar las sucursales")
        setBranches([])
        setCurrentBranch(null)
        setHasActiveBranches(false)
        setHasBranches(false)
      } finally {
        setLoading(false)
      }
    }

    fetchBranches()
  }, [tenantId])

  const handleSetCurrentBranch = (branch: Branch) => {
    setCurrentBranch(branch)
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
        hasActiveBranches,
        hasBranches,
      }}
    >
      {children}
    </BranchContext.Provider>
  )
}
