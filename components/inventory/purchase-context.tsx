"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore"
import { db } from "@/lib/firebase-config"
import { useAuth } from "@/lib/auth-context"
import type { Purchase } from "@/lib/types/inventory"
import { useToast } from "@/components/ui/use-toast"
import { useIngredients } from "./ingredient-context"

interface PurchaseContextType {
  purchases: Purchase[]
  loading: boolean
  error: string | null
  addPurchase: (purchase: Omit<Purchase, "id" | "createdAt" | "updatedAt">) => Promise<string>
  updatePurchase: (id: string, purchase: Partial<Purchase>) => Promise<void>
  deletePurchase: (id: string) => Promise<void>
  getPurchaseById: (id: string) => Purchase | undefined
  receivePurchase: (id: string, receivedItems: { id: string; received: number }[]) => Promise<void>
}

const PurchaseContext = createContext<PurchaseContextType | undefined>(undefined)

export function PurchaseProvider({ children, tenantId }: { children: ReactNode; tenantId: string }) {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()
  const { updateIngredient, getIngredientById } = useIngredients()

  useEffect(() => {
    if (!tenantId) return

    setLoading(true)
    const purchasesRef = collection(db, `tenants/${tenantId}/purchases`)
    const q = query(purchasesRef, orderBy("orderDate", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const purchasesList: Purchase[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          purchasesList.push({
            id: doc.id,
            supplierId: data.supplierId,
            supplierName: data.supplierName,
            orderDate: data.orderDate?.toDate(),
            deliveryDate: data.deliveryDate?.toDate(),
            status: data.status,
            items: data.items,
            totalAmount: data.totalAmount,
            paymentStatus: data.paymentStatus,
            paymentMethod: data.paymentMethod,
            notes: data.notes,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            receivedBy: data.receivedBy,
          })
        })
        setPurchases(purchasesList)
        setLoading(false)
      },
      (err) => {
        console.error("Error al obtener compras:", err)
        setError("Error al cargar las compras. Por favor, intenta de nuevo.")
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [tenantId])

  const addPurchase = async (purchase: Omit<Purchase, "id" | "createdAt" | "updatedAt">) => {
    try {
      const purchasesRef = collection(db, `tenants/${tenantId}/purchases`)
      const newPurchase = {
        ...purchase,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
      const docRef = await addDoc(purchasesRef, newPurchase)
      toast({
        title: "Compra registrada",
        description: `La compra ha sido registrada correctamente.`,
      })
      return docRef.id
    } catch (err: any) {
      console.error("Error al añadir compra:", err)
      setError(err.message)
      toast({
        title: "Error",
        description: "No se pudo registrar la compra. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
      throw err
    }
  }

  const updatePurchase = async (id: string, purchase: Partial<Purchase>) => {
    try {
      const purchaseRef = doc(db, `tenants/${tenantId}/purchases/${id}`)
      await updateDoc(purchaseRef, {
        ...purchase,
        updatedAt: serverTimestamp(),
      })
      toast({
        title: "Compra actualizada",
        description: "La compra ha sido actualizada correctamente.",
      })
    } catch (err: any) {
      console.error("Error al actualizar compra:", err)
      setError(err.message)
      toast({
        title: "Error",
        description: "No se pudo actualizar la compra. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
      throw err
    }
  }

  const deletePurchase = async (id: string) => {
    try {
      const purchaseRef = doc(db, `tenants/${tenantId}/purchases/${id}`)
      await deleteDoc(purchaseRef)
      toast({
        title: "Compra eliminada",
        description: "La compra ha sido eliminada correctamente.",
      })
    } catch (err: any) {
      console.error("Error al eliminar compra:", err)
      setError(err.message)
      toast({
        title: "Error",
        description: "No se pudo eliminar la compra. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
      throw err
    }
  }

  const getPurchaseById = (id: string) => {
    return purchases.find((purchase) => purchase.id === id)
  }

  // Función para recibir una compra y actualizar el inventario
  const receivePurchase = async (id: string, receivedItems: { id: string; received: number }[]) => {
    try {
      const purchase = getPurchaseById(id)
      if (!purchase) throw new Error("Compra no encontrada")

      // Actualizar el estado de la compra
      const purchaseRef = doc(db, `tenants/${tenantId}/purchases/${id}`)

      // Crear un mapa de items recibidos para facilitar el acceso
      const receivedItemsMap = receivedItems.reduce(
        (acc, item) => {
          acc[item.id] = item.received
          return acc
        },
        {} as Record<string, number>,
      )

      // Actualizar los items de la compra con las cantidades recibidas
      const updatedItems = purchase.items.map((item) => ({
        ...item,
        received: receivedItemsMap[item.ingredientId] || 0,
      }))

      // Determinar el estado de la compra basado en lo recibido
      let allReceived = true
      let anyReceived = false

      for (const item of updatedItems) {
        if (item.received < item.quantity) allReceived = false
        if (item.received > 0) anyReceived = true
      }

      let status: "pending" | "delivered" | "partial" | "cancelled" = "pending"
      if (allReceived) status = "delivered"
      else if (anyReceived) status = "partial"

      // Actualizar la compra
      await updateDoc(purchaseRef, {
        status,
        items: updatedItems,
        deliveryDate: serverTimestamp(),
        receivedBy: user?.uid,
        updatedAt: serverTimestamp(),
      })

      // Actualizar el inventario para cada ingrediente recibido
      const movementsRef = collection(db, `tenants/${tenantId}/inventory-movements`)

      for (const receivedItem of receivedItems) {
        if (receivedItem.received <= 0) continue

        const ingredient = getIngredientById(receivedItem.id)
        if (!ingredient) continue

        // Actualizar el stock del ingrediente
        const newStock = ingredient.stock + receivedItem.received
        await updateIngredient(receivedItem.id, { stock: newStock })

        // Registrar el movimiento de inventario
        const purchaseItem = purchase.items.find((item) => item.ingredientId === receivedItem.id)
        if (!purchaseItem) continue

        // Crear movimiento de inventario
        await addDoc(movementsRef, {
          ingredientId: receivedItem.id,
          ingredientName: purchaseItem.ingredientName,
          date: new Date(),
          quantity: receivedItem.received,
          type: "purchase",
          referenceId: id,
          notes: `Recepción de compra #${id}`,
          createdBy: user?.uid,
          createdAt: serverTimestamp(),
        })
      }

      toast({
        title: "Compra recibida",
        description: "La compra ha sido recibida y el inventario actualizado correctamente.",
      })
    } catch (err: any) {
      console.error("Error al recibir compra:", err)
      setError(err.message)
      toast({
        title: "Error",
        description: "No se pudo procesar la recepción de la compra. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
      throw err
    }
  }

  return (
    <PurchaseContext.Provider
      value={{
        purchases,
        loading,
        error,
        addPurchase,
        updatePurchase,
        deletePurchase,
        getPurchaseById,
        receivePurchase,
      }}
    >
      {children}
    </PurchaseContext.Provider>
  )
}

export function usePurchases() {
  const context = useContext(PurchaseContext)
  if (context === undefined) {
    throw new Error("usePurchases debe ser usado dentro de un PurchaseProvider")
  }
  return context
}
