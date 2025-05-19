import { db } from "@/lib/firebase/client"
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from "firebase/firestore"
import type { InventoryItem, PurchaseRecord, InventoryCategory, InventoryMovement } from "@/lib/types/inventory"

// Función para obtener todos los items del inventario
export async function getInventoryItems(tenantId: string, branchId: string): Promise<InventoryItem[]> {
  try {
    const itemsCollection = collection(db, `tenants/${tenantId}/branches/${branchId}/inventory_items`)
    const snapshot = await getDocs(itemsCollection)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as InventoryItem[]
  } catch (error) {
    console.error("Error al obtener items del inventario:", error)
    throw error
  }
}

// Función para obtener un item específico del inventario
export async function getInventoryItem(
  tenantId: string,
  branchId: string,
  itemId: string,
): Promise<InventoryItem | null> {
  try {
    const itemRef = doc(db, `tenants/${tenantId}/branches/${branchId}/inventory_items/${itemId}`)
    const snapshot = await getDoc(itemRef)

    if (!snapshot.exists()) {
      return null
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as InventoryItem
  } catch (error) {
    console.error("Error al obtener item del inventario:", error)
    throw error
  }
}

// Función para crear un nuevo item en el inventario
export async function createInventoryItem(
  tenantId: string,
  branchId: string,
  item: Omit<InventoryItem, "id" | "lastUpdated">,
): Promise<InventoryItem> {
  try {
    const itemsCollection = collection(db, `tenants/${tenantId}/branches/${branchId}/inventory_items`)
    const newItem = {
      ...item,
      lastUpdated: new Date().toISOString(),
    }

    const docRef = await addDoc(itemsCollection, newItem)

    return {
      id: docRef.id,
      ...newItem,
    } as InventoryItem
  } catch (error) {
    console.error("Error al crear item del inventario:", error)
    throw error
  }
}

// Función para actualizar un item del inventario
export async function updateInventoryItem(
  tenantId: string,
  branchId: string,
  itemId: string,
  updates: Partial<InventoryItem>,
): Promise<InventoryItem> {
  try {
    const itemRef = doc(db, `tenants/${tenantId}/branches/${branchId}/inventory_items/${itemId}`)

    const updatedData = {
      ...updates,
      lastUpdated: new Date().toISOString(),
    }

    await updateDoc(itemRef, updatedData)

    const updatedSnapshot = await getDoc(itemRef)

    return {
      id: updatedSnapshot.id,
      ...updatedSnapshot.data(),
    } as InventoryItem
  } catch (error) {
    console.error("Error al actualizar item del inventario:", error)
    throw error
  }
}

// Función para eliminar un item del inventario
export async function deleteInventoryItem(tenantId: string, branchId: string, itemId: string): Promise<void> {
  try {
    const itemRef = doc(db, `tenants/${tenantId}/branches/${branchId}/inventory_items/${itemId}`)
    await deleteDoc(itemRef)
  } catch (error) {
    console.error("Error al eliminar item del inventario:", error)
    throw error
  }
}

// Función para registrar una compra de inventario
export async function registerPurchase(
  tenantId: string,
  branchId: string,
  purchase: Omit<PurchaseRecord, "id">,
): Promise<PurchaseRecord> {
  try {
    // 1. Registrar la compra
    const purchasesCollection = collection(db, `tenants/${tenantId}/branches/${branchId}/inventory_purchases`)
    const purchaseData = {
      ...purchase,
      date: purchase.date || new Date().toISOString(),
    }

    const purchaseRef = await addDoc(purchasesCollection, purchaseData)

    // 2. Actualizar el stock y costo del item
    const itemRef = doc(db, `tenants/${tenantId}/branches/${branchId}/inventory_items/${purchase.itemId}`)
    const itemSnapshot = await getDoc(itemRef)

    if (itemSnapshot.exists()) {
      const itemData = itemSnapshot.data() as InventoryItem

      // Calcular nuevo stock
      const newStock = itemData.currentStock + purchase.quantity

      // Calcular nuevo costo promedio ponderado
      const currentValue = itemData.currentStock * itemData.costPerUnit
      const newValue = purchase.totalCost
      const newCostPerUnit = (currentValue + newValue) / newStock

      // Actualizar el item
      await updateDoc(itemRef, {
        currentStock: newStock,
        costPerUnit: newCostPerUnit,
        lastUpdated: new Date().toISOString(),
      })

      // 3. Registrar el movimiento de inventario
      await registerInventoryMovement(tenantId, branchId, {
        itemId: purchase.itemId,
        date: purchase.date || new Date().toISOString(),
        quantity: purchase.quantity,
        type: "purchase",
        reference: purchaseRef.id,
        notes: `Compra: ${purchase.invoiceNumber || "Sin factura"}`,
      })
    }

    return {
      id: purchaseRef.id,
      ...purchaseData,
    } as PurchaseRecord
  } catch (error) {
    console.error("Error al registrar compra:", error)
    throw error
  }
}

// Función para obtener el historial de compras de un item
export async function getItemPurchaseHistory(
  tenantId: string,
  branchId: string,
  itemId: string,
): Promise<PurchaseRecord[]> {
  try {
    const purchasesCollection = collection(db, `tenants/${tenantId}/branches/${branchId}/inventory_purchases`)
    // Usamos solo el filtro where sin orderBy para evitar necesitar un índice compuesto
    const q = query(purchasesCollection, where("itemId", "==", itemId))

    const snapshot = await getDocs(q)

    // Ordenamos los resultados en memoria después de obtenerlos
    const results = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as PurchaseRecord[]

    // Ordenar por fecha descendente (más reciente primero)
    return results.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateB - dateA
    })
  } catch (error) {
    console.error("Error al obtener historial de compras:", error)
    throw error
  }
}

// Función para registrar un movimiento de inventario
export async function registerInventoryMovement(
  tenantId: string,
  branchId: string,
  movement: Omit<InventoryMovement, "id">,
): Promise<InventoryMovement> {
  try {
    const movementsCollection = collection(db, `tenants/${tenantId}/branches/${branchId}/inventory_movements`)
    const movementData = {
      ...movement,
      date: movement.date || new Date().toISOString(),
    }

    const movementRef = await addDoc(movementsCollection, movementData)

    // Si no es una compra (que ya actualiza el stock), actualizar el stock del item
    if (movement.type !== "purchase") {
      const itemRef = doc(db, `tenants/${tenantId}/branches/${branchId}/inventory_items/${movement.itemId}`)
      const itemSnapshot = await getDoc(itemRef)

      if (itemSnapshot.exists()) {
        const itemData = itemSnapshot.data() as InventoryItem
        const newStock = itemData.currentStock + movement.quantity

        await updateDoc(itemRef, {
          currentStock: newStock,
          lastUpdated: new Date().toISOString(),
        })
      }
    }

    return {
      id: movementRef.id,
      ...movementData,
    } as InventoryMovement
  } catch (error) {
    console.error("Error al registrar movimiento de inventario:", error)
    throw error
  }
}

// Función para obtener los movimientos de un item
export async function getItemMovements(
  tenantId: string,
  branchId: string,
  itemId: string,
): Promise<InventoryMovement[]> {
  try {
    const movementsCollection = collection(db, `tenants/${tenantId}/branches/${branchId}/inventory_movements`)
    // Usamos solo el filtro where sin orderBy para evitar necesitar un índice compuesto
    const q = query(movementsCollection, where("itemId", "==", itemId))

    const snapshot = await getDocs(q)

    // Ordenamos los resultados en memoria después de obtenerlos
    const results = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as InventoryMovement[]

    // Ordenar por fecha descendente (más reciente primero)
    return results.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateB - dateA
    })
  } catch (error) {
    console.error("Error al obtener movimientos del item:", error)
    throw error
  }
}

// Función para obtener categorías de inventario
export async function getInventoryCategories(tenantId: string, branchId: string): Promise<InventoryCategory[]> {
  try {
    const categoriesCollection = collection(db, `tenants/${tenantId}/branches/${branchId}/inventory_categories`)
    const snapshot = await getDocs(categoriesCollection)

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as InventoryCategory[]
  } catch (error) {
    console.error("Error al obtener categorías de inventario:", error)
    throw error
  }
}

// Función para crear una categoría de inventario
export async function createInventoryCategory(
  tenantId: string,
  branchId: string,
  category: Omit<InventoryCategory, "id">,
): Promise<InventoryCategory> {
  try {
    const categoriesCollection = collection(db, `tenants/${tenantId}/branches/${branchId}/inventory_categories`)
    const docRef = await addDoc(categoriesCollection, category)

    return {
      id: docRef.id,
      ...category,
    } as InventoryCategory
  } catch (error) {
    console.error("Error al crear categoría de inventario:", error)
    throw error
  }
}

// Función para registrar consumo de inventario (por ejemplo, al usar en una receta)
export async function registerConsumption(
  tenantId: string,
  branchId: string,
  itemId: string,
  quantity: number,
  reference?: string,
  notes?: string,
): Promise<void> {
  try {
    // Registrar el movimiento de inventario (cantidad negativa para consumo)
    await registerInventoryMovement(tenantId, branchId, {
      itemId,
      date: new Date().toISOString(),
      quantity: -Math.abs(quantity), // Asegurar que sea negativo
      type: "consumption",
      reference,
      notes,
    })
  } catch (error) {
    console.error("Error al registrar consumo:", error)
    throw error
  }
}
