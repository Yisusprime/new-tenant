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
    if (!currentBranch || !tenantId) return

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
      setError(err.message || "Error al cargar la caja")
      console.error("Error al cargar la caja:", err)
    } finally {
      setLoading(false)
    }
  }, [tenantId, currentBranch, cashBoxId])

  // Cargar todas las cajas
  const loadCashBoxes = useCallback(async () => {
    if (!currentBranch || !tenantId) {
      setCashBoxes([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log("Cargando cajas para:", tenantId, currentBranch.id)
      const boxes = await getCashBoxes(tenantId, currentBranch.id)
      console.log("Cajas cargadas:", boxes)
      setCashBoxes(boxes)
    } catch (err: any) {
      console.error("Error al cargar las cajas:", err)
      setError(err.message || "Error al cargar las cajas")
      setCashBoxes([])
    } finally {
      setLoading(false)
    }
  }, [tenantId, currentBranch])

  // Crear una nueva caja
  const createCashBox = useCallback(
    async (data: Partial<CashBox>) => {
      if (!currentBranch || !tenantId) {
        throw new Error("No hay sucursal o tenant seleccionado")
      }

      try {
        const newBox = await createCashBoxService(tenantId, currentBranch.id, data)
        await loadCashBoxes()
        return newBox
      } catch (err: any) {
        setError(err.message || "Error al crear la caja")
        console.error("Error al crear la caja:", err)
        throw err
      }
    },
    [tenantId, currentBranch, loadCashBoxes],
  )

  // Abrir una caja
  const openCashBox = useCallback(
    async (boxId: string, initialAmount: number, notes?: string) => {
      if (!currentBranch || !tenantId) {
        throw new Error("No hay sucursal o tenant seleccionado")
      }

      try {
        const openedBox = await openCashBoxService(tenantId, currentBranch.id, boxId, initialAmount, notes)
        await loadCashBox()
        return openedBox
      } catch (err: any) {
        setError(err.message || "Error al abrir la caja")
        console.error("Error al abrir la caja:", err)
        throw err
      }
    },
    [tenantId, currentBranch, loadCashBox],
  )

  // Cerrar una caja
  const closeCashBox = useCallback(
    async (boxId: string, finalAmount: number, notes?: string) => {
      if (!currentBranch || !tenantId) {
        throw new Error("No hay sucursal o tenant seleccionado")
      }

      try {
        const closedBox = await closeCashBoxService(tenantId, currentBranch.id, boxId, finalAmount, notes)
        await loadCashBox()
        return closedBox
      } catch (err: any) {
        setError(err.message || "Error al cerrar la caja")
        console.error("Error al cerrar la caja:", err)
        throw err
      }
    },
    [tenantId, currentBranch, loadCashBox],
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
    if (tenantId && currentBranch) {
      console.log("Iniciando carga de datos de caja")
      loadCashBoxes()
      if (cashBoxId) {
        loadCashBox()
      }
    }
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
