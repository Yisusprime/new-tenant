export type CashMovementType = "income" | "expense" | "initial" | "closing"

export interface CashBox {
  id: string
  branchId: string
  tenantId: string
  name: string
  isOpen: boolean
  initialAmount: number
  currentAmount: number
  expectedAmount: number
  openedAt?: string
  openedBy?: string
  closedAt?: string
  closedBy?: string
  difference?: number
  notes?: string
  status: "active" | "closed"
}

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
