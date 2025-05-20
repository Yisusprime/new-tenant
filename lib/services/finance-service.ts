import { db } from "@/lib/firebase/client"
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore"
import type { Expense, ExpenseCategory, FinancialSummary } from "@/lib/types/finance"

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

// Función para obtener el resumen financiero
export async function getFinancialSummary(tenantId: string, branchId: string): Promise<FinancialSummary> {
  try {
    // Obtener todos los gastos
    const expenses = await getExpenses(tenantId, branchId)

    // Obtener todos los movimientos de caja de todas las cajas
    const cashMovements = await getAllCashMovements(tenantId, branchId)

    // Obtener categorías de gastos
    const expenseCategories = await getExpenseCategories(tenantId, branchId)

    // Calcular totales
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

    // Calcular ingresos (ventas) de los movimientos de caja
    const incomeMovements = cashMovements.filter((movement) => ["income", "sale"].includes(movement.type))
    const totalIncome = incomeMovements.reduce((sum, movement) => sum + movement.amount, 0)

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
        category: "Otros Ingresos",
        amount: incomeMovements.filter((m) => m.type === "income").reduce((sum, m) => sum + m.amount, 0),
        color: "#3B82F6",
      },
    ].filter((item) => item.amount > 0)

    // Calcular datos mensuales (últimos 6 meses)
    const monthlyData = getMonthlyData(expenses, incomeMovements)

    return {
      totalExpenses,
      totalIncome,
      profit: totalIncome - totalExpenses,
      expensesByCategory,
      incomeByCategory,
      monthlyData,
      // Incluir los movimientos de ingresos para que estén disponibles en la UI
      incomeMovements,
    }
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

// Función para obtener todos los movimientos de caja de todas las cajas
async function getAllCashMovements(tenantId: string, branchId: string) {
  try {
    // Primero obtenemos todas las cajas
    const registersCollection = collection(db, `tenants/${tenantId}/branches/${branchId}/cashRegisters`)
    const registersSnapshot = await getDocs(registersCollection)

    // Si no hay cajas, retornamos un array vacío
    if (registersSnapshot.empty) {
      return []
    }

    // Obtenemos todos los movimientos de todas las cajas
    const movementsCollection = collection(db, `tenants/${tenantId}/branches/${branchId}/cashMovements`)
    const movementsSnapshot = await getDocs(movementsCollection)

    if (movementsSnapshot.empty) {
      return []
    }

    // Convertimos los documentos a objetos
    return movementsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error al obtener todos los movimientos de caja:", error)
    return []
  }
}
