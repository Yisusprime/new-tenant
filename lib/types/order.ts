export type OrderType = "local" | "takeaway" | "table" | "delivery"
export type OrderStatus = "pending" | "preparing" | "ready" | "delivered" | "cancelled"

export interface OrderItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  extras?: {
    id: string
    name: string
    price: number
  }[]
  notes?: string
  subtotal: number
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
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  tableNumber?: string
  deliveryAddress?: {
    street: string
    number: string
    city: string
    zipCode?: string
    notes?: string
  }
  paymentMethod?: string
  paymentStatus?: "pending" | "paid" | "failed"
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface OrderFormData {
  type: OrderType
  items: OrderItem[]
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  tableNumber?: string
  deliveryAddress?: {
    street: string
    number: string
    city: string
    zipCode?: string
    notes?: string
  }
  paymentMethod?: string
}
