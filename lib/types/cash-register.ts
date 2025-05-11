export interface CashRegister {
  id: string
  branchId: string
  openedAt: string
  closedAt?: string
  initialAmount: number
  finalAmount?: number
  expectedAmount?: number
  difference?: number
  status: "open" | "closed"
  openedBy: string
  closedBy?: string
  notes?: string
  summary?: {
    totalOrders: number
    totalSales: number
    totalCash: number
    totalCard: number
    totalOtherMethods: number
    totalTaxes: number
  }
}

export interface CashRegisterFormData {
  initialAmount: number
  notes?: string
}

export interface CashRegisterCloseData {
  finalAmount: number
  notes?: string
}

export interface CashRegisterSummary {
  totalOrders: number
  totalSales: number
  totalCash: number
  totalCard: number
  totalOtherMethods: number
  totalTaxes: number
  ordersByStatus: {
    [key: string]: number
  }
  salesByHour: {
    hour: string
    amount: number
  }[]
  paymentMethods: {
    method: string
    amount: number
    count: number
  }[]
}
