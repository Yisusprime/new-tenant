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
import type { Recipe } from "@/lib/types/inventory"
import { useToast } from "@/components/ui/use-toast"

interface RecipeContextType {
  recipes: Recipe[]
  loading: boolean
  error: string | null
  addRecipe: (recipe: Omit<Recipe, "id" | "createdAt" | "updatedAt">) => Promise<string>
  updateRecipe: (id: string, recipe: Partial<Recipe>) => Promise<void>
  deleteRecipe: (id: string) => Promise<void>
  getRecipeById: (id: string) => Recipe | undefined
  getRecipeByProductId: (productId: string) => Recipe | undefined
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined)

export function RecipeProvider({ children, tenantId }: { children: ReactNode; tenantId: string }) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!tenantId) return

    setLoading(true)
    const recipesRef = collection(db, `tenants/${tenantId}/recipes`)
    const q = query(recipesRef, orderBy("productName"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const recipesList: Recipe[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          recipesList.push({
            id: doc.id,
            productId: data.productId,
            productName: data.productName,
            ingredients: data.ingredients || [],
            preparationTime: data.preparationTime,
            instructions: data.instructions,
            yield: data.yield,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
          })
        })
        setRecipes(recipesList)
        setLoading(false)
      },
      (err) => {
        console.error("Error al obtener recetas:", err)
        setError("Error al cargar las recetas. Por favor, intenta de nuevo.")
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [tenantId])

  const addRecipe = async (recipe: Omit<Recipe, "id" | "createdAt" | "updatedAt">) => {
    try {
      const recipesRef = collection(db, `tenants/${tenantId}/recipes`)
      const newRecipe = {
        ...recipe,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
      const docRef = await addDoc(recipesRef, newRecipe)
      toast({
        title: "Receta añadida",
        description: `La receta para ${recipe.productName} ha sido añadida correctamente.`,
      })
      return docRef.id
    } catch (err: any) {
      console.error("Error al añadir receta:", err)
      setError(err.message)
      toast({
        title: "Error",
        description: "No se pudo añadir la receta. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
      throw err
    }
  }

  const updateRecipe = async (id: string, recipe: Partial<Recipe>) => {
    try {
      const recipeRef = doc(db, `tenants/${tenantId}/recipes/${id}`)
      await updateDoc(recipeRef, {
        ...recipe,
        updatedAt: serverTimestamp(),
      })
      toast({
        title: "Receta actualizada",
        description: "La receta ha sido actualizada correctamente.",
      })
    } catch (err: any) {
      console.error("Error al actualizar receta:", err)
      setError(err.message)
      toast({
        title: "Error",
        description: "No se pudo actualizar la receta. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
      throw err
    }
  }

  const deleteRecipe = async (id: string) => {
    try {
      const recipeRef = doc(db, `tenants/${tenantId}/recipes/${id}`)
      await deleteDoc(recipeRef)
      toast({
        title: "Receta eliminada",
        description: "La receta ha sido eliminada correctamente.",
      })
    } catch (err: any) {
      console.error("Error al eliminar receta:", err)
      setError(err.message)
      toast({
        title: "Error",
        description: "No se pudo eliminar la receta. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
      throw err
    }
  }

  const getRecipeById = (id: string) => {
    return recipes.find((recipe) => recipe.id === id)
  }

  const getRecipeByProductId = (productId: string) => {
    return recipes.find((recipe) => recipe.productId === productId)
  }

  return (
    <RecipeContext.Provider
      value={{
        recipes,
        loading,
        error,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        getRecipeById,
        getRecipeByProductId,
      }}
    >
      {children}
    </RecipeContext.Provider>
  )
}

export function useRecipes() {
  const context = useContext(RecipeContext)
  if (context === undefined) {
    throw new Error("useRecipes debe ser usado dentro de un RecipeProvider")
  }
  return context
}
