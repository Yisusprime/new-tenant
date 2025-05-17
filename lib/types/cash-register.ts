export type CashRegisterStatus = "open" | "closed"

export type PaymentMethod = "cash" | "card" | "transfer" | "app" | "other"

export type CashMovementType = "income" | "expense" | "sale" | "refund" | "withdrawal" | "deposit" | "adjustment"

export type VerificationStatus = "pending" | "verified" | "rejected"

export type AuditStatus = "balanced" | "surplus" | "shortage"

export interface CashRegister {
  id: string
  name: string
  description?: string
  status: CashRegisterStatus
  initialBalance: number
  currentBalance: number
  expectedFinalBalance?: number
  openedAt: string
  openedBy: string
  closedAt?: string
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
  reference?: string
  orderId?: string
  orderNumber?: string
  createdAt: string
  createdBy: string
  verificationStatus?: VerificationStatus
  verificationDate?: string
  verificationBy?: string
  transactionId?: string
}

export interface CashRegisterFormData {
  name: string
  description?: string
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
  verificationStatus?: VerificationStatus
  transactionId?: string
}

export interface CashRegisterCloseData {
  actualBalance: number
  notes?: string
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

export interface CashAudit {
  id: string
  registerId: string
  performedAt: string
  performedBy: string
  expectedCash: number
  actualCash: number
  difference: number
  notes?: string
  denominations?: CashDenominations
  createdAt: string
}

export interface CashAuditFormData {
  registerId: string
  actualCash: number
  notes?: string
  denominations?: CashDenominations
}

export interface CashDenominations {
  bills: Record<string, number>
  coins: Record<string, number>
}
