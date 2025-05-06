export type TableStatus = "available" | "occupied" | "reserved" | "maintenance"
export type OrderStatus = "pending" | "preparing" | "ready" | "delivered" | "completed" | "cancelled"
export type OrderType = "dine-in" | "takeaway" | "delivery" | "table"
export type PaymentStatus = "pending" | "paid" | "partially_paid" | "refunded"
export type PaymentMethod = "cash" | "card" | "transfer" | "other"

export interface Table {
  id: string
  number: number
  capacity: number
  status: TableStatus
  location: string
  createdAt: number
  updatedAt: number
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  price: number
  discount: number
  notes: string
  extras: OrderItemExtra[]
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled"
}

export interface OrderItemExtra {
  id: string
  extraId: string
  name: string
  price: number
  quantity: number
}

export interface Coupon {
  id: string
  code: string
  discountType: "percentage" | "fixed"
  discountValue: number
  minOrderValue: number
  maxDiscountAmount: number
  validFrom: number
  validUntil: number
  usageLimit: number
  usageCount: number
  isActive: boolean
}

export interface Order {
  id: string
  tenantId: string
  orderNumber: string
  type: OrderType
  status: OrderStatus
  items: OrderItem[]
  subtotal: number
  tax: number
  discount: number
  tip: number
  total: number
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  tableId?: string
  customerId?: string
  customerName?: string
  customerPhone?: string
  customerAddress?: string
  deliveryFee?: number
  deliveryNotes?: string
  couponId?: string
  couponCode?: string
  couponDiscount?: number
  notes?: string
  createdAt: number
  updatedAt: number
  completedAt?: number
}

export interface DeliveryInfo {
  address: string
  city: string
  zipCode: string
  phone: string
  notes: string
  estimatedDeliveryTime?: number
  deliveryPersonId?: string
  deliveryPersonName?: string
}
