export type OrderStatus =
  | "pending" // Pendiente
  | "preparing" // En preparación
  | "ready" // Listo para entrega
  | "delivered" // Entregado
  | "completed" // Completado
  | "cancelled" // Cancelado

export type OrderType =
  | "dine_in" // Para comer en el local
  | "takeaway" // Para llevar
  | "table" // Mesa
  | "delivery" // Entrega a domicilio

export type PaymentStatus =
  | "pending" // Pendiente de pago
  | "paid" // Pagado
  | "refunded" // Reembolsado

export type PaymentMethod =
  | "cash" // Efectivo
  | "card" // Tarjeta
  | "transfer" // Transferencia
  | "other" // Otro

export interface OrderItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  notes?: string
  extras?: OrderItemExtra[]
  subtotal: number
}

export interface OrderItemExtra {
  id: string
  name: string
  price: number
  quantity: number
}

export interface OrderCustomer {
  id?: string
  name: string
  phone?: string
  email?: string
  address?: OrderAddress
}

export interface OrderAddress {
  street: string
  number?: string
  apartment?: string
  city: string
  state?: string
  zipCode?: string
  instructions?: string
}

export interface TableInfo {
  id: string
  name: string
  capacity: number
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
  deliveryFee?: number
  discount?: number
  total: number
  customer: OrderCustomer
  paymentStatus: PaymentStatus
  paymentMethod?: PaymentMethod
  notes?: string
  tableInfo?: TableInfo
  createdAt: Date
  updatedAt: Date
  estimatedDeliveryTime?: Date
  completedAt?: Date
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
