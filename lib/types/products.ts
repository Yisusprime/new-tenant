export interface ProductExtra {
  id: string
  name: string
  description?: string
  required: boolean
  minSelect: number
  maxSelect: number
  basePrice?: number
  options: ProductExtraOption[]
}

export interface ProductExtraOption {
  id: string
  name: string
  description?: string
  additionalPrice: number
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  discountedPrice?: number
  imageUrl?: string
  categoryId: string
  subcategoryId?: string
  available: boolean
  featured: boolean
  extras?: ProductExtra[]
  createdAt: Date
  updatedAt: Date
}

export interface CreateProductData {
  name: string
  description?: string
  price: number
  discountedPrice?: number
  imageUrl?: string
  categoryId: string
  subcategoryId?: string
  available: boolean
  featured: boolean
  extras?: ProductExtra[]
}

export interface UpdateProductData {
  name?: string
  description?: string
  price?: number
  discountedPrice?: number
  imageUrl?: string
  categoryId?: string
  subcategoryId?: string
  available?: boolean
  featured?: boolean
  extras?: ProductExtra[]
}
