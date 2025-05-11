export interface CashBox {
  id: string
  tenantId: string
  branchId: string
  name: string
  isOpen: boolean
  initialAmount: number
  currentAmount: number
  expectedAmount: number
  status: "active" | "closed" | "archived"
  openedAt?: string
  openedBy?: string
  closedAt?: string
  closedBy?: string
  difference?: number
  notes?: string
  createdAt?: string
  createdBy?: string
}

export interface CashMovement {
  id: string
  tenantId: string
  branchId: string
  cashBoxId: string
  type: CashMovementType
  amount: number
  description: string
  createdAt: string
  createdBy: string
  paymentMethod?: string
  category?: string
  reference?: string
  attachmentUrl?: string
}

export type CashMovementType = "income" | "expense" | "initial" | "closing"

export interface CashCategory {
  id: string
  tenantId: string
  name: string
  type: "income" | "expense"
  color?: string
  icon?: string
}

export interface CashBoxSummary {
  totalIncome: number
  totalExpense: number
  totalInitial: number
  totalClosing: number
  balance: number
  movementsCount: number
}
