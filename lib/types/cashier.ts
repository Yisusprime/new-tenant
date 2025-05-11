export type CashMovementType = "income" | "expense" | "initial" | "closing"

export interface CashMovement {
  id: string
  type: CashMovementType
  amount: number
  description: string
  createdAt: string
  createdBy: string
  branchId: string
  tenantId: string
  cashBoxId: string
  paymentMethod?: string
  category?: string
  reference?: string
  attachmentUrl?: string
}

export interface CashBox {
  id: string
  branchId: string
  tenantId: string
  name: string
  isOpen: boolean
  openedAt?: string
  openedBy?: string
  closedAt?: string
  closedBy?: string
  initialAmount: number
  currentAmount: number
  expectedAmount: number
  difference?: number
  notes?: string
  status: "active" | "closed" | "archived"
}

export interface CashCategory {
  id: string
  name: string
  type: "income" | "expense"
  tenantId: string
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
