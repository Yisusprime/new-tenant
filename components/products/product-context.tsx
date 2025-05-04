"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { ref, onValue, push, set, remove, update } from "firebase/database"
import { rtdb } from "@/lib/firebase-config"
import { useToast } from "@/components/ui/use-toast"

export type Extra = {
  id: string
  name: string
  description?: string
  price: number
  imageUrl?: string
  available: boolean
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
  extras: Record<string, Extra>
}

type ProductContextType = {
  products: Product[]
  loading: boolean
  addProduct: (product: Omit<Product, "id" | "extras">) => Promise<void>
  updateProduct: (id: string, product: Partial<Omit<Product, "id" | "extras">>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  addExtra: (productId: string, extra: Omit<Extra, "id">) => Promise<void>
  updateExtra: (productId: string, extraId: string, extra: Partial<Omit<Extra, "id">>) => Promise<void>
  deleteExtra: (productId: string, extraId: string) => Promise<void>
  selectedProduct: Product | null
  setSelectedProduct: (product: Product | null) => void
  selectedExtra: { product: Product; extra: Extra } | null
  setSelectedExtra: (data: { product: Product; extra: Extra } | null) => void
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
  const [selectedExtra, setSelectedExtra] = useState<{
    product: Product
    extra: Extra
  } | null>(null)
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
              extras: data[key].extras || {},
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

  const addProduct = async (product: Omit<Product, "id" | "extras">) => {
    try {
      const newProductRef = push(ref(rtdb, `tenants/${tenantId}/products`))
      await set(newProductRef, {
        ...product,
        extras: {},
      })
      toast({
        title: "Producto añadido",
        description: "El producto se ha añadido correctamente",
      })
    } catch (error) {
      console.error("Error al añadir producto:", error)
      toast({
        title: "Error",
        description: "No se pudo añadir el producto",
        variant: "destructive",
      })
    }
  }

  const updateProduct = async (id: string, product: Partial<Omit<Product, "id" | "extras">>) => {
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

  const addExtra = async (productId: string, extra: Omit<Extra, "id">) => {
    try {
      const newExtraRef = push(ref(rtdb, `tenants/${tenantId}/products/${productId}/extras`))
      await set(newExtraRef, extra)
      toast({
        title: "Extra añadido",
        description: "El extra se ha añadido correctamente",
      })
    } catch (error) {
      console.error("Error al añadir extra:", error)
      toast({
        title: "Error",
        description: "No se pudo añadir el extra",
        variant: "destructive",
      })
    }
  }

  const updateExtra = async (productId: string, extraId: string, extra: Partial<Omit<Extra, "id">>) => {
    try {
      const extraRef = ref(rtdb, `tenants/${tenantId}/products/${productId}/extras/${extraId}`)
      await update(extraRef, extra)
      toast({
        title: "Extra actualizado",
        description: "El extra se ha actualizado correctamente",
      })
    } catch (error) {
      console.error("Error al actualizar extra:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el extra",
        variant: "destructive",
      })
    }
  }

  const deleteExtra = async (productId: string, extraId: string) => {
    try {
      const extraRef = ref(rtdb, `tenants/${tenantId}/products/${productId}/extras/${extraId}`)
      await remove(extraRef)
      toast({
        title: "Extra eliminado",
        description: "El extra se ha eliminado correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar extra:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el extra",
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
        addExtra,
        updateExtra,
        deleteExtra,
        selectedProduct,
        setSelectedProduct,
        selectedExtra,
        setSelectedExtra,
        tenantId,
      }}
    >
      {children}
    </ProductContext.Provider>
  )
}
