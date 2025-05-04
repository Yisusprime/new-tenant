export interface Shift {
  id: string
  tenantId: string
  startTime: number
  endTime?: number
  notes?: string
  status: "active" | "closed"
  createdBy?: string
  closedBy?: string
  summary?: {
    totalOrders: number
    totalSales: number
    cashSales: number
    cardSales: number
    otherSales: number
  }
}

export interface ShiftContextType {
  currentShift: Shift | null
  shifts: Shift[]
  loading: boolean
  error: string | null
  startShift: (shiftData: Partial<Shift>) => Promise<string>
  endShift: (shiftId: string, summary?: Shift["summary"]) => Promise<void>
  getShift: (shiftId: string) => Promise<Shift | null>
  refreshShifts: () => Promise<void>
}
