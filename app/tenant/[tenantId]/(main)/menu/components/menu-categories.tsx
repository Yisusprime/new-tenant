"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { MenuProductList } from "./menu-product-list"
import { Loader2, Coffee, Pizza, Salad, IceCream, Beef, Sandwich, Utensils } from "lucide-react"
import { motion } from "framer-motion"

interface MenuCategoriesProps {
  tenantId: string
  branchId: string | null
}

export function MenuCategories({ tenantId, branchId }: MenuCategoriesProps) {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // Función para obtener un icono según el nombre de la categoría
  const getCategoryIcon = (name: string) => {
    const normalizedName = name.toLowerCase()
    if (normalizedName.includes("bebida") || normalizedName.includes("café")) return Coffee
    if (normalizedName.includes("pizza")) return Pizza
    if (normalizedName.includes("ensalada")) return Salad
    if (normalizedName.includes("postre") || normalizedName.includes("dulce")) return IceCream
    if (normalizedName.includes("carne")) return Beef
    if (normalizedName.includes("sandwich") || normalizedName.includes("hamburguesa")) return Sandwich
    return Utensils
  }

  useEffect(() => {
    async function loadCategories() {
      if (!branchId) return

      try {
        setLoading(true)

        const categoriesRef = collection(db, `tenants/${tenantId}/branches/${branchId}/categories`)
        const categoriesSnapshot = await getDocs(query(categoriesRef, where("isActive", "==", true)))

        const categoriesData = categoriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setCategories(categoriesData)

        // Establecer la primera categoría como activa
        if (categoriesData.length > 0 && !activeCategory) {
          setActiveCategory(categoriesData[0].id)
        }
      } catch (error) {
        console.error("Error al cargar categorías:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [tenantId, branchId, activeCategory])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Si no hay categorías, mostrar mensaje
  if (categories.length === 0) {
    return (
      <div className="py-12">
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No hay categorías disponibles</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-4">
      <Tabs value={activeCategory || undefined} onValueChange={setActiveCategory} className="w-full">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Nuestro Menú</h2>
          <TabsList className="w-full h-auto flex overflow-x-auto py-2 justify-start bg-gray-100 rounded-xl p-1">
            {categories.map((category) => {
              const Icon = getCategoryIcon(category.name)
              return (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Icon className="h-4 w-4" />
                  <span>{category.name}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-6 focus:outline-none">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <div className="flex items-center gap-2 mb-4">
                {getCategoryIcon(category.name)({ className: "h-5 w-5 text-primary" })}
                <h2 className="text-xl font-bold">{category.name}</h2>
              </div>
              {category.description && <p className="text-gray-600 mb-6">{category.description}</p>}

              <MenuProductList tenantId={tenantId} branchId={branchId} categoryId={category.id} />
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
