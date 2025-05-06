"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { collection, addDoc, query, orderBy, serverTimestamp, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase-config"
import { useAuth } from "@/lib/auth-context"
import type { InventoryMovement } from "@/lib/types/inventory"
import { useToast } from "@/components/ui/use-toast"
import { useIngredients } from "./ingredient-context"

interface InventoryMovementContextType {
  movements: InventoryMovement[]
  loading: boolean
  error: string | null
  addMovement: (movement: Omit<InventoryMovement, "id" | "createdAt">) => Promise<string>
  getMovementsByIngredient: (ingredientId: string) => InventoryMovement[]
  getMovementsByType: (type: "purchase" | "consumption" | "waste" | "adjustment") => InventoryMovement[]
  getMovementsByDateRange: (startDate: Date, endDate: Date) => InventoryMovement[]
  registerConsumption: (ingredientId: string, quantity: number, notes?: string) => Promise<void>
  registerWaste: (ingredientId: string, quantity: number, reason: string) => Promise<void>
  registerAdjustment: (ingredientId: string, quantity: number, notes: string) => Promise<void>
}

const InventoryMovementContext = createContext<InventoryMovementContextType | undefined>(undefined)

export function InventoryMovementProvider({ children, tenantId }: { children: ReactNode; tenantId: string }) {
  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()
  const { getIngredientById, updateIngredient } = useIngredients()

  useEffect(() => {
    if (!tenantId) return

    setLoading(true)
    const movementsRef = collection(db, `tenants/${tenantId}/inventory-movements`)
    const q = query(movementsRef, orderBy("date", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const movementsList: InventoryMovement[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          movementsList.push({
            id: doc.id,
            ingredientId: data.ingredientId,
            ingredientName: data.ingredientName,
            date: data.date?.toDate(),
            quantity: data.quantity,
            type: data.type,
            referenceId: data.referenceId,
            notes: data.notes,
            createdBy: data.createdBy,
            createdAt: data.createdAt?.toDate(),
          })
        })
        setMovements(movementsList)
        setLoading(false)
      },
      (err) => {
        console.error("Error al obtener movimientos:", err)
        setError("Error al cargar los movimientos de inventario. Por favor, intenta de nuevo.")
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [tenantId])

  const addMovement = async (movement: Omit<InventoryMovement, "id" | "createdAt">) => {
    try {
      const movementsRef = collection(db, `tenants/${tenantId}/inventory-movements`)
      const newMovement = {
        ...movement,
        createdAt: serverTimestamp(),
      }
      const docRef = await addDoc(movementsRef, newMovement)
      return docRef.id
    } catch (err: any) {
      console.error("Error al añadir movimiento:", err)
      setError(err.message)
      toast({
        title: "Error",
        description: "No se pudo registrar el movimiento de inventario. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
      throw err
    }
  }

  const getMovementsByIngredient = (ingredientId: string) => {
    return movements.filter((movement) => movement.ingredientId === ingredientId)
  }

  const getMovementsByType = (type: "purchase" | "consumption" | "waste" | "adjustment") => {
    return movements.filter((movement) => movement.type === type)
  }

  const getMovementsByDateRange = (startDate: Date, endDate: Date) => {
    return movements.filter((movement) => movement.date >= startDate && movement.date <= endDate)
  }

  // Registrar consumo de ingrediente
  const registerConsumption = async (ingredientId: string, quantity: number, notes?: string) => {
    try {
      const ingredient = getIngredientById(ingredientId)
      if (!ingredient) throw new Error("Ingrediente no encontrado")

      if (ingredient.stock < quantity) {
        throw new Error(`Stock insuficiente. Solo hay ${ingredient.stock} ${ingredient.unit} disponibles.`)
      }

      // Actualizar el stock del ingrediente
      const newStock = ingredient.stock - quantity
      await updateIngredient(ingredientId, { stock: newStock })

      // Registrar el movimiento (cantidad negativa para consumo)
      await addMovement({
        ingredientId,
        ingredientName: ingredient.name,
        date: new Date(),
        quantity: -quantity, // Negativo para salidas
        type: "consumption",
        notes: notes || "Consumo de ingrediente",
        createdBy: user?.uid || "unknown",
      })

      toast({
        title: "Consumo registrado",
        description: `Se ha registrado el consumo de ${quantity} ${ingredient.unit} de ${ingredient.name}.`,
      })
    } catch (err: any) {
      console.error("Error al registrar consumo:", err)
      toast({
        title: "Error",
        description: err.message || "No se pudo registrar el consumo. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
      throw err
    }
  }

  // Registrar desperdicio de ingrediente
  const registerWaste = async (ingredientId: string, quantity: number, reason: string) => {
    try {
      const ingredient = getIngredientById(ingredientId)
      if (!ingredient) throw new Error("Ingrediente no encontrado")

      if (ingredient.stock < quantity) {
        throw new Error(`Stock insuficiente. Solo hay ${ingredient.stock} ${ingredient.unit} disponibles.`)
      }

      // Actualizar el stock del ingrediente
      const newStock = ingredient.stock - quantity
      await updateIngredient(ingredientId, { stock: newStock })

      // Registrar el movimiento (cantidad negativa para desperdicio)
      await addMovement({
        ingredientId,
        ingredientName: ingredient.name,
        date: new Date(),
        quantity: -quantity, // Negativo para salidas
        type: "waste",
        notes: `Desperdicio: ${reason}`,
        createdBy: user?.uid || "unknown",
      })

      // Registrar en la colección de desperdicios
      const wastesRef = collection(db, `tenants/${tenantId}/wastes`)
      await addDoc(wastesRef, {
        ingredientId,
        ingredientName: ingredient.name,
        quantity,
        reason,
        date: new Date(),
        reportedBy: user?.uid,
        cost: ingredient.cost * quantity,
        createdAt: serverTimestamp(),
      })

      toast({
        title: "Desperdicio registrado",
        description: `Se ha registrado el desperdicio de ${quantity} ${ingredient.unit} de ${ingredient.name}.`,
      })
    } catch (err: any) {
      console.error("Error al registrar desperdicio:", err)
      toast({
        title: "Error",
        description: err.message || "No se pudo registrar el desperdicio. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
      throw err
    }
  }

  // Registrar ajuste de inventario
  const registerAdjustment = async (ingredientId: string, quantity: number, notes: string) => {
    try {
      const ingredient = getIngredientById(ingredientId)
      if (!ingredient) throw new Error("Ingrediente no encontrado")

      // Si es un ajuste negativo, verificar que haya suficiente stock
      if (quantity < 0 && ingredient.stock < Math.abs(quantity)) {
        throw new Error(
          `Stock insuficiente para el ajuste. Solo hay ${ingredient.stock} ${ingredient.unit} disponibles.`,
        )
      }

      // Actualizar el stock del ingrediente
      const newStock = ingredient.stock + quantity
      await updateIngredient(ingredientId, { stock: newStock })

      // Registrar el movimiento
      await addMovement({
        ingredientId,
        ingredientName: ingredient.name,
        date: new Date(),
        quantity, // Puede ser positivo o negativo
        type: "adjustment",
        notes: `Ajuste: ${notes}`,
        createdBy: user?.uid || "unknown",
      })

      toast({
        title: "Ajuste registrado",
        description: `Se ha registrado un ajuste de ${quantity > 0 ? "+" : ""}${quantity} ${ingredient.unit} de ${ingredient.name}.`,
      })
    } catch (err: any) {
      console.error("Error al registrar ajuste:", err)
      toast({
        title: "Error",
        description: err.message || "No se pudo registrar el ajuste. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
      throw err
    }
  }

  return (
    <InventoryMovementContext.Provider
      value={{
        movements,
        loading,
        error,
        addMovement,
        getMovementsByIngredient,
        getMovementsByType,
        getMovementsByDateRange,
        registerConsumption,
        registerWaste,
        registerAdjustment,
      }}
    >
      {children}
    </InventoryMovementContext.Provider>
  )
}

export function useInventoryMovements() {
  const context = useContext(InventoryMovementContext)
  if (context === undefined) {
    throw new Error("useInventoryMovements debe ser usado dentro de un InventoryMovementProvider")
  }
  return context
}
