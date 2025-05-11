export enum OrderType {
  DINE_IN = "dine_in",
  TAKEOUT = "takeout",
  DELIVERY = "delivery",
  TABLE = "table",
}

export enum OrderStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  READY = "ready",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface Customer {
  id?: string
  name: string
  email?: string
  phone?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    additionalInfo?: string
  }
}

export interface OrderItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  options?: {
    id: string
    name: string
    price: number
  }[]
  notes?: string
  subtotal: number
}

export interface TableInfo {
  id: string
  number: number
  name?: string
  capacity: number
  location?: string
}

export interface OrderSummary {
  id: string
  orderNumber: string
  type: OrderType
  status: OrderStatus
  total: number
  customerName: string
  createdAt: Date
  tableInfo?: TableInfo
}

export interface Order {
  id: string
  tenantId: string
  branchId: string
  orderNumber: string
  type: OrderType
  status: OrderStatus
  items: OrderItem[]
  subtotal: number
  tax: number
  tip?: number
  discount?: number
  total: number
  customer: Customer
  tableInfo?: TableInfo
  paymentMethod?: string
  paymentStatus?: "pending" | "paid" | "failed"
  notes?: string
  createdAt: Date
  updatedAt: Date
  estimatedDeliveryTime?: Date
  completedAt?: Date
  deliveryInfo?: {
    address: string
    instructions?: string
    deliveryFee: number
    estimatedTime: number
  }
}

// Asegurarnos de que OrderType se exporte como una exportación nombrada
