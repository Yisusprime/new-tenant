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
  subtotal: number
}

export interface DeliveryAddress {
  street: string
  number: string
  city: string
  zipCode?: string
  notes?: string
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
  tableId?: string // ID de la mesa (para pedidos de mesa)
  tableNumber?: string // Número de mesa (para pedidos de mesa)
  deliveryAddress?: DeliveryAddress // Dirección de entrega (para pedidos de delivery)
  paymentMethod?: string
  paymentStatus: "pending" | "paid" | "failed"
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
  tableId?: string // ID de la mesa (para pedidos de mesa)
  tableNumber?: string // Número de mesa (para pedidos de mesa)
  deliveryAddress?: DeliveryAddress // Dirección de entrega (para pedidos de delivery)
  paymentMethod?: string
}
