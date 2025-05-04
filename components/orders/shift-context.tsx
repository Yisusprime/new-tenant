"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { ref, push, get, update } from "firebase/database"
import { rtdb } from "@/lib/firebase-config"
import { useAuth } from "@/lib/auth-context"
import type { Shift, ShiftSummary } from "@/lib/types/shift"
import type { Order } from "@/lib/types/orders"

interface ShiftContextProps {
  currentShift: Shift | null
  shifts: Shift[]
  loading: boolean
  error: string | null
  startShift: () => Promise<string>
  endShift: () => Promise<void>
  getShiftSummary: (shiftId: string) => Promise<ShiftSummary>
  getShiftOrders: (shiftId: string) => Promise<Order[]>
  refreshShifts: () => Promise<void>
}

const ShiftContext = createContext<ShiftContextProps | undefined>(undefined)

export const useShiftContext = () => {
  const context = useContext(ShiftContext)
  if (!context) {
    throw new Error("useShiftContext must be used within a ShiftProvider")
  }
  return context
}

interface ShiftProviderProps {
  children: React.ReactNode
  tenantId: string
}

export const ShiftProvider: React.FC<ShiftProviderProps> = ({ children, tenantId }) => {
  const { user } = useAuth()
  const [currentShift, setCurrentShift] = useState<Shift | null>(null)
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchShifts = useCallback(async () => {
    if (!tenantId) return

    setLoading(true)
    setError(null)

    try {
      console.log("Fetching shifts for tenant:", tenantId)
      const shiftsRef = ref(rtdb, `tenants/${tenantId}/shifts`)
      const shiftsSnapshot = await get(shiftsRef)

      if (shiftsSnapshot.exists()) {
        const shiftsData = shiftsSnapshot.val()
        const shiftsArray: Shift[] = Object.keys(shiftsData).map((key) => ({
          id: key,
          ...shiftsData[key],
        }))

        // Ordenar turnos por fecha de inicio (más recientes primero)
        shiftsArray.sort((a, b) => b.startTime - a.startTime)

        setShifts(shiftsArray)

        // Buscar turno activo
        const activeShift = shiftsArray.find((shift) => shift.status === "active")
        setCurrentShift(activeShift || null)
      } else {
        setShifts([])
        setCurrentShift(null)
      }
    } catch (err) {
      console.error("Error fetching shifts:", err)
      setError("Error al cargar los turnos")
    } finally {
      setLoading(false)
    }
  }, [tenantId])

  useEffect(() => {
    fetchShifts()
  }, [fetchShifts])

  const startShift = async (): Promise<string> => {
    if (!tenantId || !user) {
      throw new Error("No hay un tenant o usuario válido")
    }

    // Verificar si ya hay un turno activo
    if (currentShift) {
      return currentShift.id // Devolver el ID del turno activo existente
    }

    const newShift: Omit<Shift, "id"> = {
      tenantId,
      startTime: Date.now(),
      startedBy: user.displayName || user.email || "Usuario desconocido",
      status: "active",
    }

    // Guardar en Firebase
    const shiftsRef = ref(rtdb, `tenants/${tenantId}/shifts`)
    const newShiftRef = push(shiftsRef)

    await update(newShiftRef, newShift)

    const shiftId = newShiftRef.key as string

    // Actualizar estado local
    const shiftWithId: Shift = {
      id: shiftId,
      ...newShift,
    }

    setCurrentShift(shiftWithId)
    setShifts((prev) => [shiftWithId, ...prev])

    return shiftId
  }

  const endShift = async (): Promise<void> => {
    if (!tenantId || !user || !currentShift) {
      throw new Error("No hay un tenant, usuario o turno activo válido")
    }

    // Actualizar en Firebase
    const shiftRef = ref(rtdb, `tenants/${tenantId}/shifts/${currentShift.id}`)

    await update(shiftRef, {
      endTime: Date.now(),
      endedBy: user.displayName || user.email || "Usuario desconocido",
      status: "closed",
    })

    // Actualizar estado local
    setCurrentShift(null)
    await fetchShifts() // Recargar turnos
  }

  const getShiftSummary = async (shiftId: string): Promise<ShiftSummary> => {
    if (!tenantId) {
      throw new Error("No hay un tenant válido")
    }

    const shift = shifts.find((s) => s.id === shiftId)
    if (!shift) {
      throw new Error("Turno no encontrado")
    }

    try {
      // Obtener órdenes del turno
      const orders = await getShiftOrders(shiftId)

      // Calcular resumen
      const summary: ShiftSummary = {
        totalOrders: orders.length,
        completedOrders: orders.filter((o) => o.status === "completed").length,
        canceledOrders: orders.filter((o) => o.status === "cancelled").length,
        totalSales: orders.reduce((sum, order) => sum + (order.total || 0), 0),
        cashSales: orders.filter((o) => o.paymentMethod === "cash").reduce((sum, order) => sum + (order.total || 0), 0),
        cardSales: orders.filter((o) => o.paymentMethod === "card").reduce((sum, order) => sum + (order.total || 0), 0),
        transferSales: orders
          .filter((o) => o.paymentMethod === "transfer")
          .reduce((sum, order) => sum + (order.total || 0), 0),
        otherSales: orders
          .filter((o) => o.paymentMethod === "other")
          .reduce((sum, order) => sum + (order.total || 0), 0),
      }

      return summary
    } catch (err) {
      console.error("Error getting shift summary:", err)
      throw new Error("Error al obtener el resumen del turno")
    }
  }

  const getShiftOrders = async (shiftId: string): Promise<Order[]> => {
    if (!tenantId) {
      throw new Error("No hay un tenant válido")
    }

    const shift = shifts.find((s) => s.id === shiftId)
    if (!shift) {
      return []
    }

    try {
      // Obtener todas las órdenes
      const ordersRef = ref(rtdb, `tenants/${tenantId}/orders`)
      const ordersSnapshot = await get(ordersRef)

      if (!ordersSnapshot.exists()) {
        return []
      }

      const ordersData = ordersSnapshot.val()
      const allOrders: Order[] = Object.keys(ordersData).map((key) => ({
        id: key,
        ...ordersData[key],
      }))

      // Filtrar órdenes que pertenecen al turno
      const shiftOrders = allOrders.filter((order) => {
        const orderTime = order.createdAt || 0
        return orderTime >= shift.startTime && (shift.endTime ? orderTime <= shift.endTime : true)
      })

      return shiftOrders
    } catch (err) {
      console.error("Error getting shift orders:", err)
      throw new Error("Error al obtener las órdenes del turno")
    }
  }

  const value = {
    currentShift,
    shifts,
    loading,
    error,
    startShift,
    endShift,
    getShiftSummary,
    getShiftOrders,
    refreshShifts: fetchShifts,
  }

  return <ShiftContext.Provider value={value}>{children}</ShiftContext.Provider>
}
