"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { database } from "@/lib/firebase-config"
import { ref, get, set, push, query, orderByChild } from "firebase/database"
import { useAuth } from "@/lib/auth-context"
import type {
  CashierSession,
  SessionSummary,
  OpenSessionParams,
  CloseSessionParams,
  SalesDataPoint,
} from "@/lib/types/cashier"
import type { Order } from "@/lib/types/orders"

interface CashierContextType {
  currentSession: CashierSession | null
  sessions: CashierSession[]
  isLoading: boolean
  error: string | null
  openSession: (params: OpenSessionParams) => Promise<void>
  closeSession: (params: CloseSessionParams) => Promise<void>
  getSessionSummary: (sessionId: string) => SessionSummary | null
  getSessionOrders: (sessionId: string) => Promise<Order[]>
  getSalesData: (period: "day" | "week" | "month" | "year") => Promise<SalesDataPoint[]>
}

const CashierContext = createContext<CashierContextType | undefined>(undefined)

export function CashierProvider({
  children,
  tenantId,
}: {
  children: React.ReactNode
  tenantId: string
}) {
  const { user } = useAuth()
  const [currentSession, setCurrentSession] = useState<CashierSession | null>(null)
  const [sessions, setSessions] = useState<CashierSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch current session and session history
  useEffect(() => {
    if (!tenantId) return

    const fetchSessions = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Get all sessions for this tenant
        const sessionsRef = ref(database, `tenants/${tenantId}/cashier/sessions`)
        const snapshot = await get(sessionsRef)

        if (snapshot.exists()) {
          const sessionsData = snapshot.val()
          const sessionsArray: CashierSession[] = Object.keys(sessionsData).map((key) => ({
            id: key,
            ...sessionsData[key],
          }))

          // Sort sessions by startTime (newest first)
          sessionsArray.sort((a, b) => b.startTime - a.startTime)

          setSessions(sessionsArray)

          // Find current open session if any
          const openSession = sessionsArray.find((session) => session.status === "open")
          if (openSession) {
            setCurrentSession(openSession)
          } else {
            setCurrentSession(null)
          }
        } else {
          setSessions([])
          setCurrentSession(null)
        }
      } catch (err) {
        console.error("Error fetching cashier sessions:", err)
        setError("Error al cargar las sesiones de caja")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSessions()
  }, [tenantId])

  // Open a new session
  const openSession = async (params: OpenSessionParams) => {
    if (!tenantId || !user) {
      throw new Error("No hay un tenant o usuario válido")
    }

    // Check if there's already an open session
    if (currentSession && currentSession.status === "open") {
      throw new Error("Ya hay una sesión de caja abierta")
    }

    const newSession: Omit<CashierSession, "id"> = {
      tenantId,
      startTime: Date.now(),
      initialCash: params.initialCash,
      openedBy: params.openedBy,
      status: "open",
    }

    // Save to Firebase
    const sessionsRef = ref(database, `tenants/${tenantId}/cashier/sessions`)
    const newSessionRef = push(sessionsRef)

    await set(newSessionRef, newSession)

    // Update local state
    const sessionWithId = {
      id: newSessionRef.key as string,
      ...newSession,
    }

    setCurrentSession(sessionWithId)
    setSessions((prev) => [sessionWithId, ...prev])
  }

  // Close an existing session
  const closeSession = async (params: CloseSessionParams) => {
    if (!tenantId || !user) {
      throw new Error("No hay un tenant o usuario válido")
    }

    // Check if the session exists and is open
    const session = sessions.find((s) => s.id === params.sessionId)
    if (!session) {
      throw new Error("Sesión no encontrada")
    }

    if (session.status !== "open") {
      throw new Error("La sesión ya está cerrada")
    }

    // Update session data
    const updatedSession: CashierSession = {
      ...session,
      endTime: Date.now(),
      endCash: params.endCash,
      endCard: params.endCard,
      endOther: params.endOther,
      difference: params.difference,
      notes: params.notes,
      closedBy: user.displayName || user.email || "Usuario desconocido",
      status: "closed",
    }

    // Save to Firebase
    const sessionRef = ref(database, `tenants/${tenantId}/cashier/sessions/${params.sessionId}`)
    await set(sessionRef, updatedSession)

    // Update local state
    setCurrentSession(null)
    setSessions((prev) => prev.map((s) => (s.id === params.sessionId ? updatedSession : s)))
  }

  // Get summary for a specific session
  const getSessionSummary = useCallback(
    (sessionId: string): SessionSummary | null => {
      // This is a placeholder. In a real implementation, you would calculate this from orders
      // that occurred during the session timeframe

      // For demo purposes, we'll return mock data
      // In a real implementation, you would query orders that occurred during the session timeframe
      // and calculate totals

      const session = sessions.find((s) => s.id === sessionId)
      if (!session) return null

      // Mock data - in a real implementation, this would be calculated from actual orders
      return {
        totalSales: 1250.75,
        cashSales: 450.25,
        cardSales: 800.5,
        otherSales: 0,
        tips: 125.0,
        totalOrders: 15,
        completedOrders: 14,
        canceledOrders: 1,
        orderItems: 45,
      }
    },
    [sessions],
  )

  // Get orders for a specific session
  const getSessionOrders = useCallback(
    async (sessionId: string): Promise<Order[]> => {
      if (!tenantId) {
        throw new Error("No hay un tenant válido")
      }

      const session = sessions.find((s) => s.id === sessionId)
      if (!session) {
        return []
      }

      try {
        // Query orders that were created between session start and end times
        const ordersRef = ref(database, `tenants/${tenantId}/orders`)
        const ordersQuery = query(
          ordersRef,
          orderByChild("createdAt"),
          // If session is still open, use current time as end time
          // Otherwise use the session end time
        )

        const snapshot = await get(ordersQuery)

        if (snapshot.exists()) {
          const ordersData = snapshot.val()
          const ordersArray: Order[] = Object.keys(ordersData).map((key) => ({
            id: key,
            ...ordersData[key],
          }))

          // Filter orders that were created during the session
          return ordersArray.filter((order) => {
            const orderTime = order.createdAt
            return orderTime >= session.startTime && (session.endTime ? orderTime <= session.endTime : true)
          })
        }

        return []
      } catch (err) {
        console.error("Error fetching session orders:", err)
        throw new Error("Error al cargar las órdenes de la sesión")
      }
    },
    [tenantId, sessions],
  )

  // Get sales data for charts
  const getSalesData = useCallback(async (period: "day" | "week" | "month" | "year"): Promise<SalesDataPoint[]> => {
    // This is a placeholder. In a real implementation, you would calculate this from orders

    // Mock data based on the selected period
    let mockData: SalesDataPoint[] = []

    switch (period) {
      case "day":
        // Hourly data for today
        mockData = Array.from({ length: 12 }, (_, i) => ({
          label: `${i + 9}:00`, // 9 AM to 8 PM
          totalSales: Math.random() * 500 + 100,
          cashSales: Math.random() * 200 + 50,
          cardSales: Math.random() * 300 + 50,
          otherSales: Math.random() * 50,
          tips: Math.random() * 50 + 10,
          orders: Math.floor(Math.random() * 10 + 1),
        }))
        break

      case "week":
        // Daily data for the week
        const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
        mockData = days.map((day) => ({
          label: day,
          totalSales: Math.random() * 2000 + 500,
          cashSales: Math.random() * 800 + 200,
          cardSales: Math.random() * 1200 + 300,
          otherSales: Math.random() * 100,
          tips: Math.random() * 200 + 50,
          orders: Math.floor(Math.random() * 30 + 10),
        }))
        break

      case "month":
        // Weekly data for the month
        mockData = Array.from({ length: 4 }, (_, i) => ({
          label: `Semana ${i + 1}`,
          totalSales: Math.random() * 10000 + 2000,
          cashSales: Math.random() * 4000 + 1000,
          cardSales: Math.random() * 6000 + 1000,
          otherSales: Math.random() * 500,
          tips: Math.random() * 1000 + 200,
          orders: Math.floor(Math.random() * 150 + 50),
        }))
        break

      case "year":
        // Monthly data for the year
        const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
        mockData = months.map((month) => ({
          label: month,
          totalSales: Math.random() * 40000 + 10000,
          cashSales: Math.random() * 15000 + 5000,
          cardSales: Math.random() * 25000 + 5000,
          otherSales: Math.random() * 2000,
          tips: Math.random() * 4000 + 1000,
          orders: Math.floor(Math.random() * 600 + 200),
        }))
        break
    }

    return mockData
  }, [])

  const value = {
    currentSession,
    sessions,
    isLoading,
    error,
    openSession,
    closeSession,
    getSessionSummary,
    getSessionOrders,
    getSalesData,
  }

  return <CashierContext.Provider value={value}>{children}</CashierContext.Provider>
}

export function useCashier() {
  const context = useContext(CashierContext)
  if (context === undefined) {
    throw new Error("useCashier must be used within a CashierProvider")
  }
  return context
}
