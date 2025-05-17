export type CashMovementType = "sale" | "expense" | "deposit" | "withdrawal" | "adjustment"
export type PaymentMethod = "cash" | "card" | "transfer" | "app" | "other"
export type CashRegisterStatus = "open" | "closed"

export interface CashRegister {
  id: string
  name: string
  status: CashRegisterStatus
  initialBalance: number
  currentBalance?: number
  openedAt?: string
  closedAt?: string
  openedBy?: string
  closedBy?: string
  branchId: string
  createdAt: string
  updatedAt: string
  expectedFinalBalance?: number
  notes?: string
  isActive: boolean
}

export interface CashMovement {
  id: string
  registerId: string
  type: CashMovementType
  amount: number
  description: string
  paymentMethod: PaymentMethod
  reference?: string
  orderId?: string
  orderNumber?: string
  createdAt: string
  createdBy: string
}

export interface CashRegisterSummary {
  totalIncome: number
  totalExpense: number
  totalSales: number
  totalRefunds: number
  totalWithdrawals: number
  totalDeposits: number
  totalAdjustments: number
  expectedBalance: number
  actualBalance: number
  difference: number
  paymentMethodTotals: {
    cash: number
    card: number
    transfer: number
    app: number
    other: number
  }
}

export interface CashRegisterFormData {
  name: string
  initialBalance: number
  notes?: string
  isActive: boolean
}

export interface CashMovementFormData {
  registerId: string
  type: CashMovementType
  amount: number
  description: string
  paymentMethod: PaymentMethod
  reference?: string
  orderId?: string
  orderNumber?: string
}

export interface CashRegisterCloseData {
  registerId: string
  actualBalance: number
  notes?: string
}

export type AuditStatus = "balanced" | "surplus" | "shortage"

export interface CashDenominations {
  bills: Record<string, number>
  coins: Record<string, number>
}

export interface CashAuditFormData {
  registerId: string
  actualCash: number
  expectedCash?: number
  notes?: string
  denominations?: CashDenominations
}

export interface CashAudit {
  id: string
  registerId: string
  performedAt: string
  performedBy: string
  expectedCash: number
  actualCash: number
  difference: number
  status: AuditStatus
  notes?: string
  denominations?: CashDenominations | null
  createdAt: string
}
