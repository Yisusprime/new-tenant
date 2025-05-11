export type CashMovementType = "income" | "expense" | "initial" | "closing"
export type CashBoxStatus = "active" | "closed" | "archived"
export type PaymentMethod = "cash" | "card" | "transfer" | "other"

export interface CashBox {
  id: string
  tenantId: string
  branchId: string
  name: string
  isOpen: boolean
  initialAmount: number
  currentAmount: number
  expectedAmount: number
  difference?: number
  openedAt?: string
  openedBy?: string
  closedAt?: string
  closedBy?: string
  notes?: string
  status: CashBoxStatus
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
  paymentMethod?: PaymentMethod
  category?: string
  reference?: string
  attachmentUrl?: string
}

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
