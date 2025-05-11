// Enumeración para los tipos de pedido
export enum OrderType {
  DINE_IN = "dine_in",
  TAKEOUT = "takeout",
  DELIVERY = "delivery",
  TABLE = "table",
}

// Enumeración para los estados de pedido
export enum OrderStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  READY = "ready",
  DELIVERED = "delivered",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

// Interfaz para la información del cliente
export interface Customer {
  id?: string
  name: string
  email?: string
  phone?: string
  address?: string
}

// Interfaz para los elementos del pedido
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

// Interfaz para un pedido completo
export interface Order {
  id: string
  tenantId: string
  branchId: string
  orderNumber: string
  type: OrderType
  status: OrderStatus
  items: OrderItem[]
  customer?: Customer
  tableInfo?: {
    id: string
    name: string
  }
  subtotal: number
  tax: number
  discount?: number
  total: number
  notes?: string
  createdAt: any // Firestore Timestamp o Date
  updatedAt: any // Firestore Timestamp o Date
  completedAt?: any // Firestore Timestamp o Date
  cancelledAt?: any // Firestore Timestamp o Date
}
