export interface Shift {
  id: string
  tenantId: string
  startTime: number
  endTime?: number
  startedBy: string
  endedBy?: string
  status: "active" | "closed"
  cashierSessionId?: string
}

export interface ShiftSummary {
  totalOrders: number
  completedOrders: number
  canceledOrders: number
  totalSales: number
  cashSales: number
  cardSales: number
  transferSales: number
  otherSales: number
}
