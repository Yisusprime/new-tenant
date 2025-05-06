// Tipos para el sistema de inventario

// Ingrediente básico
export interface Ingredient {
  id: string
  name: string
  description?: string
  category: string // Categoría del ingrediente (lácteos, carnes, verduras, etc.)
  unit: string // Unidad de medida (kg, l, unidad, etc.)
  stock: number // Cantidad actual en stock
  minStock: number // Nivel mínimo antes de alertar
  cost: number // Costo por unidad
  imageUrl?: string
  barcode?: string
  location?: string // Ubicación en almacén/cocina
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

// Proveedor
export interface Supplier {
  id: string
  name: string
  contactName?: string
  email?: string
  phone?: string
  address?: string
  notes?: string
  categories: string[] // Categorías de productos que provee
  paymentTerms?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Compra/Pedido a proveedor
export interface Purchase {
  id: string
  supplierId: string
  supplierName: string
  orderDate: Date
  deliveryDate?: Date
  status: "pending" | "delivered" | "cancelled" | "partial"
  items: PurchaseItem[]
  totalAmount: number
  paymentStatus: "pending" | "paid" | "partial"
  paymentMethod?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
  receivedBy?: string
}

// Ítem de compra
export interface PurchaseItem {
  ingredientId: string
  ingredientName: string
  quantity: number
  unit: string
  unitCost: number
  totalCost: number
  received?: number // Cantidad realmente recibida
}

// Movimiento de inventario (entrada, salida, ajuste)
export interface InventoryMovement {
  id: string
  ingredientId: string
  ingredientName: string
  date: Date
  quantity: number // Positivo para entradas, negativo para salidas
  type: "purchase" | "consumption" | "waste" | "adjustment"
  referenceId?: string // ID de compra, venta, etc.
  notes?: string
  createdBy: string
  createdAt: Date
}

// Receta (relación entre productos y sus ingredientes)
export interface Recipe {
  id: string
  productId: string
  productName: string
  ingredients: RecipeIngredient[]
  preparationTime?: number // En minutos
  instructions?: string
  yield: number // Cantidad de porciones/unidades que produce
  createdAt: Date
  updatedAt: Date
}

// Ingrediente en una receta
export interface RecipeIngredient {
  ingredientId: string
  ingredientName: string
  quantity: number
  unit: string
}

// Desperdicio/Merma
export interface Waste {
  id: string
  ingredientId: string
  ingredientName: string
  quantity: number
  reason: string
  date: Date
  reportedBy: string
  cost: number
  createdAt: Date
}

// Categorías de ingredientes predefinidas
export const INGREDIENT_CATEGORIES = [
  "Carnes",
  "Pescados y mariscos",
  "Frutas",
  "Verduras",
  "Lácteos",
  "Panadería",
  "Granos y cereales",
  "Condimentos y especias",
  "Aceites y grasas",
  "Bebidas",
  "Enlatados",
  "Congelados",
  "Snacks",
  "Otros",
]

// Unidades de medida predefinidas
export const MEASUREMENT_UNITS = [
  "kg", // Kilogramo
  "g", // Gramo
  "l", // Litro
  "ml", // Mililitro
  "unidad", // Unidad individual
  "docena", // 12 unidades
  "caja", // Caja
  "botella", // Botella
  "lata", // Lata
  "paquete", // Paquete
  "bolsa", // Bolsa
  "porción", // Porción
  "cucharada", // Cucharada
  "cucharadita", // Cucharadita
  "taza", // Taza
  "oz", // Onza
  "lb", // Libra
]
