"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ref, onValue, push, set, get, query, orderByChild, equalTo } from "firebase/database"
import { db } from "@/lib/firebase-config"
import type { Shift } from "@/lib/types/shift"

// Definir la interfaz para el contexto
interface ShiftContextType {
  currentShift: Shift | null
  loading: boolean
  error: string | null
  startShift: (employeeId: string, notes: string) => Promise<Shift>
  endShift: (notes: string) => Promise<void>
  getShiftById: (shiftId: string) => Promise<Shift | null>
}

// Crear el contexto con un valor por defecto
const ShiftContext = createContext<ShiftContextType | undefined>(undefined)

// Hook personalizado para usar el contexto
export function useShiftContext() {
  const context = useContext(ShiftContext)
  if (context === undefined) {
    throw new Error("useShiftContext must be used within a ShiftProvider")
  }
  return context
}

// Proveedor del contexto
export function ShiftProvider({ children, tenantId }: { children: ReactNode; tenantId: string }) {
  const [currentShift, setCurrentShift] = useState<Shift | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar el turno activo al montar el componente
  useEffect(() => {
    if (!tenantId) {
      console.error("ShiftProvider: No tenant ID provided")
      setLoading(false)
      return
    }

    console.log("ShiftProvider: Loading active shift for tenant", tenantId)

    const shiftsRef = ref(db, `tenants/${tenantId}/shifts`)
    const activeShiftQuery = query(shiftsRef, orderByChild("active"), equalTo(true))

    const unsubscribe = onValue(
      activeShiftQuery,
      (snapshot) => {
        try {
          const data = snapshot.val()
          console.log("ShiftProvider: Active shift data", data)

          if (data) {
            // Convertir el objeto a un array y tomar el primer turno activo
            const shifts = Object.entries(data).map(([id, shift]) => ({
              id,
              ...(shift as any),
            }))

            if (shifts.length > 0) {
              console.log("ShiftProvider: Found active shift", shifts[0])
              setCurrentShift(shifts[0] as Shift)
            } else {
              console.log("ShiftProvider: No active shift found")
              setCurrentShift(null)
            }
          } else {
            console.log("ShiftProvider: No active shift data")
            setCurrentShift(null)
          }

          setLoading(false)
        } catch (err) {
          console.error("ShiftProvider: Error loading active shift", err)
          setError("Error al cargar el turno activo")
          setLoading(false)
        }
      },
      (err) => {
        console.error("ShiftProvider: Firebase error", err)
        setError("Error de conexión con la base de datos")
        setLoading(false)
      },
    )

    return () => {
      console.log("ShiftProvider: Unsubscribing from active shift")
      unsubscribe()
    }
  }, [tenantId])

  // Iniciar un nuevo turno
  const startShift = async (employeeId: string, notes: string): Promise<Shift> => {
    try {
      if (currentShift) {
        throw new Error("Ya hay un turno activo")
      }

      const shiftsRef = ref(db, `tenants/${tenantId}/shifts`)
      const newShiftRef = push(shiftsRef)
      const shiftId = newShiftRef.key

      if (!shiftId) {
        throw new Error("Error al generar ID para el nuevo turno")
      }

      const now = Date.now()
      const newShift: Shift = {
        id: shiftId,
        employeeId,
        startTime: now,
        endTime: null,
        active: true,
        notes: notes || "",
        endNotes: "",
      }

      await set(newShiftRef, newShift)
      setCurrentShift(newShift)
      return newShift
    } catch (err) {
      console.error("Error al iniciar turno:", err)
      setError("Error al iniciar el turno")
      throw err
    }
  }

  // Finalizar el turno activo
  const endShift = async (notes: string): Promise<void> => {
    try {
      if (!currentShift) {
        throw new Error("No hay un turno activo para finalizar")
      }

      const shiftRef = ref(db, `tenants/${tenantId}/shifts/${currentShift.id}`)
      const now = Date.now()

      // Actualizar el turno en Firebase
      await set(shiftRef, {
        ...currentShift,
        endTime: now,
        active: false,
        endNotes: notes || "",
      })

      // Actualizar el estado local inmediatamente
      setCurrentShift(null)

      console.log("Turno finalizado correctamente")
    } catch (err) {
      console.error("Error al finalizar turno:", err)
      setError("Error al finalizar el turno")
      throw err
    }
  }

  // Obtener un turno por su ID
  const getShiftById = async (shiftId: string): Promise<Shift | null> => {
    try {
      const shiftRef = ref(db, `tenants/${tenantId}/shifts/${shiftId}`)
      const snapshot = await get(shiftRef)

      if (snapshot.exists()) {
        const shiftData = snapshot.val()
        return {
          id: shiftId,
          ...shiftData,
        }
      }

      return null
    } catch (err) {
      console.error("Error al obtener turno:", err)
      setError("Error al obtener información del turno")
      throw err
    }
  }

  // Valor del contexto
  const value = {
    currentShift,
    loading,
    error,
    startShift,
    endShift,
    getShiftById,
  }

  return <ShiftContext.Provider value={value}>{children}</ShiftContext.Provider>
}
