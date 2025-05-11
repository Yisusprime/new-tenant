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

// Interfaz para la información de la mesa
export interface Table {
  id: string
  name: string
  capacity: number
  isActive: boolean
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

// Interfaz para la información de entrega
export interface DeliveryInfo {
  address: string
  instructions?: string
  estimatedTime?: number // en minutos
  deliveryFee: number
}

// Interfaz para la información de la mesa en un pedido
export interface TableInfo {
  id: string
  name: string
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
  tableInfo?: TableInfo
  deliveryInfo?: DeliveryInfo
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

// Interfaz para un resumen de pedido (para listados)
export interface OrderSummary {
  id: string
  orderNumber: string
  type: OrderType
  status: OrderStatus
  customerName?: string
  tableInfo?: TableInfo
  total: number
  createdAt: any // Firestore Timestamp o Date
}

// Asegurarnos de que OrderType se exporte como una exportación nombrada
