export interface CashRegister {
  id: string
  initialAmount: number
  finalAmount?: number
  expectedAmount?: number
  openedBy: string
  openedAt: Date
  closedBy?: string
  closedAt?: Date
  status: "open" | "closed"
  notes?: string
  closingNotes?: string
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
