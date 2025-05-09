import { db } from "@/lib/firebase/client"
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore"
import { put } from "@vercel/blob"

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
    const categoriesRef = collection(db, `tenants/${tenantId}/branches/${branchId}/categories`)
    const q = query(categoriesRef, orderBy("order", "asc"))
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => doc.data() as Category)
  } catch (error) {
    console.error("Error getting categories:", error)
    throw error
  }
}

// Get a specific category
export async function getCategory(tenantId: string, branchId: string, categoryId: string): Promise<Category | null> {
  try {
    const categoryRef = doc(db, `tenants/${tenantId}/branches/${branchId}/categories`, categoryId)
    const categoryDoc = await getDoc(categoryRef)

    if (!categoryDoc.exists()) {
      return null
    }

    return categoryDoc.data() as Category
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
    const newCategory: Omit<Category, "parentId"> & { parentId?: string } = {
      id: categoryId,
      ...categoryData,
      createdAt: now,
      updatedAt: now,
      tenantId,
      branchId,
    }

    // Si parentId es undefined o una cadena vacía, eliminar la propiedad
    if (!categoryData.parentId) {
      delete newCategory.parentId
    }

    await setDoc(doc(db, `tenants/${tenantId}/branches/${branchId}/categories`, categoryId), newCategory)

    return newCategory as Category
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
    const categoryRef = doc(db, `tenants/${tenantId}/branches/${branchId}/categories`, categoryId)
    const categoryDoc = await getDoc(categoryRef)

    if (!categoryDoc.exists()) {
      throw new Error("Category not found")
    }

    // Crear objeto de actualización
    const updatedData: Record<string, any> = {
      ...categoryData,
      updatedAt: new Date().toISOString(),
    }

    // Si parentId es undefined o una cadena vacía, eliminar la propiedad
    if (categoryData.parentId === undefined || categoryData.parentId === "") {
      delete updatedData.parentId
    }

    await updateDoc(categoryRef, updatedData)

    return {
      ...(categoryDoc.data() as Category),
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
    // First check if there are subcategories
    const categoriesRef = collection(db, `tenants/${tenantId}/branches/${branchId}/categories`)
    const snapshot = await getDocs(categoriesRef)
    const hasSubcategories = snapshot.docs.some((doc) => {
      const data = doc.data()
      return data.parentId === categoryId
    })

    if (hasSubcategories) {
      throw new Error("Cannot delete category with subcategories. Delete subcategories first.")
    }

    await deleteDoc(doc(db, `tenants/${tenantId}/branches/${branchId}/categories`, categoryId))
  } catch (error) {
    console.error("Error deleting category:", error)
    throw error
  }
}

// Get subcategories for a parent category
export async function getSubcategories(tenantId: string, branchId: string, parentId: string): Promise<Category[]> {
  try {
    const categoriesRef = collection(db, `tenants/${tenantId}/branches/${branchId}/categories`)
    const snapshot = await getDocs(categoriesRef)

    return snapshot.docs
      .map((doc) => doc.data() as Category)
      .filter((category) => category.parentId === parentId)
      .sort((a, b) => a.order - b.order)
  } catch (error) {
    console.error("Error getting subcategories:", error)
    throw error
  }
}

// Get only parent categories (no subcategories)
export async function getParentCategories(tenantId: string, branchId: string): Promise<Category[]> {
  try {
    const categoriesRef = collection(db, `tenants/${tenantId}/branches/${branchId}/categories`)
    const snapshot = await getDocs(categoriesRef)

    return snapshot.docs
      .map((doc) => doc.data() as Category)
      .filter((category) => !category.parentId)
      .sort((a, b) => a.order - b.order)
  } catch (error) {
    console.error("Error getting parent categories:", error)
    throw error
  }
}

// Upload category image
export async function uploadCategoryImage(
  tenantId: string,
  branchId: string,
  categoryId: string,
  file: File,
): Promise<string> {
  try {
    // Generate a unique filename
    const filename = `${tenantId}-${branchId}-${categoryId}-${Date.now()}.${file.name.split(".").pop()}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
    })

    // Update the category with the new image URL
    const categoryRef = doc(db, `tenants/${tenantId}/branches/${branchId}/categories`, categoryId)
    await updateDoc(categoryRef, {
      image: blob.url,
      updatedAt: new Date().toISOString(),
    })

    return blob.url
  } catch (error) {
    console.error("Error uploading category image:", error)
    throw error
  }
}
