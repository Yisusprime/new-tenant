"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { ref, onValue, push, set, remove, update } from "firebase/database"
import { db } from "@/lib/firebase-config"
import { useToast } from "@/components/ui/use-toast"

export type Subcategory = {
  id: string
  name: string
  description?: string
  imageUrl?: string
}

export type Category = {
  id: string
  name: string
  description?: string
  imageUrl?: string
  subcategories: Record<string, Subcategory>
}

type CategoryContextType = {
  categories: Category[]
  loading: boolean
  addCategory: (category: Omit<Category, "id" | "subcategories">) => Promise<void>
  updateCategory: (id: string, category: Partial<Omit<Category, "id" | "subcategories">>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  addSubcategory: (categoryId: string, subcategory: Omit<Subcategory, "id">) => Promise<void>
  updateSubcategory: (
    categoryId: string,
    subcategoryId: string,
    subcategory: Partial<Omit<Subcategory, "id">>,
  ) => Promise<void>
  deleteSubcategory: (categoryId: string, subcategoryId: string) => Promise<void>
  selectedCategory: Category | null
  setSelectedCategory: (category: Category | null) => void
  selectedSubcategory: { category: Category; subcategory: Subcategory } | null
  setSelectedSubcategory: (data: { category: Category; subcategory: Subcategory } | null) => void
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined)

export const useCategories = () => {
  const context = useContext(CategoryContext)
  if (!context) {
    throw new Error("useCategories must be used within a CategoryProvider")
  }
  return context
}

export const CategoryProvider: React.FC<{ children: React.ReactNode; tenantId: string }> = ({ children, tenantId }) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<{
    category: Category
    subcategory: Subcategory
  } | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!tenantId) return

    const categoriesRef = ref(db, `tenants/${tenantId}/categories`)

    const unsubscribe = onValue(
      categoriesRef,
      (snapshot) => {
        const data = snapshot.val()
        const categoriesArray: Category[] = []

        if (data) {
          Object.keys(data).forEach((key) => {
            const category = {
              id: key,
              name: data[key].name,
              description: data[key].description || "",
              imageUrl: data[key].imageUrl || "",
              subcategories: data[key].subcategories || {},
            }
            categoriesArray.push(category)
          })
        }

        setCategories(categoriesArray)
        setLoading(false)
      },
      (error) => {
        console.error("Error al cargar categorías:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las categorías",
          variant: "destructive",
        })
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [tenantId, toast])

  const addCategory = async (category: Omit<Category, "id" | "subcategories">) => {
    try {
      const newCategoryRef = push(ref(db, `tenants/${tenantId}/categories`))
      await set(newCategoryRef, {
        ...category,
        subcategories: {},
      })
      toast({
        title: "Categoría añadida",
        description: "La categoría se ha añadido correctamente",
      })
    } catch (error) {
      console.error("Error al añadir categoría:", error)
      toast({
        title: "Error",
        description: "No se pudo añadir la categoría",
        variant: "destructive",
      })
    }
  }

  const updateCategory = async (id: string, category: Partial<Omit<Category, "id" | "subcategories">>) => {
    try {
      const categoryRef = ref(db, `tenants/${tenantId}/categories/${id}`)
      await update(categoryRef, category)
      toast({
        title: "Categoría actualizada",
        description: "La categoría se ha actualizado correctamente",
      })
    } catch (error) {
      console.error("Error al actualizar categoría:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la categoría",
        variant: "destructive",
      })
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      const categoryRef = ref(db, `tenants/${tenantId}/categories/${id}`)
      await remove(categoryRef)
      toast({
        title: "Categoría eliminada",
        description: "La categoría se ha eliminado correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar categoría:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la categoría",
        variant: "destructive",
      })
    }
  }

  const addSubcategory = async (categoryId: string, subcategory: Omit<Subcategory, "id">) => {
    try {
      const newSubcategoryRef = push(ref(db, `tenants/${tenantId}/categories/${categoryId}/subcategories`))
      await set(newSubcategoryRef, subcategory)
      toast({
        title: "Subcategoría añadida",
        description: "La subcategoría se ha añadido correctamente",
      })
    } catch (error) {
      console.error("Error al añadir subcategoría:", error)
      toast({
        title: "Error",
        description: "No se pudo añadir la subcategoría",
        variant: "destructive",
      })
    }
  }

  const updateSubcategory = async (
    categoryId: string,
    subcategoryId: string,
    subcategory: Partial<Omit<Subcategory, "id">>,
  ) => {
    try {
      const subcategoryRef = ref(db, `tenants/${tenantId}/categories/${categoryId}/subcategories/${subcategoryId}`)
      await update(subcategoryRef, subcategory)
      toast({
        title: "Subcategoría actualizada",
        description: "La subcategoría se ha actualizado correctamente",
      })
    } catch (error) {
      console.error("Error al actualizar subcategoría:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la subcategoría",
        variant: "destructive",
      })
    }
  }

  const deleteSubcategory = async (categoryId: string, subcategoryId: string) => {
    try {
      const subcategoryRef = ref(db, `tenants/${tenantId}/categories/${categoryId}/subcategories/${subcategoryId}`)
      await remove(subcategoryRef)
      toast({
        title: "Subcategoría eliminada",
        description: "La subcategoría se ha eliminado correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar subcategoría:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la subcategoría",
        variant: "destructive",
      })
    }
  }

  return (
    <CategoryContext.Provider
      value={{
        categories,
        loading,
        addCategory,
        updateCategory,
        deleteCategory,
        addSubcategory,
        updateSubcategory,
        deleteSubcategory,
        selectedCategory,
        setSelectedCategory,
        selectedSubcategory,
        setSelectedSubcategory,
      }}
    >
      {children}
    </CategoryContext.Provider>
  )
}
