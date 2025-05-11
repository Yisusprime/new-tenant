export interface ProductExtra {
  id: string
  name: string
  price: number
  description?: string
  imageUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  discountPrice?: number
  categoryId: string
  subcategoryId?: string
  imageUrl?: string
  isActive: boolean
  isFeatured: boolean
  availableExtras?: string[] // IDs de extras disponibles para este producto
  stock?: number
  sku?: string
  createdAt: string
  updatedAt: string
}

export interface ProductFormData {
  name: string
  description?: string
  price: number
  discountPrice?: number
  categoryId: string
  subcategoryId?: string
  imageUrl?: string
  isActive: boolean
  isFeatured: boolean
  availableExtras?: string[]
  stock?: number
  sku?: string
}

export interface ProductExtraFormData {
  name: string
  price: number
  description?: string
  imageUrl?: string
  isActive: boolean
}
