"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { database } from "@/lib/firebase-config"
import { ref, get, set, push, onValue, update } from "firebase/database"
import { useAuth } from "@/lib/auth-context"
import type {
  CashierSession,
  SessionSummary,
  OpenSessionParams,
  CloseSessionParams,
  SalesDataPoint,
} from "@/lib/types/cashier"
import type { Order } from "@/lib/types/orders"
import { useToast } from "@/components/ui/use-toast"

interface CashierContextType {
  currentSession: CashierSession | null
  sessions: CashierSession[]
  isLoading: boolean
  error: string | null
  openSession: (params: OpenSessionParams) => Promise<void>
  closeSession: (params: CloseSessionParams) => Promise<void>
  getSessionSummary: (sessionId: string) => Promise<SessionSummary>
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
  const { toast } = useToast()
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
        const unsubscribe = onValue(
          sessionsRef,
          (snapshot) => {
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
            setIsLoading(false)
          },
          (error) => {
            console.error("Error fetching cashier sessions:", error)
            setError("Error al cargar las sesiones de caja")
            setIsLoading(false)
          },
        )

        return () => unsubscribe()
      } catch (err) {
        console.error("Error fetching cashier sessions:", err)
        setError("Error al cargar las sesiones de caja")
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

    try {
      // Ensure initialCash is a valid number
      const initialCash = Number(params.initialCash)
      if (isNaN(initialCash)) {
        throw new Error("El monto inicial debe ser un número válido")
      }

      const newSession = {
        tenantId,
        startTime: Date.now(),
        initialCash: initialCash,
        openedBy: params.openedBy || user.displayName || user.email || "Usuario desconocido",
        createdBy: user.uid,
        status: "open",
        notes: params.notes || "",
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

      toast({
        title: "Sesión abierta",
        description: "La sesión de caja se ha abierto correctamente",
      })

      return
    } catch (error) {
      console.error("Error opening session:", error)
      toast({
        title: "Error",
        description: "No se pudo abrir la sesión de caja",
        variant: "destructive",
      })
      throw new Error("No se pudo abrir la sesión de caja")
    }
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

    try {
      // Ensure all numeric values are valid numbers
      const endCash = Number(params.endCash) || 0
      const endCard = Number(params.endCard) || 0
      const endOther = Number(params.endOther) || 0
      const difference = Number(params.difference) || 0

      // Get session orders to calculate summary
      const sessionOrders = await getSessionOrders(params.sessionId)

      // Calculate financial summary
      let totalSales = 0
      let cashSales = 0
      let cardSales = 0
      let otherSales = 0
      const totalOrders = sessionOrders.length
      let completedOrders = 0
      let canceledOrders = 0

      sessionOrders.forEach((order) => {
        if (order.status === "completed") {
          completedOrders++
          totalSales += Number(order.total) || 0

          // Count by payment method
          if (order.paymentMethod === "cash") {
            cashSales += Number(order.total) || 0
          } else if (order.paymentMethod === "card") {
            cardSales += Number(order.total) || 0
          } else {
            otherSales += Number(order.total) || 0
          }
        } else if (order.status === "cancelled") {
          canceledOrders++
        }
      })

      // Create summary object
      const summary = {
        totalSales,
        cashSales,
        cardSales,
        otherSales,
        totalOrders,
        completedOrders,
        canceledOrders,
      }

      console.log("Session summary calculated:", summary)

      // Update session data
      const updatedSession: CashierSession = {
        ...session,
        endTime: Date.now(),
        endCash,
        endCard,
        endOther,
        difference,
        notes: params.notes || "",
        closedBy: user.uid,
        status: "closed",
        summary, // Add summary to session data
      }

      // Save to Firebase
      const sessionRef = ref(database, `tenants/${tenantId}/cashier/sessions/${params.sessionId}`)
      await update(sessionRef, updatedSession)

      // Update local state
      setCurrentSession(null)
      setSessions((prev) => prev.map((s) => (s.id === params.sessionId ? updatedSession : s)))

      toast({
        title: "Sesión cerrada",
        description: "La sesión de caja se ha cerrado correctamente",
      })

      return
    } catch (error) {
      console.error("Error closing session:", error)
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión de caja",
        variant: "destructive",
      })
      throw new Error("No se pudo cerrar la sesión de caja")
    }
  }

  // Get summary for a specific session
  const getSessionSummary = useCallback(
    async (sessionId: string): Promise<SessionSummary> => {
      try {
        const session = sessions.find((s) => s.id === sessionId)
        if (!session) {
          throw new Error("Sesión no encontrada")
        }

        // If session has a saved summary, use it
        if (session.summary) {
          return session.summary
        }

        // Otherwise, calculate from orders
        const orders = await getSessionOrders(sessionId)

        // Calculate totals
        let totalSales = 0
        let cashSales = 0
        let cardSales = 0
        let otherSales = 0
        const totalOrders = orders.length
        let completedOrders = 0
        let canceledOrders = 0
        let orderItems = 0

        orders.forEach((order) => {
          if (order.status === "completed") {
            completedOrders++
            totalSales += Number(order.total) || 0

            // Count by payment method
            if (order.paymentMethod === "cash") {
              cashSales += Number(order.total) || 0
            } else if (order.paymentMethod === "card") {
              cardSales += Number(order.total) || 0
            } else {
              otherSales += Number(order.total) || 0
            }

            // Count items
            orderItems += order.items?.length || 0
          } else if (order.status === "canceled") {
            canceledOrders++
          }
        })

        return {
          totalSales,
          cashSales,
          cardSales,
          otherSales,
          totalOrders,
          completedOrders,
          canceledOrders,
          orderItems,
        }
      } catch (err) {
        console.error("Error getting session summary:", err)
        return {
          totalSales: 0,
          cashSales: 0,
          cardSales: 0,
          otherSales: 0,
          totalOrders: 0,
          completedOrders: 0,
          canceledOrders: 0,
          orderItems: 0,
        }
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
        // Get all orders
        const ordersRef = ref(database, `tenants/${tenantId}/orders`)
        const snapshot = await get(ordersRef)

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
  const getSalesData = useCallback(
    async (period: "day" | "week" | "month" | "year"): Promise<SalesDataPoint[]> => {
      if (!tenantId || !currentSession) {
        return []
      }

      try {
        // Get all orders for the current session
        const orders = await getSessionOrders(currentSession.id)

        if (orders.length === 0) {
          return []
        }

        // Group orders by time period
        const now = new Date()
        const dataPoints: SalesDataPoint[] = []

        switch (period) {
          case "day": {
            // Group by hour
            const hourlyData: Record<number, Order[]> = {}

            // Initialize hours (9am to 11pm)
            for (let i = 9; i <= 23; i++) {
              hourlyData[i] = []
            }

            // Group orders by hour
            orders.forEach((order) => {
              const orderDate = new Date(order.createdAt)
              const hour = orderDate.getHours()
              if (hourlyData[hour]) {
                hourlyData[hour].push(order)
              }
            })

            // Create data points
            Object.entries(hourlyData).forEach(([hour, hourOrders]) => {
              const hourNum = Number.parseInt(hour)
              dataPoints.push({
                label: `${hourNum}:00`,
                totalSales: calculateTotal(hourOrders),
                cashSales: calculateTotal(hourOrders.filter((o) => o.paymentMethod === "cash")),
                cardSales: calculateTotal(hourOrders.filter((o) => o.paymentMethod === "card")),
                otherSales: calculateTotal(
                  hourOrders.filter((o) => o.paymentMethod !== "cash" && o.paymentMethod !== "card"),
                ),
                tips: calculateTips(hourOrders),
                orders: hourOrders.length,
              })
            })
            break
          }

          case "week": {
            // Group by day of week
            const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
            const dailyData: Record<number, Order[]> = {}

            // Initialize days
            for (let i = 0; i < 7; i++) {
              dailyData[i] = []
            }

            // Group orders by day
            orders.forEach((order) => {
              const orderDate = new Date(order.createdAt)
              const day = orderDate.getDay() // 0 = Sunday, 6 = Saturday
              dailyData[day].push(order)
            })

            // Create data points
            Object.entries(dailyData).forEach(([day, dayOrders]) => {
              const dayNum = Number.parseInt(day)
              dataPoints.push({
                label: days[dayNum],
                totalSales: calculateTotal(dayOrders),
                cashSales: calculateTotal(dayOrders.filter((o) => o.paymentMethod === "cash")),
                cardSales: calculateTotal(dayOrders.filter((o) => o.paymentMethod === "card")),
                otherSales: calculateTotal(
                  dayOrders.filter((o) => o.paymentMethod !== "cash" && o.paymentMethod !== "card"),
                ),
                tips: calculateTips(dayOrders),
                orders: dayOrders.length,
              })
            })

            // Reorder to start with Monday
            const sunday = dataPoints.shift()
            if (sunday) dataPoints.push(sunday)
            break
          }

          case "month": {
            // Group by week
            const weeklyData: Record<number, Order[]> = {}

            // Initialize weeks (4 weeks)
            for (let i = 0; i < 4; i++) {
              weeklyData[i] = []
            }

            // Group orders by week
            orders.forEach((order) => {
              const orderDate = new Date(order.createdAt)
              const dayOfMonth = orderDate.getDate()
              const weekOfMonth = Math.floor(dayOfMonth / 7)
              if (weekOfMonth < 4) {
                weeklyData[weekOfMonth].push(order)
              }
            })

            // Create data points
            Object.entries(weeklyData).forEach(([week, weekOrders]) => {
              const weekNum = Number.parseInt(week)
              dataPoints.push({
                label: `Semana ${weekNum + 1}`,
                totalSales: calculateTotal(weekOrders),
                cashSales: calculateTotal(weekOrders.filter((o) => o.paymentMethod === "cash")),
                cardSales: calculateTotal(weekOrders.filter((o) => o.paymentMethod === "card")),
                otherSales: calculateTotal(
                  weekOrders.filter((o) => o.paymentMethod !== "cash" && o.paymentMethod !== "card"),
                ),
                tips: calculateTips(weekOrders),
                orders: weekOrders.length,
              })
            })
            break
          }

          case "year": {
            // Group by month
            const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
            const monthlyData: Record<number, Order[]> = {}

            // Initialize months
            for (let i = 0; i < 12; i++) {
              monthlyData[i] = []
            }

            // Group orders by month
            orders.forEach((order) => {
              const orderDate = new Date(order.createdAt)
              const month = orderDate.getMonth()
              monthlyData[month].push(order)
            })

            // Create data points
            Object.entries(monthlyData).forEach(([month, monthOrders]) => {
              const monthNum = Number.parseInt(month)
              dataPoints.push({
                label: months[monthNum],
                totalSales: calculateTotal(monthOrders),
                cashSales: calculateTotal(monthOrders.filter((o) => o.paymentMethod === "cash")),
                cardSales: calculateTotal(monthOrders.filter((o) => o.paymentMethod === "card")),
                otherSales: calculateTotal(
                  monthOrders.filter((o) => o.paymentMethod !== "cash" && o.paymentMethod !== "card"),
                ),
                tips: calculateTips(monthOrders),
                orders: monthOrders.length,
              })
            })
            break
          }
        }

        return dataPoints
      } catch (error) {
        console.error("Error getting sales data:", error)
        return []
      }
    },
    [tenantId, currentSession, getSessionOrders],
  )

  // Helper functions for sales data
  function calculateTotal(orders: Order[]): number {
    return orders
      .filter((order) => order.status === "completed")
      .reduce((sum, order) => sum + (Number(order.total) || 0), 0)
  }

  function calculateTips(orders: Order[]): number {
    return orders
      .filter((order) => order.status === "completed")
      .reduce((sum, order) => sum + (Number(order.tip) || 0), 0)
  }

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
