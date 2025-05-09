import { ref, get, set, update, remove, push } from "firebase/database"
import { realtimeDb } from "@/lib/firebase/client"

export interface Subcategory {
  id: string
  name: string
  description?: string
  imageUrl?: string
  order: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  description?: string
  imageUrl?: string
  order: number
  active: boolean
  subcategories?: Record<string, Subcategory>
  createdAt: string
  updatedAt: string
}

// Función para obtener todas las categorías de una sucursal
export async function getAllCategories(tenantId: string, branchId: string): Promise<Category[]> {
  try {
    const categoriesRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/categories`)
    const snapshot = await get(categoriesRef)

    if (!snapshot.exists()) {
      return []
    }

    const categoriesData = snapshot.val()

    // Convertir el objeto a un array y ordenar por el campo order
    const categories = Object.entries(categoriesData).map(([id, data]) => {
      const categoryData = data as any

      // Convertir subcategorías si existen
      let subcategories: Subcategory[] = []
      if (categoryData.subcategories) {
        subcategories = Object.entries(categoryData.subcategories).map(([subId, subData]) => ({
          id: subId,
          ...(subData as any),
        }))
        // Ordenar subcategorías por orden
        subcategories.sort((a, b) => a.order - b.order)
      }

      return {
        id,
        ...categoryData,
        subcategories,
      } as Category
    })

    // Ordenar categorías por orden
    return categories.sort((a, b) => a.order - b.order)
  } catch (error) {
    console.error("Error al obtener categorías:", error)
    throw error
  }
}

// Función para obtener todas las subcategorías de una categoría
export async function getAllSubcategories(
  tenantId: string,
  branchId: string,
  categoryId: string,
): Promise<Subcategory[]> {
  try {
    const subcategoriesRef = ref(
      realtimeDb,
      `tenants/${tenantId}/branches/${branchId}/categories/${categoryId}/subcategories`,
    )
    const snapshot = await get(subcategoriesRef)

    if (!snapshot.exists()) {
      return []
    }

    const subcategoriesData = snapshot.val()

    // Convertir el objeto a un array y ordenar por el campo order
    const subcategories = Object.entries(subcategoriesData).map(([id, data]) => ({
      id,
      ...(data as any),
    }))

    // Ordenar subcategorías por orden
    return subcategories.sort((a, b) => a.order - b.order)
  } catch (error) {
    console.error("Error al obtener subcategorías:", error)
    throw error
  }
}

// Función para obtener una categoría específica
export async function getCategory(tenantId: string, branchId: string, categoryId: string): Promise<Category | null> {
  try {
    const categoryRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/categories/${categoryId}`)
    const snapshot = await get(categoryRef)

    if (!snapshot.exists()) {
      return null
    }

    const categoryData = snapshot.val()

    // Convertir subcategorías si existen
    let subcategories: Subcategory[] = []
    if (categoryData.subcategories) {
      subcategories = Object.entries(categoryData.subcategories).map(([subId, subData]) => ({
        id: subId,
        ...(subData as any),
      }))
      // Ordenar subcategorías por orden
      subcategories.sort((a, b) => a.order - b.order)
    }

    return {
      id: categoryId,
      ...categoryData,
      subcategories,
    } as Category
  } catch (error) {
    console.error("Error al obtener categoría:", error)
    throw error
  }
}

// Función para subir una imagen a Blob a través del endpoint de API
export async function uploadImageToBlob(file: File, path: string): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("filename", path)

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Error al subir imagen")
  }

  const data = await response.json()
  return data.url
}

// Función para eliminar una imagen de Blob a través del endpoint de API
export async function deleteImageFromBlob(url: string): Promise<void> {
  const response = await fetch(`/api/upload?url=${encodeURIComponent(url)}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Error al eliminar imagen")
  }
}

// Función para crear una nueva categoría
export async function createCategory(
  tenantId: string,
  branchId: string,
  categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">,
  imageFile?: File,
): Promise<Category> {
  try {
    const timestamp = new Date().toISOString()
    const categoriesRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/categories`)

    // Generar un nuevo ID para la categoría
    const newCategoryRef = push(categoriesRef)
    const categoryId = newCategoryRef.key!

    let imageUrl = ""

    // Si hay un archivo de imagen, subirlo a Blob
    if (imageFile) {
      const blobPath = `tenants/${tenantId}/branches/${branchId}/categories/${categoryId}-${Date.now()}.${imageFile.name.split(".").pop()}`
      imageUrl = await uploadImageToBlob(imageFile, blobPath)
    }

    const newCategory = {
      ...categoryData,
      id: categoryId,
      imageUrl,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    // Eliminar el campo id antes de guardar en la base de datos
    const { id, subcategories, ...categoryToSave } = newCategory

    // Guardar la categoría en Realtime Database
    await set(newCategoryRef, categoryToSave)

    return newCategory
  } catch (error) {
    console.error("Error al crear categoría:", error)
    throw error
  }
}

// Función para actualizar una categoría existente
export async function updateCategory(
  tenantId: string,
  branchId: string,
  categoryId: string,
  categoryData: Partial<Omit<Category, "id" | "createdAt" | "updatedAt">>,
  imageFile?: File,
): Promise<Category> {
  try {
    const timestamp = new Date().toISOString()
    const categoryRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/categories/${categoryId}`)

    // Obtener la categoría actual
    const snapshot = await get(categoryRef)
    if (!snapshot.exists()) {
      throw new Error("La categoría no existe")
    }

    const currentCategory = snapshot.val()

    let imageUrl = categoryData.imageUrl !== undefined ? categoryData.imageUrl : currentCategory.imageUrl

    // Si hay un nuevo archivo de imagen, subirlo a Blob
    if (imageFile) {
      // Si ya existe una imagen, eliminarla primero
      if (currentCategory.imageUrl) {
        try {
          await deleteImageFromBlob(currentCategory.imageUrl)
        } catch (error) {
          console.error("Error al eliminar imagen anterior:", error)
          // Continuar aunque falle la eliminación
        }
      }

      const blobPath = `tenants/${tenantId}/branches/${branchId}/categories/${categoryId}-${Date.now()}.${imageFile.name.split(".").pop()}`
      imageUrl = await uploadImageToBlob(imageFile, blobPath)
    }

    const updatedData = {
      ...categoryData,
      imageUrl,
      updatedAt: timestamp,
    }

    // Actualizar la categoría en Realtime Database
    await update(categoryRef, updatedData)

    return {
      id: categoryId,
      ...currentCategory,
      ...updatedData,
    } as Category
  } catch (error) {
    console.error("Error al actualizar categoría:", error)
    throw error
  }
}

// Función para eliminar una categoría y su imagen
export async function deleteCategory(tenantId: string, branchId: string, categoryId: string): Promise<void> {
  try {
    const categoryRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/categories/${categoryId}`)

    // Obtener la categoría para ver si tiene imagen
    const snapshot = await get(categoryRef)
    if (!snapshot.exists()) {
      throw new Error("La categoría no existe")
    }

    const categoryData = snapshot.val()

    // Si tiene imagen, eliminarla de Blob
    if (categoryData.imageUrl) {
      try {
        await deleteImageFromBlob(categoryData.imageUrl)
        console.log("Imagen eliminada de Blob:", categoryData.imageUrl)
      } catch (blobError) {
        console.error("Error al eliminar imagen de Blob:", blobError)
        // Continuamos con la eliminación de la categoría aunque falle la eliminación de la imagen
      }
    }

    // Eliminar la categoría de Realtime Database
    await remove(categoryRef)
  } catch (error) {
    console.error("Error al eliminar categoría:", error)
    throw error
  }
}

// Función para subir una imagen de categoría a Blob
export async function uploadCategoryImage(
  tenantId: string,
  branchId: string,
  categoryId: string,
  file: File,
): Promise<string> {
  try {
    // Crear un nombre de archivo único
    const blobPath = `tenants/${tenantId}/branches/${branchId}/categories/${categoryId}-${Date.now()}.${file.name.split(".").pop()}`

    // Subir la imagen a Blob a través del endpoint de API
    const imageUrl = await uploadImageToBlob(file, blobPath)

    // Actualizar la URL de la imagen en la categoría
    const categoryRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/categories/${categoryId}`)
    await update(categoryRef, {
      imageUrl,
      updatedAt: new Date().toISOString(),
    })

    return imageUrl
  } catch (error) {
    console.error("Error al subir imagen de categoría:", error)
    throw error
  }
}

// Funciones para subcategorías

// Función para crear una subcategoría
export async function createSubcategory(
  tenantId: string,
  branchId: string,
  categoryId: string,
  subcategoryData: Omit<Subcategory, "id" | "createdAt" | "updatedAt">,
): Promise<Subcategory> {
  try {
    const timestamp = new Date().toISOString()
    const subcategoriesRef = ref(
      realtimeDb,
      `tenants/${tenantId}/branches/${branchId}/categories/${categoryId}/subcategories`,
    )

    // Generar un nuevo ID para la subcategoría
    const newSubcategoryRef = push(subcategoriesRef)
    const subcategoryId = newSubcategoryRef.key!

    const newSubcategory = {
      ...subcategoryData,
      id: subcategoryId,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    // Eliminar el campo id antes de guardar en la base de datos
    const { id, ...subcategoryToSave } = newSubcategory

    // Guardar la subcategoría en Realtime Database
    await set(newSubcategoryRef, subcategoryToSave)

    return newSubcategory
  } catch (error) {
    console.error("Error al crear subcategoría:", error)
    throw error
  }
}

// Función para actualizar una subcategoría
export async function updateSubcategory(
  tenantId: string,
  branchId: string,
  categoryId: string,
  subcategoryId: string,
  subcategoryData: Partial<Omit<Subcategory, "id" | "createdAt" | "updatedAt">>,
): Promise<Subcategory> {
  try {
    const timestamp = new Date().toISOString()
    const subcategoryRef = ref(
      realtimeDb,
      `tenants/${tenantId}/branches/${branchId}/categories/${categoryId}/subcategories/${subcategoryId}`,
    )

    // Obtener la subcategoría actual
    const snapshot = await get(subcategoryRef)
    if (!snapshot.exists()) {
      throw new Error("La subcategoría no existe")
    }

    const currentSubcategory = snapshot.val()

    const updatedData = {
      ...subcategoryData,
      updatedAt: timestamp,
    }

    // Actualizar la subcategoría en Realtime Database
    await update(subcategoryRef, updatedData)

    return {
      id: subcategoryId,
      ...currentSubcategory,
      ...updatedData,
    } as Subcategory
  } catch (error) {
    console.error("Error al actualizar subcategoría:", error)
    throw error
  }
}

// Función para eliminar una subcategoría
export async function deleteSubcategory(
  tenantId: string,
  branchId: string,
  categoryId: string,
  subcategoryId: string,
): Promise<void> {
  try {
    const subcategoryRef = ref(
      realtimeDb,
      `tenants/${tenantId}/branches/${branchId}/categories/${categoryId}/subcategories/${subcategoryId}`,
    )

    // Eliminar la subcategoría de Realtime Database
    await remove(subcategoryRef)
  } catch (error) {
    console.error("Error al eliminar subcategoría:", error)
    throw error
  }
}
