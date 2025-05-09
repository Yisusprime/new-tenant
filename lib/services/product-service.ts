import { db } from "../firebase/admin"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore"
import type { Product, CreateProductData, UpdateProductData } from "../types/products"

class ProductService {
  private getCollectionPath(tenantId: string, branchId: string) {
    return `tenants/${tenantId}/branches/${branchId}/products`
  }

  async getProducts(
    tenantId: string,
    branchId: string,
    options?: {
      categoryId?: string
      subcategoryId?: string
      featured?: boolean
      available?: boolean
      limit?: number
    },
  ) {
    try {
      const productsRef = collection(db, this.getCollectionPath(tenantId, branchId))

      let q = query(productsRef, orderBy("name", "asc"))

      if (options?.categoryId) {
        q = query(q, where("categoryId", "==", options.categoryId))
      }

      if (options?.subcategoryId) {
        q = query(q, where("subcategoryId", "==", options.subcategoryId))
      }

      if (options?.featured !== undefined) {
        q = query(q, where("featured", "==", options.featured))
      }

      if (options?.available !== undefined) {
        q = query(q, where("available", "==", options.available))
      }

      if (options?.limit) {
        q = query(q, limit(options.limit))
      }

      const productsSnapshot = await getDocs(q)

      return productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Product[]
    } catch (error) {
      console.error("Error getting products:", error)
      throw error
    }
  }

  async getProduct(tenantId: string, branchId: string, productId: string) {
    try {
      const productRef = doc(db, this.getCollectionPath(tenantId, branchId), productId)
      const productSnapshot = await getDoc(productRef)

      if (!productSnapshot.exists()) {
        throw new Error("Product not found")
      }

      const data = productSnapshot.data()

      return {
        id: productSnapshot.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Product
    } catch (error) {
      console.error("Error getting product:", error)
      throw error
    }
  }

  async createProduct(tenantId: string, branchId: string, productData: CreateProductData) {
    try {
      const productsRef = collection(db, this.getCollectionPath(tenantId, branchId))
      const now = new Date()

      const newProductRef = await addDoc(productsRef, {
        ...productData,
        createdAt: now,
        updatedAt: now,
      })

      return {
        id: newProductRef.id,
        ...productData,
        createdAt: now,
        updatedAt: now,
      } as Product
    } catch (error) {
      console.error("Error creating product:", error)
      throw error
    }
  }

  async updateProduct(tenantId: string, branchId: string, productId: string, productData: UpdateProductData) {
    try {
      const productRef = doc(db, this.getCollectionPath(tenantId, branchId), productId)
      const now = new Date()

      await updateDoc(productRef, {
        ...productData,
        updatedAt: now,
      })

      // Get the updated product
      const updatedProduct = await this.getProduct(tenantId, branchId, productId)

      return updatedProduct
    } catch (error) {
      console.error("Error updating product:", error)
      throw error
    }
  }

  async deleteProduct(tenantId: string, branchId: string, productId: string) {
    try {
      const productRef = doc(db, this.getCollectionPath(tenantId, branchId), productId)
      await deleteDoc(productRef)
      return true
    } catch (error) {
      console.error("Error deleting product:", error)
      throw error
    }
  }
}

export const productService = new ProductService()
export default productService
