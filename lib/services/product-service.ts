import { ref, get, set, remove, push, update } from "firebase/database"
import { db } from "@/lib/firebase/client"
import { put } from "@vercel/blob"
import { v4 as uuidv4 } from "uuid"

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  discountPrice?: number
  categoryId: string
  subcategoryId?: string
  imageUrl?: string
  featured: boolean
  available: boolean
  order: number
  createdAt: number
  updatedAt: number
}

export interface ProductInput {
  name: string
  description?: string
  price: number
  discountPrice?: number
  categoryId: string
  subcategoryId?: string
  imageUrl?: string
  featured?: boolean
  available?: boolean
  order?: number
}

export interface ProductExtra {
  id: string
  name: string
  description?: string
  isRequired: boolean
  multipleSelection: boolean
  maxSelections?: number
  order: number
  options: ProductExtraOption[]
  createdAt: number
  updatedAt: number
}

export interface ProductExtraOption {
  id: string
  name: string
  price: number
  order: number
  active: boolean
}

export async function getProducts(tenantId: string, branchId: string): Promise<Product[]> {
  const productsRef = ref(db, `tenants/${tenantId}/branches/${branchId}/products`)
  const snapshot = await get(productsRef)

  if (!snapshot.exists()) {
    return []
  }

  const productsData = snapshot.val()
  return Object.keys(productsData).map((key) => ({
    id: key,
    ...productsData[key],
  }))
}

export async function getProduct(tenantId: string, branchId: string, productId: string): Promise<Product | null> {
  const productRef = ref(db, `tenants/${tenantId}/branches/${branchId}/products/${productId}`)
  const snapshot = await get(productRef)

  if (!snapshot.exists()) {
    return null
  }

  return {
    id: productId,
    ...snapshot.val(),
  }
}

export async function createProduct(
  tenantId: string,
  branchId: string,
  productData: ProductInput,
  imageFile?: File,
): Promise<string> {
  const productsRef = ref(db, `tenants/${tenantId}/branches/${branchId}/products`)
  const newProductRef = push(productsRef)
  const productId = newProductRef.key as string

  let imageUrl = productData.imageUrl

  if (imageFile) {
    const filename = `${tenantId}/${branchId}/products/${productId}/${uuidv4()}-${imageFile.name}`
    const blob = await put(filename, imageFile, {
      access: "public",
    })
    imageUrl = blob.url
  }

  const now = Date.now()
  const product = {
    ...productData,
    imageUrl,
    featured: productData.featured ?? false,
    available: productData.available ?? true,
    order: productData.order ?? 0,
    createdAt: now,
    updatedAt: now,
  }

  await set(newProductRef, product)
  return productId
}

export async function updateProduct(
  tenantId: string,
  branchId: string,
  productId: string,
  productData: ProductInput,
  imageFile?: File,
): Promise<void> {
  const productRef = ref(db, `tenants/${tenantId}/branches/${branchId}/products/${productId}`)

  let imageUrl = productData.imageUrl

  if (imageFile) {
    const filename = `${tenantId}/${branchId}/products/${productId}/${uuidv4()}-${imageFile.name}`
    const blob = await put(filename, imageFile, {
      access: "public",
    })
    imageUrl = blob.url
  }

  const updatedProduct = {
    ...productData,
    imageUrl,
    updatedAt: Date.now(),
  }

  await update(productRef, updatedProduct)
}

export async function deleteProduct(tenantId: string, branchId: string, productId: string): Promise<void> {
  const productRef = ref(db, `tenants/${tenantId}/branches/${branchId}/products/${productId}`)
  await remove(productRef)
}

// Extras

export async function getProductExtras(tenantId: string, branchId: string, productId: string): Promise<ProductExtra[]> {
  const extrasRef = ref(db, `tenants/${tenantId}/branches/${branchId}/products/${productId}/extras`)
  const snapshot = await get(extrasRef)

  if (!snapshot.exists()) {
    return []
  }

  const extrasData = snapshot.val()
  return Object.keys(extrasData).map((key) => ({
    id: key,
    ...extrasData[key],
  }))
}

export async function getProductExtra(
  tenantId: string,
  branchId: string,
  productId: string,
  extraId: string,
): Promise<ProductExtra | null> {
  const extraRef = ref(db, `tenants/${tenantId}/branches/${branchId}/products/${productId}/extras/${extraId}`)
  const snapshot = await get(extraRef)

  if (!snapshot.exists()) {
    return null
  }

  return {
    id: extraId,
    ...snapshot.val(),
  }
}

export async function createProductExtra(
  tenantId: string,
  branchId: string,
  productId: string,
  extraData: Omit<ProductExtra, "id" | "createdAt" | "updatedAt">,
): Promise<string> {
  const extrasRef = ref(db, `tenants/${tenantId}/branches/${branchId}/products/${productId}/extras`)
  const newExtraRef = push(extrasRef)
  const extraId = newExtraRef.key as string

  const now = Date.now()
  const extra = {
    ...extraData,
    createdAt: now,
    updatedAt: now,
  }

  await set(newExtraRef, extra)
  return extraId
}

export async function updateProductExtra(
  tenantId: string,
  branchId: string,
  productId: string,
  extraId: string,
  extraData: Omit<ProductExtra, "id" | "createdAt" | "updatedAt">,
): Promise<void> {
  const extraRef = ref(db, `tenants/${tenantId}/branches/${branchId}/products/${productId}/extras/${extraId}`)

  const updatedExtra = {
    ...extraData,
    updatedAt: Date.now(),
  }

  await update(extraRef, updatedExtra)
}

export async function deleteProductExtra(
  tenantId: string,
  branchId: string,
  productId: string,
  extraId: string,
): Promise<void> {
  const extraRef = ref(db, `tenants/${tenantId}/branches/${branchId}/products/${productId}/extras/${extraId}`)
  await remove(extraRef)
}

export async function deleteProductExtraOption(
  tenantId: string,
  branchId: string,
  productId: string,
  extraId: string,
  optionId: string,
): Promise<void> {
  const optionRef = ref(
    db,
    `tenants/${tenantId}/branches/${branchId}/products/${productId}/extras/${extraId}/options/${optionId}`,
  )
  await remove(optionRef)
}
