import { auth, realtimeDb } from "@/lib/firebase/client"
import { ref, set, get, update, query, orderByChild, equalTo, onValue, off } from "firebase/database"
import type { CashBox, CashMovement, CashCategory, CashBoxSummary } from "@/lib/types/cashier"
import { v4 as uuidv4 } from "uuid"

// Función para crear una nueva caja
export async function createCashBox(tenantId: string, branchId: string, data: Partial<CashBox>): Promise<CashBox> {
  try {
    const user = auth.currentUser
    if (!user) throw new Error("Usuario no autenticado")

    console.log("Iniciando creación de caja para:", { tenantId, branchId })

    // Verificar que realtimeDb esté inicializado
    if (!realtimeDb) {
      console.error("realtimeDb no está inicializado")
      throw new Error("Error de conexión a la base de datos")
    }

    const cashBoxId = uuidv4()
    const cashBoxRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/cashBoxes/${cashBoxId}`)

    const newCashBox: CashBox = {
      id: cashBoxId,
      branchId,
      tenantId,
      name: data.name || "Caja Principal",
      isOpen: false,
      initialAmount: data.initialAmount || 0,
      currentAmount: data.initialAmount || 0,
      expectedAmount: data.initialAmount || 0,
      status: "active",
      createdAt: new Date().toISOString(),
      createdBy: user.uid,
    }

    console.log("Guardando nueva caja:", newCashBox)
    await set(cashBoxRef, newCashBox)
    console.log("Caja guardada exitosamente")
    return newCashBox
  } catch (error: any) {
    console.error("Error al crear caja:", error)
    throw new Error(`Error al crear caja: ${error.message}`)
  }
}

// Función para abrir una caja
export async function openCashBox(
  tenantId: string,
  branchId: string,
  cashBoxId: string,
  initialAmount: number,
  notes?: string,
): Promise<CashBox> {
  try {
    const user = auth.currentUser
    if (!user) throw new Error("Usuario no autenticado")

    const cashBoxRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/cashBoxes/${cashBoxId}`)
    const snapshot = await get(cashBoxRef)

    if (!snapshot.exists()) {
      throw new Error("La caja no existe")
    }

    const cashBox = snapshot.val() as CashBox

    if (cashBox.isOpen) {
      throw new Error("La caja ya está abierta")
    }

    const now = new Date().toISOString()
    const updatedCashBox: Partial<CashBox> = {
      isOpen: true,
      openedAt: now,
      openedBy: user.uid,
      initialAmount,
      currentAmount: initialAmount,
      expectedAmount: initialAmount,
      notes,
    }

    await update(cashBoxRef, updatedCashBox)

    // Registrar movimiento inicial
    const movementId = uuidv4()
    const movementRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/cashMovements/${movementId}`)

    const movement: CashMovement = {
      id: movementId,
      type: "initial",
      amount: initialAmount,
      description: "Monto inicial de caja",
      createdAt: now,
      createdBy: user.uid,
      branchId,
      tenantId,
      cashBoxId,
    }

    await set(movementRef, movement)

    return { ...cashBox, ...updatedCashBox } as CashBox
  } catch (error) {
    console.error("Error al abrir caja:", error)
    throw error
  }
}

// Función para cerrar una caja
export async function closeCashBox(
  tenantId: string,
  branchId: string,
  cashBoxId: string,
  finalAmount: number,
  notes?: string,
): Promise<CashBox> {
  try {
    const user = auth.currentUser
    if (!user) throw new Error("Usuario no autenticado")

    const cashBoxRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/cashBoxes/${cashBoxId}`)
    const snapshot = await get(cashBoxRef)

    if (!snapshot.exists()) {
      throw new Error("La caja no existe")
    }

    const cashBox = snapshot.val() as CashBox

    if (!cashBox.isOpen) {
      throw new Error("La caja no está abierta")
    }

    const now = new Date().toISOString()
    const difference = finalAmount - cashBox.expectedAmount

    const updatedCashBox: Partial<CashBox> = {
      isOpen: false,
      closedAt: now,
      closedBy: user.uid,
      currentAmount: finalAmount,
      difference,
      notes: notes ? (cashBox.notes ? `${cashBox.notes}\n${notes}` : notes) : cashBox.notes,
      status: "closed",
    }

    await update(cashBoxRef, updatedCashBox)

    // Registrar movimiento de cierre
    const movementId = uuidv4()
    const movementRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/cashMovements/${movementId}`)

    const movement: CashMovement = {
      id: movementId,
      type: "closing",
      amount: finalAmount,
      description: `Cierre de caja. Diferencia: ${difference}`,
      createdAt: now,
      createdBy: user.uid,
      branchId,
      tenantId,
      cashBoxId,
    }

    await set(movementRef, movement)

    return { ...cashBox, ...updatedCashBox } as CashBox
  } catch (error) {
    console.error("Error al cerrar caja:", error)
    throw error
  }
}

// Función para registrar un movimiento de caja
export async function addCashMovement(
  tenantId: string,
  branchId: string,
  cashBoxId: string,
  data: Partial<CashMovement>,
): Promise<CashMovement> {
  try {
    const user = auth.currentUser
    if (!user) throw new Error("Usuario no autenticado")

    // Verificar que la caja exista y esté abierta
    const cashBoxRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/cashBoxes/${cashBoxId}`)
    const snapshot = await get(cashBoxRef)

    if (!snapshot.exists()) {
      throw new Error("La caja no existe")
    }

    const cashBox = snapshot.val() as CashBox

    if (!cashBox.isOpen) {
      throw new Error("La caja no está abierta")
    }

    const movementId = uuidv4()
    const movementRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/cashMovements/${movementId}`)

    const now = new Date().toISOString()
    const movement: CashMovement = {
      id: movementId,
      type: data.type || "income",
      amount: data.amount || 0,
      description: data.description || "",
      createdAt: now,
      createdBy: user.uid,
      branchId,
      tenantId,
      cashBoxId,
      paymentMethod: data.paymentMethod,
      category: data.category,
      reference: data.reference,
      attachmentUrl: data.attachmentUrl,
    }

    await set(movementRef, movement)

    // Actualizar el monto actual y esperado de la caja
    let expectedAmount = cashBox.expectedAmount
    if (movement.type === "income") {
      expectedAmount += movement.amount
    } else if (movement.type === "expense") {
      expectedAmount -= movement.amount
    }

    await update(cashBoxRef, { expectedAmount })

    return movement
  } catch (error) {
    console.error("Error al registrar movimiento:", error)
    throw error
  }
}

// Función para obtener una caja por ID
export async function getCashBox(tenantId: string, branchId: string, cashBoxId: string): Promise<CashBox | null> {
  try {
    const cashBoxRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/cashBoxes/${cashBoxId}`)
    const snapshot = await get(cashBoxRef)

    if (!snapshot.exists()) {
      return null
    }

    return snapshot.val() as CashBox
  } catch (error) {
    console.error("Error al obtener caja:", error)
    throw error
  }
}

// Función para obtener todas las cajas de una sucursal
export async function getCashBoxes(tenantId: string, branchId: string): Promise<CashBox[]> {
  try {
    console.log(`Obteniendo cajas para tenant: ${tenantId}, branch: ${branchId}`)

    // Verificar que realtimeDb esté inicializado
    if (!realtimeDb) {
      console.error("realtimeDb no está inicializado")
      throw new Error("Error de conexión a la base de datos")
    }

    const cashBoxesRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/cashBoxes`)
    console.log("Referencia creada:", cashBoxesRef.toString())

    const snapshot = await get(cashBoxesRef)
    console.log("Snapshot obtenido, existe:", snapshot.exists())

    if (!snapshot.exists()) {
      console.log("No hay cajas, devolviendo array vacío")
      return []
    }

    const cashBoxes: CashBox[] = []
    snapshot.forEach((childSnapshot) => {
      const cashBox = childSnapshot.val() as CashBox
      console.log("Caja encontrada:", cashBox.id, cashBox.name)
      cashBoxes.push(cashBox)
    })

    console.log(`Total de cajas encontradas: ${cashBoxes.length}`)
    return cashBoxes
  } catch (error: any) {
    console.error("Error al obtener cajas:", error)
    throw new Error(`Error al obtener cajas: ${error.message}`)
  }
}

// Función para obtener la caja actualmente abierta
export async function getOpenCashBox(tenantId: string, branchId: string): Promise<CashBox | null> {
  try {
    const cashBoxesRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/cashBoxes`)
    const snapshot = await get(cashBoxesRef)

    if (!snapshot.exists()) {
      return null
    }

    let openCashBox: CashBox | null = null
    snapshot.forEach((childSnapshot) => {
      const cashBox = childSnapshot.val() as CashBox
      if (cashBox.isOpen) {
        openCashBox = cashBox
      }
    })

    return openCashBox
  } catch (error) {
    console.error("Error al obtener caja abierta:", error)
    throw error
  }
}

// Función para obtener los movimientos de una caja
export async function getCashMovements(tenantId: string, branchId: string, cashBoxId: string): Promise<CashMovement[]> {
  try {
    const movementsRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/cashMovements`)
    const movementsQuery = query(movementsRef, orderByChild("cashBoxId"), equalTo(cashBoxId))
    const snapshot = await get(movementsQuery)

    if (!snapshot.exists()) {
      return []
    }

    const movements: CashMovement[] = []
    snapshot.forEach((childSnapshot) => {
      movements.push(childSnapshot.val() as CashMovement)
    })

    // Ordenar por fecha de creación (más reciente primero)
    return movements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch (error) {
    console.error("Error al obtener movimientos:", error)
    throw error
  }
}

// Función para obtener un resumen de la caja
export async function getCashBoxSummary(
  tenantId: string,
  branchId: string,
  cashBoxId: string,
): Promise<CashBoxSummary> {
  try {
    const movements = await getCashMovements(tenantId, branchId, cashBoxId)

    const summary: CashBoxSummary = {
      totalIncome: 0,
      totalExpense: 0,
      totalInitial: 0,
      totalClosing: 0,
      balance: 0,
      movementsCount: movements.length,
    }

    movements.forEach((movement) => {
      switch (movement.type) {
        case "income":
          summary.totalIncome += movement.amount
          break
        case "expense":
          summary.totalExpense += movement.amount
          break
        case "initial":
          summary.totalInitial += movement.amount
          break
        case "closing":
          summary.totalClosing += movement.amount
          break
      }
    })

    summary.balance = summary.totalInitial + summary.totalIncome - summary.totalExpense

    return summary
  } catch (error) {
    console.error("Error al obtener resumen de caja:", error)
    throw error
  }
}

// Función para crear una categoría de movimiento
export async function createCashCategory(tenantId: string, data: Partial<CashCategory>): Promise<CashCategory> {
  try {
    const user = auth.currentUser
    if (!user) throw new Error("Usuario no autenticado")

    const categoryId = uuidv4()
    const categoryRef = ref(realtimeDb, `tenants/${tenantId}/cashCategories/${categoryId}`)

    const newCategory: CashCategory = {
      id: categoryId,
      name: data.name || "Nueva Categoría",
      type: data.type || "expense",
      tenantId,
      color: data.color,
      icon: data.icon,
    }

    await set(categoryRef, newCategory)
    return newCategory
  } catch (error) {
    console.error("Error al crear categoría:", error)
    throw error
  }
}

// Función para obtener todas las categorías
export async function getCashCategories(tenantId: string): Promise<CashCategory[]> {
  try {
    const categoriesRef = ref(realtimeDb, `tenants/${tenantId}/cashCategories`)
    const snapshot = await get(categoriesRef)

    if (!snapshot.exists()) {
      return []
    }

    const categories: CashCategory[] = []
    snapshot.forEach((childSnapshot) => {
      categories.push(childSnapshot.val() as CashCategory)
    })

    return categories
  } catch (error) {
    console.error("Error al obtener categorías:", error)
    throw error
  }
}

// Función para escuchar cambios en tiempo real en una caja
export function subscribeToCashBox(
  tenantId: string,
  branchId: string,
  cashBoxId: string,
  callback: (cashBox: CashBox) => void,
): () => void {
  const cashBoxRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/cashBoxes/${cashBoxId}`)

  onValue(cashBoxRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as CashBox)
    }
  })

  // Retornar función para cancelar la suscripción
  return () => off(cashBoxRef)
}

// Función para escuchar cambios en tiempo real en los movimientos de una caja
export function subscribeToCashMovements(
  tenantId: string,
  branchId: string,
  cashBoxId: string,
  callback: (movements: CashMovement[]) => void,
): () => void {
  const movementsRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/cashMovements`)
  const movementsQuery = query(movementsRef, orderByChild("cashBoxId"), equalTo(cashBoxId))

  onValue(movementsQuery, (snapshot) => {
    const movements: CashMovement[] = []

    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        movements.push(childSnapshot.val() as CashMovement)
      })

      // Ordenar por fecha de creación (más reciente primero)
      movements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    callback(movements)
  })

  // Retornar función para cancelar la suscripción
  return () => off(movementsRef)
}
