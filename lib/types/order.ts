export enum OrderStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  READY = "ready",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum OrderType {
  DINE_IN = "dine_in",
  TAKEOUT = "takeout",
  DELIVERY = "delivery",
  PICKUP = "pickup",
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
  capacity: number
  isOccupied: boolean
  currentOrderId?: string | null
  location?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface DeliveryInfo {
  address: string
  city: string
  zipCode: string
  phone: string
  notes?: string
  deliveryFee?: number
}

export interface CustomerInfo {
  name: string
  phone?: string
  email?: string
  userId?: string
}

export interface Order {
  id: string
  orderNumber: string
  type: OrderType
  status: OrderStatus
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  customer?: CustomerInfo
  tableId?: string
  tableNumber?: number
  deliveryInfo?: DeliveryInfo
  paymentMethod?: string
  paymentStatus?: "pending" | "paid" | "failed"
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface OrderSummary {
  id: string
  orderNumber: string
  type: OrderType
  status: OrderStatus
  total: number
  customer?: CustomerInfo
  tableNumber?: number
  createdAt: Date
}
