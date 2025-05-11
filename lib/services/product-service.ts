import { ref, get, set, update, remove, push } from "firebase/database"
import { realtimeDb } from "@/lib/firebase/client"
import { uploadImageToBlob, deleteImageFromBlob } from "@/lib/services/category-service"

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

// Función auxiliar para eliminar propiedades undefined
function removeUndefinedProperties<T>(obj: T): T {
  const result = { ...obj } as any

  // Recorrer todas las propiedades del objeto
  Object.keys(result).forEach((key) => {
    // Si la propiedad es undefined, eliminarla
    if (result[key] === undefined) {
      delete result[key]
    }
    // Si la propiedad es un objeto (pero no null), aplicar recursivamente
    else if (typeof result[key] === "object" && result[key] !== null) {
      result[key] = removeUndefinedProperties(result[key])
    }
  })

  return result as T
}

// Función para obtener todos los productos de una sucursal
export async function getProducts(tenantId: string, branchId: string): Promise<Product[]> {
  try {
    const productsRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/products`)
    const snapshot = await get(productsRef)

    if (!snapshot.exists()) {
      return []
    }

    const productsData = snapshot.val()

    // Convertir el objeto a un array
    const products = Object.entries(productsData).map(([id, data]) => ({
      id,
      ...(data as any),
    })) as Product[]

    return products
  } catch (error) {
    console.error("Error al obtener productos:", error)
    throw error
  }
}

// Función para obtener un producto específico
export async function getProduct(tenantId: string, branchId: string, productId: string): Promise<Product | null> {
  try {
    const productRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/products/${productId}`)
    const snapshot = await get(productRef)

    if (!snapshot.exists()) {
      return null
    }

    return {
      id: productId,
      ...snapshot.val(),
    } as Product
  } catch (error) {
    console.error("Error al obtener producto:", error)
    throw error
  }
}

// Función para crear un nuevo producto
export async function createProduct(
  tenantId: string,
  branchId: string,
  productData: ProductFormData,
  imageFile?: File,
): Promise<Product> {
  try {
    const timestamp = new Date().toISOString()
    const productsRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/products`)

    // Generar un nuevo ID para el producto
    const newProductRef = push(productsRef)
    const productId = newProductRef.key!

    let imageUrl = productData.imageUrl || ""

    // Si hay un archivo de imagen, subirlo a Blob
    if (imageFile) {
      const blobPath = `tenants/${tenantId}/branches/${branchId}/products/${productId}-${Date.now()}.${imageFile.name.split(".").pop()}`
      imageUrl = await uploadImageToBlob(imageFile, blobPath)
    }

    // Crear el objeto del producto y eliminar propiedades undefined
    const newProduct = removeUndefinedProperties({
      ...productData,
      imageUrl,
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    // Guardar el producto en Realtime Database
    await set(newProductRef, newProduct)

    return {
      id: productId,
      ...newProduct,
    } as Product
  } catch (error) {
    console.error("Error al crear producto:", error)
    throw error
  }
}

// Función para actualizar un producto existente
export async function updateProduct(
  tenantId: string,
  branchId: string,
  productId: string,
  productData: Partial<ProductFormData>,
  imageFile?: File,
): Promise<Product> {
  try {
    const timestamp = new Date().toISOString()
    const productRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/products/${productId}`)

    // Obtener el producto actual
    const snapshot = await get(productRef)
    if (!snapshot.exists()) {
      throw new Error("El producto no existe")
    }

    const currentProduct = snapshot.val()

    let imageUrl = productData.imageUrl !== undefined ? productData.imageUrl : currentProduct.imageUrl

    // Si hay un nuevo archivo de imagen, subirlo a Blob
    if (imageFile) {
      // Si ya existe una imagen, eliminarla primero
      if (currentProduct.imageUrl) {
        try {
          await deleteImageFromBlob(currentProduct.imageUrl)
        } catch (error) {
          console.error("Error al eliminar imagen anterior:", error)
          // Continuar aunque falle la eliminación
        }
      }

      const blobPath = `tenants/${tenantId}/branches/${branchId}/products/${productId}-${Date.now()}.${imageFile.name.split(".").pop()}`
      imageUrl = await uploadImageToBlob(imageFile, blobPath)
    }

    // Crear el objeto de actualización y eliminar propiedades undefined
    const updatedData = removeUndefinedProperties({
      ...productData,
      imageUrl,
      updatedAt: timestamp,
    })

    // Actualizar el producto en Realtime Database
    await update(productRef, updatedData)

    return {
      id: productId,
      ...currentProduct,
      ...updatedData,
    } as Product
  } catch (error) {
    console.error("Error al actualizar producto:", error)
    throw error
  }
}

// Función para eliminar un producto
export async function deleteProduct(tenantId: string, branchId: string, productId: string): Promise<void> {
  try {
    const productRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/products/${productId}`)

    // Obtener el producto para ver si tiene imagen
    const snapshot = await get(productRef)
    if (!snapshot.exists()) {
      throw new Error("El producto no existe")
    }

    const productData = snapshot.val()

    // Si tiene imagen, eliminarla de Blob
    if (productData.imageUrl) {
      try {
        await deleteImageFromBlob(productData.imageUrl)
      } catch (error) {
        console.error("Error al eliminar imagen de Blob:", error)
        // Continuar aunque falle la eliminación de la imagen
      }
    }

    // Eliminar el producto de Realtime Database
    await remove(productRef)
  } catch (error) {
    console.error("Error al eliminar producto:", error)
    throw error
  }
}

// Funciones para extras globales

// Función para obtener todos los extras globales
export async function getProductExtras(tenantId: string, branchId: string): Promise<ProductExtra[]> {
  try {
    const extrasRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/productExtras`)
    const snapshot = await get(extrasRef)

    if (!snapshot.exists()) {
      return []
    }

    const extrasData = snapshot.val()

    // Convertir el objeto a un array
    const extras = Object.entries(extrasData).map(([id, data]) => ({
      id,
      ...(data as any),
    })) as ProductExtra[]

    return extras
  } catch (error) {
    console.error("Error al obtener extras:", error)
    throw error
  }
}

// Función para obtener un extra específico
export async function getProductExtra(
  tenantId: string,
  branchId: string,
  extraId: string,
): Promise<ProductExtra | null> {
  try {
    const extraRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/productExtras/${extraId}`)
    const snapshot = await get(extraRef)

    if (!snapshot.exists()) {
      return null
    }

    return {
      id: extraId,
      ...snapshot.val(),
    } as ProductExtra
  } catch (error) {
    console.error("Error al obtener extra:", error)
    throw error
  }
}

// Función para crear un nuevo extra
export async function createProductExtra(
  tenantId: string,
  branchId: string,
  extraData: ProductExtraFormData,
  imageFile?: File,
): Promise<ProductExtra> {
  try {
    const timestamp = new Date().toISOString()
    const extrasRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/productExtras`)

    // Generar un nuevo ID para el extra
    const newExtraRef = push(extrasRef)
    const extraId = newExtraRef.key!

    let imageUrl = extraData.imageUrl || ""

    // Si hay un archivo de imagen, subirlo a Blob
    if (imageFile) {
      const blobPath = `tenants/${tenantId}/branches/${branchId}/productExtras/${extraId}-${Date.now()}.${imageFile.name.split(".").pop()}`
      imageUrl = await uploadImageToBlob(imageFile, blobPath)
    }

    // Crear el objeto del extra y eliminar propiedades undefined
    const newExtra = removeUndefinedProperties({
      ...extraData,
      imageUrl,
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    // Guardar el extra en Realtime Database
    await set(newExtraRef, newExtra)

    return {
      id: extraId,
      ...newExtra,
    } as ProductExtra
  } catch (error) {
    console.error("Error al crear extra:", error)
    throw error
  }
}

// Función para actualizar un extra existente
export async function updateProductExtra(
  tenantId: string,
  branchId: string,
  extraId: string,
  extraData: Partial<ProductExtraFormData>,
  imageFile?: File,
): Promise<ProductExtra> {
  try {
    const timestamp = new Date().toISOString()
    const extraRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/productExtras/${extraId}`)

    // Obtener el extra actual
    const snapshot = await get(extraRef)
    if (!snapshot.exists()) {
      throw new Error("El extra no existe")
    }

    const currentExtra = snapshot.val()

    let imageUrl = extraData.imageUrl !== undefined ? extraData.imageUrl : currentExtra.imageUrl

    // Si hay un nuevo archivo de imagen, subirlo a Blob
    if (imageFile) {
      // Si ya existe una imagen, eliminarla primero
      if (currentExtra.imageUrl) {
        try {
          await deleteImageFromBlob(currentExtra.imageUrl)
        } catch (error) {
          console.error("Error al eliminar imagen anterior:", error)
          // Continuar aunque falle la eliminación
        }
      }

      const blobPath = `tenants/${tenantId}/branches/${branchId}/productExtras/${extraId}-${Date.now()}.${imageFile.name.split(".").pop()}`
      imageUrl = await uploadImageToBlob(imageFile, blobPath)
    }

    // Crear el objeto de actualización y eliminar propiedades undefined
    const updatedData = removeUndefinedProperties({
      ...extraData,
      imageUrl,
      updatedAt: timestamp,
    })

    // Actualizar el extra en Realtime Database
    await update(extraRef, updatedData)

    return {
      id: extraId,
      ...currentExtra,
      ...updatedData,
    } as ProductExtra
  } catch (error) {
    console.error("Error al actualizar extra:", error)
    throw error
  }
}

// Función para eliminar un extra
export async function deleteProductExtra(tenantId: string, branchId: string, extraId: string): Promise<void> {
  try {
    const extraRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/productExtras/${extraId}`)

    // Verificar si el extra existe
    const snapshot = await get(extraRef)
    if (!snapshot.exists()) {
      throw new Error("El extra no existe")
    }

    const extraData = snapshot.val()

    // Si tiene imagen, eliminarla de Blob
    if (extraData.imageUrl) {
      try {
        await deleteImageFromBlob(extraData.imageUrl)
      } catch (error) {
        console.error("Error al eliminar imagen de Blob:", error)
        // Continuar aunque falle la eliminación de la imagen
      }
    }

    // Eliminar el extra de Realtime Database
    await remove(extraRef)
  } catch (error) {
    console.error("Error al eliminar extra:", error)
    throw error
  }
}

// Función para obtener productos por categoría
export async function getProductsByCategory(
  tenantId: string,
  branchId: string,
  categoryId: string,
): Promise<Product[]> {
  try {
    const products = await getProducts(tenantId, branchId)
    return products.filter((product) => product.categoryId === categoryId)
  } catch (error) {
    console.error("Error al obtener productos por categoría:", error)
    throw error
  }
}

// Función para obtener productos por subcategoría
export async function getProductsBySubcategory(
  tenantId: string,
  branchId: string,
  subcategoryId: string,
): Promise<Product[]> {
  try {
    const products = await getProducts(tenantId, branchId)
    return products.filter((product) => product.subcategoryId === subcategoryId)
  } catch (error) {
    console.error("Error al obtener productos por subcategoría:", error)
    throw error
  }
}

// Añadir la exportación de productService como una exportación nombrada al final del archivo
export const productService = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductExtras,
  getProductExtra,
  createProductExtra,
  updateProductExtra,
  deleteProductExtra,
  getProductsByCategory,
  getProductsBySubcategory,
}
