import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage } from "@/lib/firebase/client"

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  category?: string
  available: boolean
  imageUrl?: string
  branchId?: string // ID de la sucursal a la que pertenece el producto
  createdAt: string
  updatedAt?: string
}

// Crear un nuevo producto
export async function createProduct(
  tenantId: string,
  productData: Omit<Product, "id" | "createdAt">,
  imageFile?: File,
): Promise<Product> {
  try {
    let imageUrl

    // Subir imagen si existe
    if (imageFile) {
      const storageRef = ref(storage, `tenants/${tenantId}/products/${Date.now()}_${imageFile.name}`)
      const snapshot = await uploadBytes(storageRef, imageFile)
      imageUrl = await getDownloadURL(snapshot.ref)
    }

    // Crear objeto del producto
    const newProduct = {
      ...productData,
      imageUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Guardar en Firestore
    const docRef = await addDoc(collection(db, `tenants/${tenantId}/products`), newProduct)

    return {
      id: docRef.id,
      ...newProduct,
    } as Product
  } catch (error) {
    console.error("Error al crear producto:", error)
    throw error
  }
}

// Obtener todos los productos (con filtro opcional por sucursal)
export async function getProducts(tenantId: string, branchId?: string): Promise<Product[]> {
  try {
    let productsQuery

    if (branchId) {
      // Filtrar por sucursal específica
      productsQuery = query(
        collection(db, `tenants/${tenantId}/products`),
        where("branchId", "==", branchId),
        orderBy("name"),
      )
    } else {
      // Obtener productos sin sucursal asignada (productos globales)
      productsQuery = query(
        collection(db, `tenants/${tenantId}/products`),
        where("branchId", "==", null),
        orderBy("name"),
      )
    }

    const snapshot = await getDocs(productsQuery)

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[]
  } catch (error) {
    console.error("Error al obtener productos:", error)
    throw error
  }
}

// Obtener un producto específico
export async function getProduct(tenantId: string, productId: string): Promise<Product | null> {
  try {
    const docRef = doc(db, `tenants/${tenantId}/products`, productId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Product
  } catch (error) {
    console.error("Error al obtener producto:", error)
    throw error
  }
}

// Actualizar un producto
export async function updateProduct(
  tenantId: string,
  productId: string,
  productData: Partial<Product>,
  imageFile?: File,
): Promise<boolean> {
  try {
    const docRef = doc(db, `tenants/${tenantId}/products`, productId)
    const productSnapshot = await getDoc(docRef)

    if (!productSnapshot.exists()) {
      throw new Error("Producto no encontrado")
    }

    const currentProduct = productSnapshot.data() as Product
    let imageUrl = productData.imageUrl || currentProduct.imageUrl

    // Si hay una nueva imagen, subir y actualizar URL
    if (imageFile) {
      // Si ya existe una imagen, eliminarla primero
      if (currentProduct.imageUrl) {
        try {
          const oldImageRef = ref(storage, currentProduct.imageUrl)
          await deleteObject(oldImageRef)
        } catch (error) {
          console.warn("No se pudo eliminar la imagen anterior:", error)
        }
      }

      // Subir nueva imagen
      const storageRef = ref(storage, `tenants/${tenantId}/products/${Date.now()}_${imageFile.name}`)
      const snapshot = await uploadBytes(storageRef, imageFile)
      imageUrl = await getDownloadURL(snapshot.ref)
    }

    // Actualizar producto
    await updateDoc(docRef, {
      ...productData,
      imageUrl,
      updatedAt: new Date().toISOString(),
    })

    return true
  } catch (error) {
    console.error("Error al actualizar producto:", error)
    throw error
  }
}

// Eliminar un producto
export async function deleteProduct(tenantId: string, productId: string): Promise<boolean> {
  try {
    const docRef = doc(db, `tenants/${tenantId}/products`, productId)
    const productSnapshot = await getDoc(docRef)

    if (productSnapshot.exists()) {
      const productData = productSnapshot.data() as Product

      // Si tiene imagen, eliminarla
      if (productData.imageUrl) {
        try {
          const imageRef = ref(storage, productData.imageUrl)
          await deleteObject(imageRef)
        } catch (error) {
          console.warn("No se pudo eliminar la imagen:", error)
        }
      }
    }

    // Eliminar documento
    await deleteDoc(docRef)
    return true
  } catch (error) {
    console.error("Error al eliminar producto:", error)
    throw error
  }
}
