import { getDatabase, ref, get, set, update, remove } from "firebase/database"
import { deleteImage } from "@/app/api/upload/actions"

// Obtener la instancia de Realtime Database
const realtimeDb = getDatabase()

export interface Category {
  id: string
  name: string
  description?: string
  image?: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  tenantId: string
  branchId: string
  parentId?: string // For subcategories
}

// Get all categories for a tenant and branch
export async function getCategories(tenantId: string, branchId: string): Promise<Category[]> {
  try {
    const categoriesRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/categories`)
    const snapshot = await get(categoriesRef)

    if (!snapshot.exists()) {
      return []
    }

    const categoriesData = snapshot.val()
    const categories: Category[] = Object.values(categoriesData || {})

    // Ordenar por el campo order
    return categories.sort((a: any, b: any) => a.order - b.order)
  } catch (error) {
    console.error("Error getting categories:", error)
    throw error
  }
}

// Get a specific category
export async function getCategory(tenantId: string, branchId: string, categoryId: string): Promise<Category | null> {
  try {
    const categoryRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/categories/${categoryId}`)
    const snapshot = await get(categoryRef)

    if (!snapshot.exists()) {
      return null
    }

    return snapshot.val() as Category
  } catch (error) {
    console.error("Error getting category:", error)
    throw error
  }
}

// Create a new category
export async function createCategory(
  tenantId: string,
  branchId: string,
  categoryData: Omit<Category, "id" | "createdAt" | "updatedAt" | "tenantId" | "branchId">,
): Promise<Category> {
  try {
    const categoryId = crypto.randomUUID().substring(0, 8)
    const now = new Date().toISOString()

    // Crear objeto base de categoría
    const newCategory: Category = {
      id: categoryId,
      ...categoryData,
      createdAt: now,
      updatedAt: now,
      tenantId,
      branchId,
      order: categoryData.order || 0,
      isActive: categoryData.isActive !== undefined ? categoryData.isActive : true,
    }

    // Si parentId es undefined o una cadena vacía, asegurarse de que no se incluya
    if (!categoryData.parentId) {
      delete (newCategory as any).parentId
    }

    // Guardar en Realtime Database
    const categoryRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/categories/${categoryId}`)
    await set(categoryRef, newCategory)

    return newCategory
  } catch (error) {
    console.error("Error creating category:", error)
    throw error
  }
}

// Update an existing category
export async function updateCategory(
  tenantId: string,
  branchId: string,
  categoryId: string,
  categoryData: Partial<Omit<Category, "id" | "createdAt" | "tenantId" | "branchId">>,
): Promise<Category> {
  try {
    const categoryRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/categories/${categoryId}`)
    const snapshot = await get(categoryRef)

    if (!snapshot.exists()) {
      throw new Error("Category not found")
    }

    const existingCategory = snapshot.val() as Category

    // Crear objeto de actualización
    const updatedData: Record<string, any> = {
      ...categoryData,
      updatedAt: new Date().toISOString(),
    }

    // Si parentId es undefined o una cadena vacía, eliminarlo
    if (categoryData.parentId === undefined || categoryData.parentId === "") {
      delete updatedData.parentId
    }

    // Actualizar en Realtime Database
    await update(categoryRef, updatedData)

    return {
      ...existingCategory,
      ...updatedData,
    }
  } catch (error) {
    console.error("Error updating category:", error)
    throw error
  }
}

// Delete a category
export async function deleteCategory(tenantId: string, branchId: string, categoryId: string): Promise<void> {
  try {
    // Primero obtenemos la categoría para verificar si tiene imagen
    const categoryRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/categories/${categoryId}`)
    const snapshot = await get(categoryRef)

    if (!snapshot.exists()) {
      throw new Error("Categoría no encontrada")
    }

    const category = snapshot.val() as Category

    // Verificamos si hay subcategorías
    const categoriesRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/categories`)
    const categoriesSnapshot = await get(categoriesRef)

    if (categoriesSnapshot.exists()) {
      const categoriesData = categoriesSnapshot.val()
      const hasSubcategories = Object.values(categoriesData).some((cat: any) => cat.parentId === categoryId)

      if (hasSubcategories) {
        throw new Error("No se puede eliminar una categoría con subcategorías. Elimine primero las subcategorías.")
      }
    }

    // Eliminamos la imagen si existe
    if (category.image) {
      try {
        console.log("Eliminando imagen de categoría:", category.image)
        await deleteImage(category.image)
        console.log("Imagen eliminada correctamente:", category.image)
      } catch (imageError) {
        console.error("Error al eliminar la imagen:", imageError)
        // Continuamos con la eliminación de la categoría aunque falle la eliminación de la imagen
      }
    }

    // Eliminamos la categoría
    await remove(categoryRef)
  } catch (error) {
    console.error("Error al eliminar la categoría:", error)
    throw error
  }
}

// Get subcategories for a parent category
export async function getSubcategories(tenantId: string, branchId: string, parentId: string): Promise<Category[]> {
  try {
    const categoriesRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/categories`)
    const snapshot = await get(categoriesRef)

    if (!snapshot.exists()) {
      return []
    }

    const categoriesData = snapshot.val()
    const categories: Category[] = Object.values(categoriesData || {})

    return categories
      .filter((category: Category) => category.parentId === parentId)
      .sort((a: Category, b: Category) => a.order - b.order)
  } catch (error) {
    console.error("Error getting subcategories:", error)
    throw error
  }
}

// Get only parent categories (no subcategories)
export async function getParentCategories(tenantId: string, branchId: string): Promise<Category[]> {
  try {
    const categoriesRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/categories`)
    const snapshot = await get(categoriesRef)

    if (!snapshot.exists()) {
      return []
    }

    const categoriesData = snapshot.val()
    const categories: Category[] = Object.values(categoriesData || {})

    return categories
      .filter((category: Category) => !category.parentId)
      .sort((a: Category, b: Category) => a.order - b.order)
  } catch (error) {
    console.error("Error getting parent categories:", error)
    throw error
  }
}
