"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ref, push, get, update } from "firebase/database"
import { rtdb } from "@/lib/firebase-config"
import type { Shift, ShiftContextType } from "@/lib/types/shift"
import { useAuth } from "@/lib/auth-context"

const ShiftContext = createContext<ShiftContextType | undefined>(undefined)

export const useShiftContext = () => {
  const context = useContext(ShiftContext)
  if (!context) {
    throw new Error("useShiftContext must be used within a ShiftProvider")
  }
  return context
}

interface ShiftProviderProps {
  children: ReactNode
  tenantId: string
}

export const ShiftProvider: React.FC<ShiftProviderProps> = ({ children, tenantId }) => {
  const [currentShift, setCurrentShift] = useState<Shift | null>(null)
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchShifts = async () => {
    try {
      setLoading(true)
      console.log("Fetching shifts for tenant:", tenantId)

      if (!tenantId) {
        console.error("No tenantId provided to ShiftProvider")
        setError("Error: No se proporcionó un ID de inquilino")
        setLoading(false)
        return
      }

      // Obtener todos los turnos del inquilino
      const shiftsRef = ref(rtdb, `tenants/${tenantId}/shifts`)
      const shiftsSnapshot = await get(shiftsRef)
      const shiftsData = shiftsSnapshot.val() || {}

      console.log("Shifts data loaded:", shiftsData)

      const fetchedShifts: Shift[] = Object.keys(shiftsData).map((key) => ({
        id: key,
        ...shiftsData[key],
      }))

      // Ordenar los turnos por fecha de inicio (más recientes primero)
      fetchedShifts.sort((a, b) => (b.startTime || 0) - (a.startTime || 0))

      setShifts(fetchedShifts)

      // Buscar el turno activo actual
      const activeShift = fetchedShifts.find((shift) => shift.status === "active")
      setCurrentShift(activeShift || null)

      setError(null)
    } catch (err) {
      console.error("Error fetching shifts:", err)
      setError("Error al cargar los turnos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tenantId) {
      fetchShifts()
    } else {
      setLoading(false)
      setError("No se proporcionó un ID de inquilino")
    }
  }, [tenantId])

  const startShift = async (shiftData: Partial<Shift>): Promise<string> => {
    try {
      if (!tenantId) {
        throw new Error("No tenantId provided")
      }

      // Verificar si ya hay un turno activo
      if (currentShift) {
        throw new Error("Ya hay un turno activo. Cierra el turno actual antes de iniciar uno nuevo.")
      }

      console.log(`Iniciando turno para el tenant: ${tenantId}`)

      const shiftsRef = ref(rtdb, `tenants/${tenantId}/shifts`)
      const newShiftRef = push(shiftsRef)

      const timestamp = Date.now()
      const newShift: Omit<Shift, "id"> = {
        tenantId,
        startTime: timestamp,
        status: "active",
        createdBy: user?.uid || "",
        ...shiftData,
      }

      await update(newShiftRef, newShift)

      // Actualizar el estado local
      const newShiftWithId: Shift = {
        id: newShiftRef.key || "",
        ...newShift,
      }

      setCurrentShift(newShiftWithId)
      setShifts([newShiftWithId, ...shifts])

      return newShiftRef.key || ""
    } catch (err) {
      console.error("Error starting shift:", err)
      throw err
    }
  }

  const endShift = async (shiftId: string, summary?: Shift["summary"]): Promise<void> => {
    try {
      if (!tenantId) {
        throw new Error("No tenantId provided")
      }

      console.log(`Finalizando turno ${shiftId} para el tenant: ${tenantId}`)

      const shiftRef = ref(rtdb, `tenants/${tenantId}/shifts/${shiftId}`)
      const shiftSnapshot = await get(shiftRef)

      if (!shiftSnapshot.exists()) {
        throw new Error("El turno no existe")
      }

      const shiftData = shiftSnapshot.val()
      if (shiftData.status !== "active") {
        throw new Error("El turno ya está cerrado")
      }

      const timestamp = Date.now()
      await update(shiftRef, {
        status: "closed",
        endTime: timestamp,
        closedBy: user?.uid || "",
        summary: summary || {
          totalOrders: 0,
          totalSales: 0,
          cashSales: 0,
          cardSales: 0,
          otherSales: 0,
        },
      })

      // Actualizar el estado local
      setCurrentShift(null)
      await fetchShifts() // Recargar todos los turnos
    } catch (err) {
      console.error("Error ending shift:", err)
      throw err
    }
  }

  const getShift = async (shiftId: string): Promise<Shift | null> => {
    try {
      if (!tenantId) {
        throw new Error("No tenantId provided")
      }

      const shiftRef = ref(rtdb, `tenants/${tenantId}/shifts/${shiftId}`)
      const shiftSnapshot = await get(shiftRef)

      if (shiftSnapshot.exists()) {
        return {
          id: shiftId,
          ...shiftSnapshot.val(),
        } as Shift
      }

      return null
    } catch (err) {
      console.error("Error getting shift:", err)
      throw err
    }
  }

  const value: ShiftContextType = {
    currentShift,
    shifts,
    loading,
    error,
    startShift,
    endShift,
    getShift,
    refreshShifts: fetchShifts,
  }

  return <ShiftContext.Provider value={value}>{children}</ShiftContext.Provider>
}
