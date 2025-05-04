export interface CashierSession {
  id: string
  tenantId: string
  startTime: number
  endTime?: number
  initialCash: number
  endCash?: number
  endCard?: number
  endOther?: number
  difference?: number
  openedBy: string
  closedBy?: string
  notes?: string
  status: "open" | "closed"
}

export interface SessionSummary {
  totalSales: number
  cashSales: number
  cardSales: number
  otherSales: number
  tips: number
  totalOrders: number
  completedOrders: number
  canceledOrders: number
  orderItems: number
}

export interface OpenSessionParams {
  initialCash: number
  openedBy: string
}

export interface CloseSessionParams {
  sessionId: string
  endCash: number
  endCard: number
  endOther: number
  difference: number
  notes?: string
}

export interface SalesDataPoint {
  label: string
  totalSales: number
  cashSales: number
  cardSales: number
  otherSales: number
  tips: number
  orders: number
}
