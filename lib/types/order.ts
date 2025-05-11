export type OrderType = "dine_in" | "takeaway" | "delivery"

export type OrderStatus =
  | "new"
  | "received"
  | "preparing"
  | "ready"
  | "in_transit"
  | "delivered"
  | "completed"
  | "cancelled"

export interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  price: number
  extras?: {
    id: string
    name: string
    price: number
  }[]
  notes?: string
  subtotal: number
}

export interface CustomerInfo {
  name: string
  phone: string
  email?: string
  address?: string
}

export interface Order {
  id: string
  orderNumber: string
  type: OrderType
  status: OrderStatus
  items: OrderItem[]
  subtotal: number
  tax: number
  deliveryFee?: number
  discount?: number
  total: number
  tableNumber?: string
  customer?: CustomerInfo
  paymentMethod: string
  paymentStatus: "pending" | "paid" | "failed"
  notes?: string
  createdAt: string
  updatedAt: string
  branchId: string
}

export interface OrderFormData {
  type: OrderType
  items: Omit<OrderItem, "id" | "subtotal">[]
  tableNumber?: string
  customer?: CustomerInfo
  paymentMethod: string
  notes?: string
}
