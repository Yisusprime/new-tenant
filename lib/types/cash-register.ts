export type CashRegisterStatus = "open" | "closed" | "pending"
export type CashMovementType = "income" | "expense" | "sale" | "refund" | "withdrawal" | "deposit" | "adjustment"
export type PaymentMethod = "cash" | "card" | "transfer" | "app" | "other"
export type AuditStatus = "balanced" | "surplus" | "shortage"

export interface CashRegister {
  id: string
  name: string
  description?: string
  status: CashRegisterStatus
  currentBalance: number
  initialBalance: number
  expectedFinalBalance?: number
  openedAt: string
  closedAt?: string
  openedBy: string
  closedBy?: string
  notes?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CashMovement {
  id: string
  registerId: string
  type: CashMovementType
  amount: number
  description: string
  paymentMethod: PaymentMethod
  orderId?: string
  orderNumber?: string
  reference?: string
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
  paymentMethodTotals: Record<PaymentMethod, number>
}

export interface CashRegisterFormData {
  name: string
  description?: string
  initialBalance: number
  notes?: string
  isActive: boolean
}

export interface CashMovementFormData {
  type: CashMovementType
  amount: number
  description: string
  paymentMethod: PaymentMethod
  reference?: string
  orderId?: string
  orderNumber?: string
}

export interface CashRegisterCloseData {
  actualBalance: number
  notes?: string
  paymentMethodCounts?: Record<PaymentMethod, number>
}

// Nuevas interfaces para el arqueo de caja
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
  denominations?: CashDenominations
  createdAt: string
}

export interface CashDenominations {
  bills: Record<string, number> // Valor del billete -> cantidad
  coins: Record<string, number> // Valor de la moneda -> cantidad
}

export interface CashAuditFormData {
  registerId: string
  actualCash: number
  notes?: string
  denominations?: CashDenominations
}
