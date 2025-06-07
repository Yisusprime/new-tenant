import { db } from "@/lib/firebase/client"
import { realtimeDb } from "@/lib/firebase/client"
import { ref, get } from "firebase/database"
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore"
import type { Expense, ExpenseCategory, FinancialSummary } from "@/lib/types/finance"
import type { CashMovement } from "@/lib/types/cash-register"

// Función para obtener todos los gastos
export async function getExpenses(tenantId: string, branchId: string): Promise<Expense[]> {
  try {
    const expensesCollection = collection(db, `tenants/${tenantId}/branches/${branchId}/expenses`)
    const q = query(expensesCollection, orderBy("date", "desc"))
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Expense[]
  } catch (error) {
    console.error("Error al obtener gastos:", error)
    throw error
  }
}

// Función para obtener un gasto específico
export async function getExpense(tenantId: string, branchId: string, expenseId: string): Promise<Expense | null> {
  try {
    const expenseRef = doc(db, `tenants/${tenantId}/branches/${branchId}/expenses/${expenseId}`)
    const snapshot = await getDoc(expenseRef)

    if (!snapshot.exists()) {
      return null
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as Expense
  } catch (error) {
    console.error("Error al obtener gasto:", error)
    throw error
  }
}

// Función para crear un nuevo gasto
export async function createExpense(
  tenantId: string,
  branchId: string,
  expense: Omit<Expense, "id" | "createdAt" | "updatedAt">,
): Promise<Expense> {
  try {
    const timestamp = new Date().toISOString()
    const expensesCollection = collection(db, `tenants/${tenantId}/branches/${branchId}/expenses`)

    const newExpense = {
      ...expense,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    const docRef = await addDoc(expensesCollection, newExpense)

    // Si el gasto está relacionado con un item de inventario, actualizar la referencia
    if (expense.inventoryItemId) {
      // Aquí podrías agregar lógica adicional para actualizar el item de inventario si es necesario
    }

    return {
      id: docRef.id,
      ...newExpense,
    } as Expense
  } catch (error) {
    console.error("Error al crear gasto:", error)
    throw error
  }
}

// Función para actualizar un gasto
export async function updateExpense(
  tenantId: string,
  branchId: string,
  expenseId: string,
  updates: Partial<Expense>,
): Promise<Expense> {
  try {
    const timestamp = new Date().toISOString()
    const expenseRef = doc(db, `tenants/${tenantId}/branches/${branchId}/expenses/${expenseId}`)

    const updatedData = {
      ...updates,
      updatedAt: timestamp,
    }

    await updateDoc(expenseRef, updatedData)

    const updatedSnapshot = await getDoc(expenseRef)

    return {
      id: updatedSnapshot.id,
      ...updatedSnapshot.data(),
    } as Expense
  } catch (error) {
    console.error("Error al actualizar gasto:", error)
    throw error
  }
}

// Función para eliminar un gasto
export async function deleteExpense(tenantId: string, branchId: string, expenseId: string): Promise<void> {
  try {
    const expenseRef = doc(db, `tenants/${tenantId}/branches/${branchId}/expenses/${expenseId}`)
    await deleteDoc(expenseRef)
  } catch (error) {
    console.error("Error al eliminar gasto:", error)
    throw error
  }
}

// Función para obtener categorías de gastos
export async function getExpenseCategories(tenantId: string, branchId: string): Promise<ExpenseCategory[]> {
  try {
    const categoriesCollection = collection(db, `tenants/${tenantId}/branches/${branchId}/expenseCategories`)
    const snapshot = await getDocs(categoriesCollection)

    // Si no hay categorías, crear algunas por defecto
    if (snapshot.empty) {
      const defaultCategories = [
        { name: "Insumos", description: "Materias primas e insumos", color: "#3B82F6", isActive: true },
        { name: "Servicios", description: "Luz, agua, internet, etc.", color: "#10B981", isActive: true },
        { name: "Salarios", description: "Sueldos y pagos a personal", color: "#F59E0B", isActive: true },
        { name: "Alquiler", description: "Alquiler del local", color: "#8B5CF6", isActive: true },
        { name: "Marketing", description: "Publicidad y promoción", color: "#EC4899", isActive: true },
        { name: "Impuestos", description: "Impuestos y tasas", color: "#EF4444", isActive: true },
        { name: "Otros", description: "Gastos varios", color: "#6B7280", isActive: true },
      ]

      for (const category of defaultCategories) {
        await createExpenseCategory(tenantId, branchId, category)
      }

      // Volver a obtener las categorías
      const newSnapshot = await getDocs(categoriesCollection)
      return newSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ExpenseCategory[]
    }

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ExpenseCategory[]
  } catch (error) {
    console.error("Error al obtener categorías de gastos:", error)
    throw error
  }
}

// Función para crear una categoría de gasto
export async function createExpenseCategory(
  tenantId: string,
  branchId: string,
  category: Omit<ExpenseCategory, "id">,
): Promise<ExpenseCategory> {
  try {
    const categoriesCollection = collection(db, `tenants/${tenantId}/branches/${branchId}/expenseCategories`)
    const docRef = await addDoc(categoriesCollection, category)

    return {
      id: docRef.id,
      ...category,
    } as ExpenseCategory
  } catch (error) {
    console.error("Error al crear categoría de gasto:", error)
    throw error
  }
}

// Función para obtener todos los movimientos de caja de todas las cajas desde Realtime Database
export async function getAllCashMovements(tenantId: string, branchId: string): Promise<CashMovement[]> {
  try {
    console.log("Obteniendo movimientos de caja para:", { tenantId, branchId })

    // Obtener todos los movimientos de caja desde Realtime Database
    const movementsRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/cashMovements`)
    const snapshot = await get(movementsRef)

    if (!snapshot.exists()) {
      console.log("No se encontraron movimientos de caja")
      return []
    }

    // Convertir los datos a un array de objetos
    const movementsData = snapshot.val()
    const movements = Object.entries(movementsData).map(([id, data]) => ({
      id,
      ...(data as any),
    })) as CashMovement[]

    console.log("Movimientos encontrados:", movements.length)

    // Filtrar solo los movimientos que son ingresos
    const incomeMovements = movements.filter((movement) => ["income", "sale", "deposit"].includes(movement.type))

    console.log("Movimientos de ingreso:", incomeMovements.length)

    // Ordenar por fecha de creación (más reciente primero)
    return movements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch (error) {
    console.error("Error al obtener movimientos de caja:", error)
    return []
  }
}

// Función para obtener el resumen financiero
export async function getFinancialSummary(tenantId: string, branchId: string): Promise<FinancialSummary> {
  try {
    console.log("Generando resumen financiero para:", { tenantId, branchId })

    // Obtener todos los gastos
    const expenses = await getExpenses(tenantId, branchId)
    console.log("Gastos encontrados:", expenses.length)

    // Obtener todos los movimientos de caja de todas las cajas desde Realtime Database
    const cashMovements = await getAllCashMovements(tenantId, branchId)
    console.log("Movimientos de caja encontrados:", cashMovements.length)

    // Obtener categorías de gastos
    const expenseCategories = await getExpenseCategories(tenantId, branchId)

    // Calcular totales
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

    // Calcular ingresos (ventas) de los movimientos de caja
    const incomeMovements = cashMovements.filter((movement) => ["income", "sale", "deposit"].includes(movement.type))
    const totalIncome = incomeMovements.reduce((sum, movement) => sum + movement.amount, 0)

    console.log("Ingresos calculados:", {
      totalMovements: incomeMovements.length,
      totalIncome,
    })

    // Calcular gastos por categoría
    const expensesByCategory = expenseCategories
      .map((category) => {
        const amount = expenses
          .filter((expense) => expense.category === category.name)
          .reduce((sum, expense) => sum + expense.amount, 0)
        return {
          category: category.name,
          amount,
          color: category.color,
        }
      })
      .filter((item) => item.amount > 0)

    // Calcular ingresos por categoría (simplificado)
    const incomeByCategory = [
      {
        category: "Ventas",
        amount: incomeMovements.filter((m) => m.type === "sale").reduce((sum, m) => sum + m.amount, 0),
        color: "#10B981",
      },
      {
        category: "Depósitos",
        amount: incomeMovements.filter((m) => m.type === "deposit").reduce((sum, m) => sum + m.amount, 0),
        color: "#3B82F6",
      },
      {
        category: "Otros Ingresos",
        amount: incomeMovements.filter((m) => m.type === "income").reduce((sum, m) => sum + m.amount, 0),
        color: "#8B5CF6",
      },
    ].filter((item) => item.amount > 0)

    // Calcular datos mensuales (últimos 6 meses)
    const monthlyData = getMonthlyData(expenses, incomeMovements)

    const summary = {
      totalExpenses,
      totalIncome,
      profit: totalIncome - totalExpenses,
      expensesByCategory,
      incomeByCategory,
      monthlyData,
      incomeMovements,
    }

    console.log("Resumen financiero generado:", summary)

    return summary
  } catch (error) {
    console.error("Error al obtener resumen financiero:", error)
    throw error
  }
}

// Función auxiliar para obtener datos mensuales
function getMonthlyData(expenses: Expense[], incomeMovements: any[]) {
  const months = []
  const today = new Date()

  // Generar los últimos 6 meses
  for (let i = 0; i < 6; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`

    // Filtrar gastos del mes
    const monthExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getMonth() === date.getMonth() && expenseDate.getFullYear() === date.getFullYear()
    })

    // Filtrar ingresos del mes
    const monthIncome = incomeMovements.filter((income) => {
      const incomeDate = new Date(income.createdAt)
      return incomeDate.getMonth() === date.getMonth() && incomeDate.getFullYear() === date.getFullYear()
    })

    // Calcular totales
    const totalExpenses = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const totalIncome = monthIncome.reduce((sum, income) => sum + income.amount, 0)

    months.push({
      month: monthYear,
      expenses: totalExpenses,
      income: totalIncome,
      profit: totalIncome - totalExpenses,
    })
  }

  return months.reverse()
}
