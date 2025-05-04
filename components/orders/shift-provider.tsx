"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { ref, push, get, update, onValue, off } from "firebase/database"
import { rtdb } from "@/lib/firebase-config"
import { useAuth } from "@/lib/auth-context"

// Definir tipos
interface Shift {
  id: string
  tenantId: string
  startTime: number
  endTime?: number | null
  status: "active" | "closed"
  createdBy: string
  closedBy?: string
  notes?: string
  summary?: {
    totalOrders: number
    totalSales: number
    cashSales: number
    cardSales: number
    otherSales: number
  }
}

interface ShiftContextValue {
  currentShift: Shift | null
  shifts: Shift[]
  loading: boolean
  error: string | null
  startShift: (shiftData?: Partial<Shift>) => Promise<string>
  endShift: (shiftId: string, summary?: Shift["summary"]) => Promise<void>
  getShift: (shiftId: string) => Promise<Shift | null>
  refreshShifts: () => Promise<void>
}

// Crear un valor por defecto para el contexto
const defaultContextValue: ShiftContextValue = {
  currentShift: null,
  shifts: [],
  loading: true,
  error: null,
  startShift: async () => "",
  endShift: async () => {},
  getShift: async () => null,
  refreshShifts: async () => {},
}

// Crear el contexto
const ShiftContext = createContext<ShiftContextValue>(defaultContextValue)

// Hook para usar el contexto
export function useShift() {
  return useContext(ShiftContext)
}

// Props del provider
interface ShiftProviderProps {
  children: React.ReactNode
  tenantId: string
}

// Provider component
export function ShiftProvider({ children, tenantId }: ShiftProviderProps) {
  const [currentShift, setCurrentShift] = useState<Shift | null>(null)
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Cargar turnos al montar el componente
  useEffect(() => {
    if (!tenantId) {
      setLoading(false)
      setError("No se proporcionó un ID de inquilino")
      return
    }

    setLoading(true)
    console.log("Setting up real-time listener for shifts, tenant:", tenantId)

    const shiftsRef = ref(rtdb, `tenants/${tenantId}/shifts`)

    const handleShiftsUpdate = (snapshot: any) => {
      try {
        const shiftsData = snapshot.val() || {}
        console.log("Real-time shifts data update:", shiftsData)

        const fetchedShifts: Shift[] = Object.keys(shiftsData).map((key) => ({
          id: key,
          ...shiftsData[key],
        }))

        // Ordenar los turnos por fecha de inicio (más recientes primero)
        fetchedShifts.sort((a, b) => (b.startTime || 0) - (a.startTime || 0))

        setShifts(fetchedShifts)

        // Buscar el turno activo actual
        const activeShift = fetchedShifts.find((shift) => shift.status === "active")
        console.log("Active shift found:", activeShift)
        setCurrentShift(activeShift || null)

        setError(null)
      } catch (err) {
        console.error("Error processing shifts data:", err)
        setError("Error al procesar los datos de turnos")
      } finally {
        setLoading(false)
      }
    }

    // Establecer el listener
    onValue(shiftsRef, handleShiftsUpdate, (err) => {
      console.error("Firebase shifts listener error:", err)
      setError("Error en la conexión con la base de datos")
      setLoading(false)
    })

    // Limpiar el listener cuando el componente se desmonte
    return () => {
      console.log("Cleaning up shifts listener")
      off(shiftsRef)
    }
  }, [tenantId])

  // Función para recargar los turnos manualmente
  const refreshShifts = async () => {
    try {
      setLoading(true)
      console.log("Manually fetching shifts for tenant:", tenantId)

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
      console.log("Active shift found:", activeShift)
      setCurrentShift(activeShift || null)

      setError(null)
    } catch (err) {
      console.error("Error fetching shifts:", err)
      setError("Error al cargar los turnos")
    } finally {
      setLoading(false)
    }
  }

  // Función para iniciar un nuevo turno
  const startShift = async (shiftData: Partial<Shift> = {}): Promise<string> => {
    try {
      if (!tenantId) {
        throw new Error("No tenantId provided")
      }

      // Verificar si ya hay un turno activo
      if (currentShift) {
        console.log("Ya existe un turno activo:", currentShift)
        return currentShift.id // Devolver el ID del turno existente
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
      console.log("Turno creado con ID:", newShiftRef.key)

      // El listener se encargará de actualizar el estado
      return newShiftRef.key || ""
    } catch (err) {
      console.error("Error starting shift:", err)
      throw err
    }
  }

  // Función para finalizar un turno
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

      // Actualizar el estado en Firebase
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

      // Actualizar el estado local inmediatamente para evitar problemas de sincronización
      setCurrentShift(null)
      setShifts((prevShifts) =>
        prevShifts.map((shift) =>
          shift.id === shiftId
            ? {
                ...shift,
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
              }
            : shift,
        ),
      )

      console.log(`Turno ${shiftId} finalizado correctamente`)
    } catch (err) {
      console.error("Error ending shift:", err)
      throw err
    }
  }

  // Función para obtener un turno por su ID
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

  // Valor del contexto
  const value: ShiftContextValue = {
    currentShift,
    shifts,
    loading,
    error,
    startShift,
    endShift,
    getShift,
    refreshShifts,
  }

  return <ShiftContext.Provider value={value}>{children}</ShiftContext.Provider>
}
