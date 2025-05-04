"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { ref, get, set, push, onValue } from "firebase/database"
import { rtdb } from "@/lib/firebase-config"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/components/ui/use-toast"
import type { CashierSession, SessionSummary } from "@/lib/types/cashier"
import type { Order } from "@/lib/types/orders"

interface CashierContextType {
  currentSession: CashierSession | null
  sessions: CashierSession[]
  isLoading: boolean
  openSession: (initialCash: number, notes?: string) => Promise<void>
  closeSession: (endCash: number, endCard: number, notes?: string) => Promise<void>
  getSessionSummary: (sessionId: string) => SessionSummary | null
  getSessionOrders: (sessionId: string) => Promise<Order[]>
}

const CashierContext = createContext<CashierContextType | undefined>(undefined)

export function CashierProvider({ children }: { children: React.ReactNode }) {
  const { user, tenantId } = useAuth()
  const [currentSession, setCurrentSession] = useState<CashierSession | null>(null)
  const [sessions, setSessions] = useState<CashierSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sessionSummaries, setSessionSummaries] = useState<Record<string, SessionSummary>>({})

  // Load sessions
  useEffect(() => {
    if (!tenantId) return

    const sessionsRef = ref(rtdb, `tenants/${tenantId}/cashier/sessions`)
    const unsubscribe = onValue(
      sessionsRef,
      (snapshot) => {
        const data = snapshot.val()
        if (!data) {
          setSessions([])
          setIsLoading(false)
          return
        }

        const sessionsArray = Object.entries(data).map(([id, session]) => ({
          id,
          ...(session as any),
        })) as CashierSession[]

        // Sort by startTime descending (newest first)
        sessionsArray.sort((a, b) => b.startTime - a.startTime)

        setSessions(sessionsArray)

        // Find current open session
        const openSession = sessionsArray.find((session) => session.status === "open")
        setCurrentSession(openSession || null)

        setIsLoading(false)
      },
      (error) => {
        console.error("Error loading cashier sessions:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las sesiones de caja",
          variant: "destructive",
        })
        setIsLoading(false)
      },
    )

    return () => unsubscribe()
  }, [tenantId, toast])

  // Open a new session
  const openSession = useCallback(
    async (initialCash: number, notes?: string) => {
      if (!tenantId || !user) {
        toast({
          title: "Error",
          description: "No se pudo abrir la sesión de caja",
          variant: "destructive",
        })
        return
      }

      try {
        // Check if there's already an open session
        if (currentSession) {
          toast({
            title: "Error",
            description: "Ya hay una sesión de caja abierta",
            variant: "destructive",
          })
          return
        }

        const sessionsRef = ref(rtdb, `tenants/${tenantId}/cashier/sessions`)
        const newSessionRef = push(sessionsRef)

        const newSession: Omit<CashierSession, "id"> = {
          startTime: Date.now(),
          initialCash,
          status: "open",
          openedBy: user.displayName || user.email || "Usuario desconocido",
          notes: notes || "",
        }

        await set(newSessionRef, newSession)

        toast({
          title: "Éxito",
          description: "Sesión de caja abierta correctamente",
        })
      } catch (error) {
        console.error("Error opening cashier session:", error)
        toast({
          title: "Error",
          description: "No se pudo abrir la sesión de caja",
          variant: "destructive",
        })
      }
    },
    [currentSession, tenantId, user, toast],
  )

  // Close the current session
  const closeSession = useCallback(
    async (endCash: number, endCard: number, notes?: string) => {
      if (!tenantId || !user || !currentSession) {
        toast({
          title: "Error",
          description: "No hay una sesión de caja abierta",
          variant: "destructive",
        })
        return
      }

      try {
        const sessionRef = ref(rtdb, `tenants/${tenantId}/cashier/sessions/${currentSession.id}`)

        // Calculate difference (expected cash - actual cash)
        const summary = await calculateSessionSummary(currentSession.id)
        const expectedCash = currentSession.initialCash + summary.cashSales
        const difference = endCash - expectedCash

        const updatedSession: Partial<CashierSession> = {
          status: "closed",
          endTime: Date.now(),
          endCash,
          endCard,
          difference,
          closedBy: user.displayName || user.email || "Usuario desconocido",
        }

        if (notes) {
          updatedSession.notes = currentSession.notes
            ? `${currentSession.notes}\n\nNotas de cierre: ${notes}`
            : `Notas de cierre: ${notes}`
        }

        // Update the session
        await set(sessionRef, {
          ...currentSession,
          ...updatedSession,
        })

        toast({
          title: "Éxito",
          description: "Sesión de caja cerrada correctamente",
        })
      } catch (error) {
        console.error("Error closing cashier session:", error)
        toast({
          title: "Error",
          description: "No se pudo cerrar la sesión de caja",
          variant: "destructive",
        })
      }
    },
    [currentSession, tenantId, user, toast],
  )

  // Calculate session summary
  const calculateSessionSummary = useCallback(
    async (sessionId: string): Promise<SessionSummary> => {
      if (!tenantId) {
        return {
          totalSales: 0,
          cashSales: 0,
          cardSales: 0,
          tips: 0,
          orderCount: 0,
        }
      }

      try {
        const session = sessions.find((s) => s.id === sessionId)
        if (!session) throw new Error("Sesión no encontrada")

        // Get all orders for this session
        const orders = await getSessionOrders(sessionId)

        // Calculate totals
        let totalSales = 0
        let cashSales = 0
        let cardSales = 0
        let tips = 0
        let orderCount = 0

        orders.forEach((order) => {
          if (order.status !== "canceled") {
            const orderTotal = order.total || 0
            totalSales += orderTotal

            if (order.paymentMethod === "cash") {
              cashSales += orderTotal
            } else if (order.paymentMethod === "card") {
              cardSales += orderTotal
            }

            if (order.tip) {
              tips += order.tip
            }

            orderCount++
          }
        })

        const summary = {
          totalSales,
          cashSales,
          cardSales,
          tips,
          orderCount,
        }

        // Cache the summary
        setSessionSummaries((prev) => ({
          ...prev,
          [sessionId]: summary,
        }))

        return summary
      } catch (error) {
        console.error("Error calculating session summary:", error)
        return {
          totalSales: 0,
          cashSales: 0,
          cardSales: 0,
          tips: 0,
          orderCount: 0,
        }
      }
    },
    [tenantId, sessions],
  )

  // Get session summary (from cache or calculate)
  const getSessionSummary = useCallback(
    (sessionId: string): SessionSummary | null => {
      if (sessionSummaries[sessionId]) {
        return sessionSummaries[sessionId]
      }

      // Calculate and cache for next time
      calculateSessionSummary(sessionId).catch(console.error)
      return null
    },
    [sessionSummaries, calculateSessionSummary],
  )

  // Get all orders for a session
  const getSessionOrders = useCallback(
    async (sessionId: string): Promise<Order[]> => {
      if (!tenantId) return []

      try {
        const session = sessions.find((s) => s.id === sessionId)
        if (!session) throw new Error("Sesión no encontrada")

        // Get all orders
        const ordersRef = ref(rtdb, `tenants/${tenantId}/orders`)
        const snapshot = await get(ordersRef)

        if (!snapshot.exists()) return []

        const ordersData = snapshot.val()
        const allOrders = Object.entries(ordersData).map(([id, data]) => ({
          id,
          ...(data as any),
        })) as Order[]

        // Filter orders by session time range
        const sessionStart = session.startTime
        const sessionEnd = session.endTime || Date.now()

        const sessionOrders = allOrders.filter((order) => {
          const orderTime = order.createdAt
          return orderTime >= sessionStart && orderTime <= sessionEnd
        })

        // Sort by creation time (newest first)
        return sessionOrders.sort((a, b) => b.createdAt - a.createdAt)
      } catch (error) {
        console.error("Error fetching session orders:", error)
        throw new Error("Error al cargar las órdenes de la sesión")
      }
    },
    [tenantId, sessions],
  )

  const value = {
    currentSession,
    sessions,
    isLoading,
    openSession,
    closeSession,
    getSessionSummary,
    getSessionOrders,
  }

  return <CashierContext.Provider value={value}>{children}</CashierContext.Provider>
}

export const useCashier = () => {
  const context = useContext(CashierContext)
  if (context === undefined) {
    throw new Error("useCashier must be used within a CashierProvider")
  }
  return context
}
