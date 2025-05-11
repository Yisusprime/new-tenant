export type OrderStatus =
  | "pending" // Pendiente (recién llegado)
  | "received" // Recibido
  | "preparing" // En preparación
  | "ready" // Listo
  | "on_the_way" // En camino (solo delivery)
  | "delivered" // Entregado (solo delivery)
  | "completed" // Completado
  | "cancelled" // Cancelado

export type OrderType = "dine_in" | "takeaway" | "delivery"

export type PaymentStatus = "pending" | "paid" | "refunded"
export type PaymentMethod = "cash" | "card" | "transfer" | "other"

export interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  notes?: string
  extras?: {
    id: string
    name: string
    price: number
  }[]
  image?: string
}

export interface Order {
  id: string
  tenantId: string
  branchId: string
  orderNumber: string
  customerName: string
  customerPhone?: string
  customerEmail?: string
  orderType: OrderType
  status: OrderStatus
  items: OrderItem[]
  subtotal: number
  tax: number
  deliveryFee?: number
  discount?: number
  total: number
  paymentStatus: PaymentStatus
  paymentMethod?: PaymentMethod
  tableNumber?: string // Para pedidos en mesa
  deliveryAddress?: {
    street: string
    number: string
    city: string
    zipCode?: string
    notes?: string
  } // Para pedidos a domicilio
  notes?: string
  createdAt: Date
  updatedAt: Date
  estimatedReadyTime?: Date
  completedAt?: Date
}

export interface OrderFilters {
  status?: OrderStatus[]
  orderType?: OrderType[]
  dateRange?: {
    start: Date
    end: Date
  }
  paymentStatus?: PaymentStatus[]
}
