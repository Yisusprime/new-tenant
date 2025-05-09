import { db } from "../firebase/admin"
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore"

class CategoryService {
  private getCollectionPath(tenantId: string, branchId: string) {
    return `tenants/${tenantId}/branches/${branchId}/categories`
  }

  private getSubcategoriesCollectionPath(tenantId: string, branchId: string, categoryId: string) {
    return `tenants/${tenantId}/branches/${branchId}/categories/${categoryId}/subcategories`
  }

  async getCategories(tenantId: string, branchId: string) {
    try {
      const categoriesRef = collection(db, this.getCollectionPath(tenantId, branchId))
      const categoriesSnapshot = await getDocs(query(categoriesRef, orderBy("order", "asc")))

      return categoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      console.error("Error getting categories:", error)
      throw error
    }
  }

  async getCategory(tenantId: string, branchId: string, categoryId: string) {
    try {
      const categoryRef = doc(db, this.getCollectionPath(tenantId, branchId), categoryId)
      const categorySnapshot = await getDoc(categoryRef)

      if (!categorySnapshot.exists()) {
        throw new Error("Category not found")
      }

      return {
        id: categorySnapshot.id,
        ...categorySnapshot.data(),
      }
    } catch (error) {
      console.error("Error getting category:", error)
      throw error
    }
  }

  async createCategory(tenantId: string, branchId: string, categoryData: any) {
    try {
      const categoriesRef = collection(db, this.getCollectionPath(tenantId, branchId))
      const newCategoryRef = await addDoc(categoriesRef, {
        ...categoryData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      return {
        id: newCategoryRef.id,
        ...categoryData,
      }
    } catch (error) {
      console.error("Error creating category:", error)
      throw error
    }
  }

  async updateCategory(tenantId: string, branchId: string, categoryId: string, categoryData: any) {
    try {
      const categoryRef = doc(db, this.getCollectionPath(tenantId, branchId), categoryId)
      await updateDoc(categoryRef, {
        ...categoryData,
        updatedAt: new Date(),
      })

      return {
        id: categoryId,
        ...categoryData,
      }
    } catch (error) {
      console.error("Error updating category:", error)
      throw error
    }
  }

  async deleteCategory(tenantId: string, branchId: string, categoryId: string) {
    try {
      const categoryRef = doc(db, this.getCollectionPath(tenantId, branchId), categoryId)
      await deleteDoc(categoryRef)
      return true
    } catch (error) {
      console.error("Error deleting category:", error)
      throw error
    }
  }

  // Subcategories methods
  async getSubcategories(tenantId: string, branchId: string, categoryId: string) {
    try {
      const subcategoriesRef = collection(db, this.getSubcategoriesCollectionPath(tenantId, branchId, categoryId))
      const subcategoriesSnapshot = await getDocs(query(subcategoriesRef, orderBy("order", "asc")))

      return subcategoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      console.error("Error getting subcategories:", error)
      throw error
    }
  }

  async getSubcategory(tenantId: string, branchId: string, categoryId: string, subcategoryId: string) {
    try {
      const subcategoryRef = doc(db, this.getSubcategoriesCollectionPath(tenantId, branchId, categoryId), subcategoryId)
      const subcategorySnapshot = await getDoc(subcategoryRef)

      if (!subcategorySnapshot.exists()) {
        throw new Error("Subcategory not found")
      }

      return {
        id: subcategorySnapshot.id,
        ...subcategorySnapshot.data(),
      }
    } catch (error) {
      console.error("Error getting subcategory:", error)
      throw error
    }
  }

  async createSubcategory(tenantId: string, branchId: string, categoryId: string, subcategoryData: any) {
    try {
      const subcategoriesRef = collection(db, this.getSubcategoriesCollectionPath(tenantId, branchId, categoryId))
      const newSubcategoryRef = await addDoc(subcategoriesRef, {
        ...subcategoryData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      return {
        id: newSubcategoryRef.id,
        ...subcategoryData,
      }
    } catch (error) {
      console.error("Error creating subcategory:", error)
      throw error
    }
  }

  async updateSubcategory(
    tenantId: string,
    branchId: string,
    categoryId: string,
    subcategoryId: string,
    subcategoryData: any,
  ) {
    try {
      const subcategoryRef = doc(db, this.getSubcategoriesCollectionPath(tenantId, branchId, categoryId), subcategoryId)
      await updateDoc(subcategoryRef, {
        ...subcategoryData,
        updatedAt: new Date(),
      })

      return {
        id: subcategoryId,
        ...subcategoryData,
      }
    } catch (error) {
      console.error("Error updating subcategory:", error)
      throw error
    }
  }

  async deleteSubcategory(tenantId: string, branchId: string, categoryId: string, subcategoryId: string) {
    try {
      const subcategoryRef = doc(db, this.getSubcategoriesCollectionPath(tenantId, branchId, categoryId), subcategoryId)
      await deleteDoc(subcategoryRef)
      return true
    } catch (error) {
      console.error("Error deleting subcategory:", error)
      throw error
    }
  }
}

export const categoryService = new CategoryService()
export default categoryService
