"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore"
import { db } from "@/lib/firebase-config"
import { useAuth } from "@/lib/auth-context"
import type { Ingredient } from "@/lib/types/inventory"
import { useToast } from "@/components/ui/use-toast"

interface IngredientContextType {
  ingredients: Ingredient[]
  loading: boolean
  error: string | null
  addIngredient: (ingredient: Omit<Ingredient, "id" | "createdAt" | "updatedAt">) => Promise<string>
  updateIngredient: (id: string, ingredient: Partial<Ingredient>) => Promise<void>
  deleteIngredient: (id: string) => Promise<void>
  getIngredientById: (id: string) => Ingredient | undefined
  getLowStockIngredients: () => Ingredient[]
}

const IngredientContext = createContext<IngredientContextType | undefined>(undefined)

export function IngredientProvider({ children, tenantId }: { children: ReactNode; tenantId: string }) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!tenantId) return

    setLoading(true)
    const ingredientsRef = collection(db, `tenants/${tenantId}/ingredients`)
    const q = query(ingredientsRef, orderBy("name"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ingredientsList: Ingredient[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          ingredientsList.push({
            id: doc.id,
            name: data.name,
            description: data.description,
            category: data.category,
            unit: data.unit,
            stock: data.stock,
            minStock: data.minStock,
            cost: data.cost,
            imageUrl: data.imageUrl,
            barcode: data.barcode,
            location: data.location,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            isActive: data.isActive,
          })
        })
        setIngredients(ingredientsList)
        setLoading(false)
      },
      (err) => {
        console.error("Error al obtener ingredientes:", err)
        setError("Error al cargar los ingredientes. Por favor, intenta de nuevo.")
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [tenantId])

  const addIngredient = async (ingredient: Omit<Ingredient, "id" | "createdAt" | "updatedAt">) => {
    try {
      const ingredientsRef = collection(db, `tenants/${tenantId}/ingredients`)
      const newIngredient = {
        ...ingredient,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
      const docRef = await addDoc(ingredientsRef, newIngredient)
      toast({
        title: "Ingrediente añadido",
        description: `El ingrediente ${ingredient.name} ha sido añadido correctamente.`,
      })
      return docRef.id
    } catch (err: any) {
      console.error("Error al añadir ingrediente:", err)
      setError(err.message)
      toast({
        title: "Error",
        description: "No se pudo añadir el ingrediente. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
      throw err
    }
  }

  const updateIngredient = async (id: string, ingredient: Partial<Ingredient>) => {
    try {
      const ingredientRef = doc(db, `tenants/${tenantId}/ingredients/${id}`)
      await updateDoc(ingredientRef, {
        ...ingredient,
        updatedAt: serverTimestamp(),
      })
      toast({
        title: "Ingrediente actualizado",
        description: "El ingrediente ha sido actualizado correctamente.",
      })
    } catch (err: any) {
      console.error("Error al actualizar ingrediente:", err)
      setError(err.message)
      toast({
        title: "Error",
        description: "No se pudo actualizar el ingrediente. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
      throw err
    }
  }

  const deleteIngredient = async (id: string) => {
    try {
      const ingredientRef = doc(db, `tenants/${tenantId}/ingredients/${id}`)
      await deleteDoc(ingredientRef)
      toast({
        title: "Ingrediente eliminado",
        description: "El ingrediente ha sido eliminado correctamente.",
      })
    } catch (err: any) {
      console.error("Error al eliminar ingrediente:", err)
      setError(err.message)
      toast({
        title: "Error",
        description: "No se pudo eliminar el ingrediente. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
      throw err
    }
  }

  const getIngredientById = (id: string) => {
    return ingredients.find((ingredient) => ingredient.id === id)
  }

  const getLowStockIngredients = () => {
    return ingredients.filter((ingredient) => ingredient.stock <= ingredient.minStock)
  }

  return (
    <IngredientContext.Provider
      value={{
        ingredients,
        loading,
        error,
        addIngredient,
        updateIngredient,
        deleteIngredient,
        getIngredientById,
        getLowStockIngredients,
      }}
    >
      {children}
    </IngredientContext.Provider>
  )
}

export function useIngredients() {
  const context = useContext(IngredientContext)
  if (context === undefined) {
    throw new Error("useIngredients debe ser usado dentro de un IngredientProvider")
  }
  return context
}
