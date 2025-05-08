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

  // Modificar el useEffect para manejar mejor los estados y errores

  useEffect(() => {
    if (!tenantId) {
      setLoading(false)
      return
    }

    const fetchBranches = async () => {
      try {
        setLoading(true)
        const branchesData = await getBranches(tenantId)

        // Siempre establecer el array de sucursales, incluso si está vacío
        setBranches(branchesData || [])

        // Si hay sucursales, seleccionar una por defecto
        if (branchesData && branchesData.length > 0) {
          // Intentar recuperar la última sucursal seleccionada del localStorage
          const savedBranchId = localStorage.getItem(`${tenantId}_currentBranch`)
          const savedBranch = savedBranchId ? branchesData.find((b) => b.id === savedBranchId) : null

          setCurrentBranch(savedBranch || branchesData[0])
        } else {
          // Si no hay sucursales, establecer currentBranch como null
          setCurrentBranch(null)
        }

        setError(null)
      } catch (err) {
        console.error("Error al cargar sucursales:", err)
        setError("No se pudieron cargar las sucursales")
        // Establecer arrays vacíos para evitar undefined
        setBranches([])
        setCurrentBranch(null)
      } finally {
        // Siempre establecer loading a false al finalizar
        setLoading(false)
      }
    }

    fetchBranches()
  }, [tenantId])

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
