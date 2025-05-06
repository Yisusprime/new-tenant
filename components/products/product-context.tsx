"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { ref, onValue, push, set, remove, update } from "firebase/database"
import { rtdb } from "@/lib/firebase-config"
import { useToast } from "@/components/ui/use-toast"

export type ProductExtra = {
  extraId: string
  included: boolean // Si está incluido por defecto
  required: boolean // Si es obligatorio
  price?: number // Precio específico para este producto (anula el precio del extra)
}

export type Product = {
  id: string
  name: string
  description?: string
  price: number
  imageUrl?: string
  categoryId?: string
  available: boolean
  featured: boolean
  productExtras: Record<string, ProductExtra> // Asociaciones con extras
}

export type Extra = {
  id: string
  name: string
  description?: string
  price: number
  imageUrl?: string
  available: boolean
}

type ProductContextType = {
  products: Product[]
  loading: boolean
  addProduct: (product: Omit<Product, "id" | "productExtras">) => Promise<string | null> // Devuelve el ID del producto creado
  updateProduct: (id: string, product: Partial<Omit<Product, "id" | "productExtras">>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  addProductExtra: (productId: string, productExtra: ProductExtra) => Promise<void>
  updateProductExtra: (productId: string, extraId: string, productExtra: Partial<ProductExtra>) => Promise<void>
  removeProductExtra: (productId: string, extraId: string) => Promise<void>
  selectedProduct: Product | null
  setSelectedProduct: (product: Product | null) => void
  tenantId: string
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export const useProducts = () => {
  const context = useContext(ProductContext)
  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider")
  }
  return context
}

export const ProductProvider: React.FC<{ children: React.ReactNode; tenantId: string }> = ({ children, tenantId }) => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!tenantId) return

    const productsRef = ref(rtdb, `tenants/${tenantId}/products`)

    const unsubscribe = onValue(
      productsRef,
      (snapshot) => {
        const data = snapshot.val()
        const productsArray: Product[] = []

        if (data) {
          Object.keys(data).forEach((key) => {
            const product = {
              id: key,
              name: data[key].name,
              description: data[key].description || "",
              price: data[key].price || 0,
              imageUrl: data[key].imageUrl || "",
              categoryId: data[key].categoryId || "",
              available: data[key].available !== false, // Por defecto true
              featured: data[key].featured || false,
              productExtras: data[key].productExtras || {},
            }
            productsArray.push(product)
          })
        }

        setProducts(productsArray)
        setLoading(false)
      },
      (error) => {
        console.error("Error al cargar productos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los productos",
          variant: "destructive",
        })
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [tenantId, toast])

  const addProduct = async (product: Omit<Product, "id" | "productExtras">): Promise<string | null> => {
    try {
      const newProductRef = push(ref(rtdb, `tenants/${tenantId}/products`))
      await set(newProductRef, {
        ...product,
        productExtras: {},
      })
      toast({
        title: "Producto añadido",
        description: "El producto se ha añadido correctamente",
      })
      return newProductRef.key
    } catch (error) {
      console.error("Error al añadir producto:", error)
      toast({
        title: "Error",
        description: "No se pudo añadir el producto",
        variant: "destructive",
      })
      return null
    }
  }

  const updateProduct = async (id: string, product: Partial<Omit<Product, "id" | "productExtras">>) => {
    try {
      const productRef = ref(rtdb, `tenants/${tenantId}/products/${id}`)
      await update(productRef, product)
      toast({
        title: "Producto actualizado",
        description: "El producto se ha actualizado correctamente",
      })
    } catch (error) {
      console.error("Error al actualizar producto:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el producto",
        variant: "destructive",
      })
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      const productRef = ref(rtdb, `tenants/${tenantId}/products/${id}`)
      await remove(productRef)
      toast({
        title: "Producto eliminado",
        description: "El producto se ha eliminado correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar producto:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      })
    }
  }

  const addProductExtra = async (productId: string, productExtra: ProductExtra) => {
    try {
      const { extraId } = productExtra
      const productExtraRef = ref(rtdb, `tenants/${tenantId}/products/${productId}/productExtras/${extraId}`)
      await set(productExtraRef, productExtra)
      toast({
        title: "Extra añadido al producto",
        description: "El extra se ha asociado correctamente al producto",
      })
    } catch (error) {
      console.error("Error al añadir extra al producto:", error)
      toast({
        title: "Error",
        description: "No se pudo añadir el extra al producto",
        variant: "destructive",
      })
    }
  }

  const updateProductExtra = async (productId: string, extraId: string, productExtra: Partial<ProductExtra>) => {
    try {
      const productExtraRef = ref(rtdb, `tenants/${tenantId}/products/${productId}/productExtras/${extraId}`)
      await update(productExtraRef, productExtra)
      toast({
        title: "Extra actualizado",
        description: "El extra del producto se ha actualizado correctamente",
      })
    } catch (error) {
      console.error("Error al actualizar extra del producto:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el extra del producto",
        variant: "destructive",
      })
    }
  }

  const removeProductExtra = async (productId: string, extraId: string) => {
    try {
      const productExtraRef = ref(rtdb, `tenants/${tenantId}/products/${productId}/productExtras/${extraId}`)
      await remove(productExtraRef)
      toast({
        title: "Extra eliminado",
        description: "El extra se ha eliminado del producto correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar extra del producto:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el extra del producto",
        variant: "destructive",
      })
    }
  }

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        addProduct,
        updateProduct,
        deleteProduct,
        addProductExtra,
        updateProductExtra,
        removeProductExtra,
        selectedProduct,
        setSelectedProduct,
        tenantId,
      }}
    >
      {children}
    </ProductContext.Provider>
  )
}
