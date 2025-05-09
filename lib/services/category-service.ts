import { db } from "@/lib/firebase/client"
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore"
import { del, put } from "@vercel/blob"
import { v4 as uuidv4 } from "uuid"

export interface Subcategory {
  id: string
  name: string
  description?: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  description?: string
  imageUrl?: string
  order: number
  isActive: boolean
  subcategories?: Subcategory[]
  createdAt: string
  updatedAt: string
}

// Función para obtener todas las categorías de una sucursal
export async function getCategories(tenantId: string, branchId: string): Promise<Category[]> {
  try {
    const categoriesRef = collection(db, `tenants/${tenantId}/branches/${branchId}/categories`)
    const q = query(categoriesRef, orderBy("order", "asc"))
    const snapshot = await getDocs(q)

    const categories: Category[] = []

    for (const categoryDoc of snapshot.docs) {
      const categoryData = categoryDoc.data() as Category

      // Obtener subcategorías
      const subcategoriesRef = collection(
        db,
        `tenants/${tenantId}/branches/${branchId}/categories/${categoryDoc.id}/subcategories`,
      )
      const subcategoriesQuery = query(subcategoriesRef, orderBy("order", "asc"))
      const subcategoriesSnapshot = await getDocs(subcategoriesQuery)

      const subcategories = subcategoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Subcategory[]

      categories.push({
        id: categoryDoc.id,
        ...categoryData,
        subcategories,
      })
    }

    return categories
  } catch (error) {
    console.error("Error al obtener categorías:", error)
    throw error
  }
}

// Función para obtener una categoría específica
export async function getCategory(tenantId: string, branchId: string, categoryId: string): Promise<Category | null> {
  try {
    const categoryRef = doc(db, `tenants/${tenantId}/branches/${branchId}/categories`, categoryId)
    const categoryDoc = await getDoc(categoryRef)

    if (!categoryDoc.exists()) {
      return null
    }

    const categoryData = categoryDoc.data() as Category

    // Obtener subcategorías
    const subcategoriesRef = collection(categoryRef, "subcategories")
    const subcategoriesQuery = query(subcategoriesRef, orderBy("order", "asc"))
    const subcategoriesSnapshot = await getDocs(subcategoriesQuery)

    const subcategories = subcategoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Subcategory[]

    return {
      id: categoryId,
      ...categoryData,
      subcategories,
    }
  } catch (error) {
    console.error("Error al obtener categoría:", error)
    throw error
  }
}

// Función para crear una nueva categoría
export async function createCategory(
  tenantId: string,
  branchId: string,
  categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">,
): Promise<Category> {
  try {
    const categoryId = uuidv4()
    const timestamp = new Date().toISOString()

    const newCategory: Category = {
      id: categoryId,
      ...categoryData,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    const categoryRef = doc(db, `tenants/${tenantId}/branches/${branchId}/categories`, categoryId)
    await setDoc(categoryRef, newCategory)

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
): Promise<Category> {
  try {
    const timestamp = new Date().toISOString()

    const categoryRef = doc(db, `tenants/${tenantId}/branches/${branchId}/categories`, categoryId)
    const categoryDoc = await getDoc(categoryRef)

    if (!categoryDoc.exists()) {
      throw new Error("La categoría no existe")
    }

    const updatedCategory = {
      ...categoryData,
      updatedAt: timestamp,
    }

    await updateDoc(categoryRef, updatedCategory)

    return {
      id: categoryId,
      ...categoryDoc.data(),
      ...updatedCategory,
    } as Category
  } catch (error) {
    console.error("Error al actualizar categoría:", error)
    throw error
  }
}

// Función para eliminar una categoría y su imagen
export async function deleteCategory(tenantId: string, branchId: string, categoryId: string): Promise<void> {
  try {
    // Primero obtenemos la categoría para ver si tiene imagen
    const categoryRef = doc(db, `tenants/${tenantId}/branches/${branchId}/categories`, categoryId)
    const categoryDoc = await getDoc(categoryRef)

    if (!categoryDoc.exists()) {
      throw new Error("La categoría no existe")
    }

    const categoryData = categoryDoc.data() as Category

    // Si tiene imagen, la eliminamos de Blob
    if (categoryData.imageUrl) {
      try {
        await del(categoryData.imageUrl)
        console.log("Imagen eliminada de Blob:", categoryData.imageUrl)
      } catch (blobError) {
        console.error("Error al eliminar imagen de Blob:", blobError)
        // Continuamos con la eliminación de la categoría aunque falle la eliminación de la imagen
      }
    }

    // Eliminar todas las subcategorías
    const subcategoriesRef = collection(categoryRef, "subcategories")
    const subcategoriesSnapshot = await getDocs(subcategoriesRef)

    const deleteSubcategoriesPromises = subcategoriesSnapshot.docs.map((doc) => deleteDoc(doc.ref))

    await Promise.all(deleteSubcategoriesPromises)

    // Finalmente eliminamos la categoría
    await deleteDoc(categoryRef)
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
    const filename = `tenants/${tenantId}/branches/${branchId}/categories/${categoryId}-${Date.now()}.${file.name.split(".").pop()}`

    // Subir la imagen a Blob
    const blob = await put(filename, file, {
      access: "public",
    })

    // Actualizar la URL de la imagen en la categoría
    const categoryRef = doc(db, `tenants/${tenantId}/branches/${branchId}/categories`, categoryId)
    await updateDoc(categoryRef, {
      imageUrl: blob.url,
      updatedAt: new Date().toISOString(),
    })

    return blob.url
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
    const subcategoryId = uuidv4()
    const timestamp = new Date().toISOString()

    const newSubcategory: Subcategory = {
      id: subcategoryId,
      ...subcategoryData,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    const subcategoryRef = doc(
      db,
      `tenants/${tenantId}/branches/${branchId}/categories/${categoryId}/subcategories`,
      subcategoryId,
    )

    await setDoc(subcategoryRef, newSubcategory)

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

    const subcategoryRef = doc(
      db,
      `tenants/${tenantId}/branches/${branchId}/categories/${categoryId}/subcategories`,
      subcategoryId,
    )

    const subcategoryDoc = await getDoc(subcategoryRef)

    if (!subcategoryDoc.exists()) {
      throw new Error("La subcategoría no existe")
    }

    const updatedSubcategory = {
      ...subcategoryData,
      updatedAt: timestamp,
    }

    await updateDoc(subcategoryRef, updatedSubcategory)

    return {
      id: subcategoryId,
      ...subcategoryDoc.data(),
      ...updatedSubcategory,
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
    const subcategoryRef = doc(
      db,
      `tenants/${tenantId}/branches/${branchId}/categories/${categoryId}/subcategories`,
      subcategoryId,
    )

    await deleteDoc(subcategoryRef)
  } catch (error) {
    console.error("Error al eliminar subcategoría:", error)
    throw error
  }
}
