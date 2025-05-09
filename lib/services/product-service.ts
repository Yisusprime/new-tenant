import { ref, get, set, update, remove, push } from "firebase/database"
import { realtimeDb } from "@/lib/firebase/client"
import { uploadImageToBlob, deleteImageFromBlob } from "@/lib/services/category-service"

export interface ProductExtra {
  id: string
  name: string
  price: number
  description?: string
  isRequired: boolean
  multipleSelection: boolean
  maxSelections?: number
  options: ProductExtraOption[]
  order: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductExtraOption {
  id: string
  name: string
  price: number
  order: number
  active: boolean
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  discountPrice?: number
  imageUrl?: string
  categoryId: string
  subcategoryId?: string
  featured: boolean
  available: boolean
  order: number
  extras?: Record<string, ProductExtra>
  createdAt: string
  updatedAt: string
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

    // Convertir el objeto a un array y ordenar por el campo order
    const products = Object.entries(productsData).map(([id, data]) => {
      const productData = data as any

      // Convertir extras si existen
      let extras: ProductExtra[] = []
      if (productData.extras) {
        extras = Object.entries(productData.extras).map(([extraId, extraData]) => {
          const extra = extraData as any

          // Convertir opciones si existen
          let options: ProductExtraOption[] = []
          if (extra.options) {
            options = Object.entries(extra.options).map(([optionId, optionData]) => ({
              id: optionId,
              ...(optionData as any),
            }))
            // Ordenar opciones por orden
            options.sort((a, b) => a.order - b.order)
          }

          return {
            id: extraId,
            ...extra,
            options,
          }
        })
        // Ordenar extras por orden
        extras.sort((a, b) => a.order - b.order)
      }

      return {
        id,
        ...productData,
        extras,
      } as Product
    })

    // Ordenar productos por orden
    return products.sort((a, b) => a.order - b.order)
  } catch (error) {
    console.error("Error al obtener productos:", error)
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
  categoryId: string,
  subcategoryId: string,
): Promise<Product[]> {
  try {
    const products = await getProductsByCategory(tenantId, branchId, categoryId)
    return products.filter((product) => product.subcategoryId === subcategoryId)
  } catch (error) {
    console.error("Error al obtener productos por subcategoría:", error)
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

    const productData = snapshot.val()

    // Convertir extras si existen
    let extras: ProductExtra[] = []
    if (productData.extras) {
      extras = Object.entries(productData.extras).map(([extraId, extraData]) => {
        const extra = extraData as any

        // Convertir opciones si existen
        let options: ProductExtraOption[] = []
        if (extra.options) {
          options = Object.entries(extra.options).map(([optionId, optionData]) => ({
            id: optionId,
            ...(optionData as any),
          }))
          // Ordenar opciones por orden
          options.sort((a, b) => a.order - b.order)
        }

        return {
          id: extraId,
          ...extra,
          options,
        }
      })
      // Ordenar extras por orden
      extras.sort((a, b) => a.order - b.order)
    }

    return {
      id: productId,
      ...productData,
      extras,
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
  productData: Omit<Product, "id" | "createdAt" | "updatedAt" | "extras">,
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

    const newProduct = {
      ...productData,
      id: productId,
      imageUrl,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    // Eliminar el campo id antes de guardar en la base de datos
    const { id, extras, ...productToSave } = newProduct as any

    // Guardar el producto en Realtime Database
    await set(newProductRef, productToSave)

    return newProduct
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
  productData: Partial<Omit<Product, "id" | "createdAt" | "updatedAt" | "extras">>,
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

    const updatedData = {
      ...productData,
      imageUrl,
      updatedAt: timestamp,
    }

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

// Función para eliminar un producto y su imagen
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
        console.log("Imagen eliminada de Blob:", productData.imageUrl)
      } catch (blobError) {
        console.error("Error al eliminar imagen de Blob:", blobError)
        // Continuamos con la eliminación del producto aunque falle la eliminación de la imagen
      }
    }

    // Eliminar el producto de Realtime Database
    await remove(productRef)
  } catch (error) {
    console.error("Error al eliminar producto:", error)
    throw error
  }
}

// Funciones para extras de productos

// Función para crear un extra para un producto
export async function createProductExtra(
  tenantId: string,
  branchId: string,
  productId: string,
  extraData: Omit<ProductExtra, "id" | "createdAt" | "updatedAt" | "options"> & {
    options: Omit<ProductExtraOption, "id">[]
  },
): Promise<ProductExtra> {
  try {
    const timestamp = new Date().toISOString()
    const extrasRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/products/${productId}/extras`)

    // Generar un nuevo ID para el extra
    const newExtraRef = push(extrasRef)
    const extraId = newExtraRef.key!

    // Procesar las opciones
    const optionsWithIds: Record<string, Omit<ProductExtraOption, "id">> = {}
    extraData.options.forEach((option, index) => {
      const optionId = `option_${Date.now()}_${index}`
      optionsWithIds[optionId] = {
        ...option,
        order: option.order || index,
        active: option.active !== undefined ? option.active : true,
      }
    })

    const newExtra = {
      ...extraData,
      options: optionsWithIds,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    // Guardar el extra en Realtime Database
    await set(newExtraRef, newExtra)

    // Convertir las opciones de vuelta a un array para el retorno
    const optionsArray = Object.entries(optionsWithIds).map(([id, data]) => ({
      id,
      ...data,
    }))

    return {
      id: extraId,
      ...extraData,
      options: optionsArray,
      createdAt: timestamp,
      updatedAt: timestamp,
    } as ProductExtra
  } catch (error) {
    console.error("Error al crear extra de producto:", error)
    throw error
  }
}

// Función para actualizar un extra de producto
export async function updateProductExtra(
  tenantId: string,
  branchId: string,
  productId: string,
  extraId: string,
  extraData: Partial<Omit<ProductExtra, "id" | "createdAt" | "updatedAt" | "options">> & {
    options?: Partial<ProductExtraOption>[]
  },
): Promise<ProductExtra> {
  try {
    const timestamp = new Date().toISOString()
    const extraRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/products/${productId}/extras/${extraId}`)

    // Obtener el extra actual
    const snapshot = await get(extraRef)
    if (!snapshot.exists()) {
      throw new Error("El extra no existe")
    }

    const currentExtra = snapshot.val()

    const updatedData: any = {
      ...extraData,
      updatedAt: timestamp,
    }

    // Si hay opciones para actualizar
    if (extraData.options) {
      // Convertir las opciones actuales a un objeto
      const currentOptions = currentExtra.options || {}

      // Crear un nuevo objeto de opciones
      const updatedOptions: Record<string, any> = {}

      // Actualizar opciones existentes y añadir nuevas
      extraData.options.forEach((option, index) => {
        if (option.id) {
          // Actualizar opción existente
          updatedOptions[option.id] = {
            ...currentOptions[option.id],
            ...option,
            updatedAt: timestamp,
          }
          delete updatedOptions[option.id].id // Eliminar el id antes de guardar
        } else {
          // Añadir nueva opción
          const optionId = `option_${Date.now()}_${index}`
          updatedOptions[optionId] = {
            ...option,
            order: option.order || Object.keys(currentOptions).length + index,
            active: option.active !== undefined ? option.active : true,
          }
        }
      })

      updatedData.options = updatedOptions
    }

    // Actualizar el extra en Realtime Database
    await update(extraRef, updatedData)

    // Obtener el extra actualizado
    const updatedSnapshot = await get(extraRef)
    const updatedExtra = updatedSnapshot.val()

    // Convertir las opciones de vuelta a un array para el retorno
    const optionsArray = updatedExtra.options
      ? Object.entries(updatedExtra.options).map(([id, data]) => ({
          id,
          ...(data as any),
        }))
      : []

    return {
      id: extraId,
      ...updatedExtra,
      options: optionsArray,
    } as ProductExtra
  } catch (error) {
    console.error("Error al actualizar extra de producto:", error)
    throw error
  }
}

// Función para eliminar un extra de producto
export async function deleteProductExtra(
  tenantId: string,
  branchId: string,
  productId: string,
  extraId: string,
): Promise<void> {
  try {
    const extraRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/products/${productId}/extras/${extraId}`)

    // Verificar que el extra existe
    const snapshot = await get(extraRef)
    if (!snapshot.exists()) {
      throw new Error("El extra no existe")
    }

    // Eliminar el extra de Realtime Database
    await remove(extraRef)
  } catch (error) {
    console.error("Error al eliminar extra de producto:", error)
    throw error
  }
}

// Función para eliminar una opción de un extra
export async function deleteProductExtraOption(
  tenantId: string,
  branchId: string,
  productId: string,
  extraId: string,
  optionId: string,
): Promise<void> {
  try {
    const optionRef = ref(
      realtimeDb,
      `tenants/${tenantId}/branches/${branchId}/products/${productId}/extras/${extraId}/options/${optionId}`,
    )

    // Verificar que la opción existe
    const snapshot = await get(optionRef)
    if (!snapshot.exists()) {
      throw new Error("La opción no existe")
    }

    // Eliminar la opción de Realtime Database
    await remove(optionRef)
  } catch (error) {
    console.error("Error al eliminar opción de extra:", error)
    throw error
  }
}

// Función para obtener todos los extras de un producto
export async function getProductExtras(tenantId: string, branchId: string, productId: string): Promise<ProductExtra[]> {
  try {
    const extrasRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/products/${productId}/extras`)
    const snapshot = await get(extrasRef)

    if (!snapshot.exists()) {
      return []
    }

    const extrasData = snapshot.val()

    // Convertir el objeto a un array
    const extras = Object.entries(extrasData).map(([extraId, extraData]) => {
      const extra = extraData as any

      // Convertir opciones si existen
      let options: ProductExtraOption[] = []
      if (extra.options) {
        options = Object.entries(extra.options).map(([optionId, optionData]) => ({
          id: optionId,
          ...(optionData as any),
        }))
        // Ordenar opciones por orden
        options.sort((a, b) => a.order - b.order)
      }

      return {
        id: extraId,
        ...extra,
        options,
      }
    }) as ProductExtra[]

    // Ordenar extras por orden
    return extras.sort((a, b) => a.order - b.order)
  } catch (error) {
    console.error("Error al obtener extras de producto:", error)
    throw error
  }
}

// Función para obtener un extra específico de un producto
export async function getProductExtra(
  tenantId: string,
  branchId: string,
  productId: string,
  extraId: string,
): Promise<ProductExtra | null> {
  try {
    const extraRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/products/${productId}/extras/${extraId}`)
    const snapshot = await get(extraRef)

    if (!snapshot.exists()) {
      return null
    }

    const extraData = snapshot.val()

    // Convertir opciones si existen
    let options: ProductExtraOption[] = []
    if (extraData.options) {
      options = Object.entries(extraData.options).map(([optionId, optionData]) => ({
        id: optionId,
        ...(optionData as any),
      }))
      // Ordenar opciones por orden
      options.sort((a, b) => a.order - b.order)
    }

    return {
      id: extraId,
      ...extraData,
      options,
    } as ProductExtra
  } catch (error) {
    console.error("Error al obtener extra de producto:", error)
    throw error
  }
}
