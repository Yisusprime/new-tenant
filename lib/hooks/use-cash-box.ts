"use client"

import { useState, useEffect, useCallback } from "react"
import {
  getCashBox,
  getOpenCashBox,
  getCashBoxes,
  getCashMovements,
  getCashBoxSummary,
  subscribeToCashBox,
  subscribeToCashMovements,
  openCashBox as openCashBoxService,
  closeCashBox as closeCashBoxService,
  addCashMovement as addCashMovementService,
  createCashBox as createCashBoxService,
} from "@/lib/services/cashier-service"
import type { CashBox, CashMovement, CashBoxSummary } from "@/lib/types/cashier"
import { useBranch } from "@/lib/context/branch-context"

export function useCashBox(cashBoxId?: string) {
  const { currentBranch, tenantId } = useBranch()
  const [cashBox, setCashBox] = useState<CashBox | null>(null)
  const [cashBoxes, setCashBoxes] = useState<CashBox[]>([])
  const [movements, setMovements] = useState<CashMovement[]>([])
  const [summary, setSummary] = useState<CashBoxSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar la caja actual o la caja abierta
  const loadCashBox = useCallback(async () => {
    if (!currentBranch || !tenantId) {
      setLoading(false) // Importante: terminar la carga si no hay branch o tenant
      return
    }

    try {
      setLoading(true)
      setError(null)

      let box: CashBox | null = null

      if (cashBoxId) {
        // Cargar caja específica
        box = await getCashBox(tenantId, currentBranch.id, cashBoxId)
      } else {
        // Cargar caja abierta
        box = await getOpenCashBox(tenantId, currentBranch.id)
      }

      setCashBox(box)

      // Si hay una caja, cargar sus movimientos y resumen
      if (box) {
        const boxMovements = await getCashMovements(tenantId, currentBranch.id, box.id)
        setMovements(boxMovements)

        const boxSummary = await getCashBoxSummary(tenantId, currentBranch.id, box.id)
        setSummary(boxSummary)
      }
    } catch (err: any) {
      console.error("Error al cargar la caja:", err)
      setError(err.message || "Error al cargar la caja")
    } finally {
      setLoading(false) // Siempre terminar la carga, incluso si hay error
    }
  }, [tenantId, currentBranch, cashBoxId])

  // Cargar todas las cajas
  const loadCashBoxes = useCallback(async () => {
    if (!currentBranch || !tenantId) {
      console.log("No hay branch o tenant seleccionado, terminando carga")
      setCashBoxes([])
      setLoading(false) // Importante: terminar la carga si no hay branch o tenant
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log(`Cargando cajas para tenant: ${tenantId}, branch: ${currentBranch.id}`)

      // Forzar un timeout para evitar carga infinita
      const timeoutPromise = new Promise<CashBox[]>((_, reject) => {
        setTimeout(() => reject(new Error("Tiempo de espera agotado")), 10000)
      })

      // Intentar obtener las cajas con un timeout
      const boxes = await Promise.race([getCashBoxes(tenantId, currentBranch.id), timeoutPromise])

      console.log(`Cajas cargadas: ${boxes.length}`)
      setCashBoxes(boxes)
    } catch (err: any) {
      console.error("Error al cargar las cajas:", err)
      setError(err.message || "Error al cargar las cajas")
      setCashBoxes([]) // Establecer un array vacío en caso de error
    } finally {
      setLoading(false) // Siempre terminar la carga, incluso si hay error
    }
  }, [tenantId, currentBranch])

  // Crear una nueva caja
  const createCashBox = useCallback(
    async (data: Partial<CashBox>) => {
      if (!currentBranch || !tenantId) {
        throw new Error("No hay sucursal o tenant seleccionado")
      }

      try {
        console.log("Creando nueva caja con datos:", data)
        const newBox = await createCashBoxService(tenantId, currentBranch.id, data)
        console.log("Caja creada:", newBox)

        // Actualizar la lista de cajas inmediatamente sin esperar a loadCashBoxes
        setCashBoxes((prev) => [...prev, newBox])

        return newBox
      } catch (err: any) {
        console.error("Error al crear la caja:", err)
        setError(err.message || "Error al crear la caja")
        throw err
      }
    },
    [tenantId, currentBranch],
  )

  // Abrir una caja
  const openCashBox = useCallback(
    async (boxId: string, initialAmount: number, notes?: string) => {
      if (!currentBranch || !tenantId) {
        throw new Error("No hay sucursal o tenant seleccionado")
      }

      try {
        const openedBox = await openCashBoxService(tenantId, currentBranch.id, boxId, initialAmount, notes)

        // Actualizar la caja en la lista inmediatamente
        setCashBoxes((prev) => prev.map((box) => (box.id === boxId ? openedBox : box)))

        if (cashBoxId === boxId) {
          setCashBox(openedBox)
        }

        return openedBox
      } catch (err: any) {
        setError(err.message || "Error al abrir la caja")
        console.error("Error al abrir la caja:", err)
        throw err
      }
    },
    [tenantId, currentBranch, cashBoxId],
  )

  // Cerrar una caja
  const closeCashBox = useCallback(
    async (boxId: string, finalAmount: number, notes?: string) => {
      if (!currentBranch || !tenantId) {
        throw new Error("No hay sucursal o tenant seleccionado")
      }

      try {
        const closedBox = await closeCashBoxService(tenantId, currentBranch.id, boxId, finalAmount, notes)

        // Actualizar la caja en la lista inmediatamente
        setCashBoxes((prev) => prev.map((box) => (box.id === boxId ? closedBox : box)))

        if (cashBoxId === boxId) {
          setCashBox(closedBox)
        }

        return closedBox
      } catch (err: any) {
        setError(err.message || "Error al cerrar la caja")
        console.error("Error al cerrar la caja:", err)
        throw err
      }
    },
    [tenantId, currentBranch, cashBoxId],
  )

  // Añadir un movimiento a la caja
  const addCashMovement = useCallback(
    async (boxId: string, data: Partial<CashMovement>) => {
      if (!currentBranch || !tenantId) {
        throw new Error("No hay sucursal o tenant seleccionado")
      }

      try {
        const movement = await addCashMovementService(tenantId, currentBranch.id, boxId, data)
        return movement
      } catch (err: any) {
        setError(err.message || "Error al añadir movimiento")
        console.error("Error al añadir movimiento:", err)
        throw err
      }
    },
    [tenantId, currentBranch],
  )

  // Suscribirse a cambios en tiempo real
  useEffect(() => {
    if (!currentBranch || !tenantId || !cashBox) return

    // Suscribirse a cambios en la caja
    const unsubscribeBox = subscribeToCashBox(tenantId, currentBranch.id, cashBox.id, (updatedBox) => {
      setCashBox(updatedBox)
    })

    // Suscribirse a cambios en los movimientos
    const unsubscribeMovements = subscribeToCashMovements(
      tenantId,
      currentBranch.id,
      cashBox.id,
      (updatedMovements) => {
        setMovements(updatedMovements)

        // Recalcular el resumen
        const newSummary: CashBoxSummary = {
          totalIncome: 0,
          totalExpense: 0,
          totalInitial: 0,
          totalClosing: 0,
          balance: 0,
          movementsCount: updatedMovements.length,
        }

        updatedMovements.forEach((movement) => {
          switch (movement.type) {
            case "income":
              newSummary.totalIncome += movement.amount
              break
            case "expense":
              newSummary.totalExpense += movement.amount
              break
            case "initial":
              newSummary.totalInitial += movement.amount
              break
            case "closing":
              newSummary.totalClosing += movement.amount
              break
          }
        })

        newSummary.balance = newSummary.totalInitial + newSummary.totalIncome - newSummary.totalExpense
        setSummary(newSummary)
      },
    )

    return () => {
      unsubscribeBox()
      unsubscribeMovements()
    }
  }, [tenantId, currentBranch, cashBox])

  // Cargar datos iniciales
  useEffect(() => {
    console.log("Efecto de carga inicial:", { tenantId, branchId: currentBranch?.id })

    // Establecer un timeout para evitar carga infinita
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log("Timeout de carga alcanzado, forzando fin de carga")
        setLoading(false)
        setError("Tiempo de espera agotado. Por favor, intenta recargar la página.")
      }
    }, 15000) // 15 segundos máximo de carga

    if (tenantId && currentBranch) {
      loadCashBoxes()
      if (cashBoxId) {
        loadCashBox()
      }
    } else {
      // Si no hay tenant o branch, terminar la carga
      setLoading(false)
    }

    return () => clearTimeout(timeoutId)
  }, [loadCashBox, loadCashBoxes, tenantId, currentBranch, cashBoxId])

  return {
    cashBox,
    cashBoxes,
    movements,
    summary,
    loading,
    error,
    loadCashBox,
    loadCashBoxes,
    createCashBox,
    openCashBox,
    closeCashBox,
    addCashMovement,
  }
}
