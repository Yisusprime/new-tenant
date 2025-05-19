export interface InventoryItem {
  id: string
  name: string
  description?: string
  category: string
  unit: string
  currentStock: number
  minStock?: number
  costPerUnit: number
  lastUpdated: string
  isActive: boolean
}

export interface PurchaseRecord {
  id: string
  itemId: string
  date: string
  quantity: number
  totalCost: number
  supplier?: string
  invoiceNumber?: string
  notes?: string
}

export interface InventoryCategory {
  id: string
  name: string
  description?: string
}

export interface InventoryMovement {
  id: string
  itemId: string
  date: string
  quantity: number // Positivo para entradas, negativo para salidas
  type: "purchase" | "consumption" | "adjustment" | "waste" | "transfer"
  reference?: string
  notes?: string
}
