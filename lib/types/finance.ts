export interface Expense {
  id: string
  amount: number
  category: string
  description: string
  date: string
  paymentMethod: string
  reference?: string
  inventoryItemId?: string
  isRecurring?: boolean
  recurringFrequency?: string
  nextDueDate?: string
  status: "paid" | "pending"
  attachmentUrl?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface ExpenseCategory {
  id: string
  name: string
  description?: string
  color: string
  isActive: boolean
}

export interface Income {
  id: string
  amount: number
  category: string
  description: string
  date: string
  paymentMethod: string
  reference?: string
  orderId?: string
  orderNumber?: string
  status: "received" | "pending"
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface IncomeCategory {
  id: string
  name: string
  description?: string
  color: string
  isActive: boolean
}

export interface FinancialSummary {
  totalExpenses: number
  totalIncome: number
  profit: number
  expensesByCategory: {
    category: string
    amount: number
    color: string
  }[]
  incomeByCategory: {
    category: string
    amount: number
    color: string
  }[]
  monthlyData: {
    month: string
    expenses: number
    income: number
    profit: number
  }[]
}
