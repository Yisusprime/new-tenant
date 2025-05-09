"use client"

import { useState, useEffect, useRef } from "react"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { MenuProductList } from "./menu-product-list"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MenuCategoriesProps {
  tenantId: string
  branchId: string | null
}

export function MenuCategories({ tenantId, branchId }: MenuCategoriesProps) {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const tabsListRef = useRef<HTMLDivElement>(null)
  const [showLeftScroll, setShowLeftScroll] = useState(false)
  const [showRightScroll, setShowRightScroll] = useState(false)

  useEffect(() => {
    async function loadCategories() {
      if (!branchId) return

      try {
        setLoading(true)

        const categoriesRef = collection(db, `tenants/${tenantId}/branches/${branchId}/categories`)
        const categoriesSnapshot = await getDocs(
          query(categoriesRef, where("isActive", "==", true), orderBy("order", "asc")),
        )

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

  // Check if scroll buttons should be visible
  useEffect(() => {
    const checkScroll = () => {
      if (tabsListRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = tabsListRef.current
        setShowLeftScroll(scrollLeft > 0)
        setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10)
      }
    }

    const tabsList = tabsListRef.current
    if (tabsList) {
      checkScroll()
      tabsList.addEventListener("scroll", checkScroll)
      window.addEventListener("resize", checkScroll)
    }

    return () => {
      if (tabsList) {
        tabsList.removeEventListener("scroll", checkScroll)
        window.removeEventListener("resize", checkScroll)
      }
    }
  }, [categories])

  const scrollTabs = (direction: "left" | "right") => {
    if (tabsListRef.current) {
      const scrollAmount = 200
      const currentScroll = tabsListRef.current.scrollLeft
      tabsListRef.current.scrollTo({
        left: direction === "left" ? currentScroll - scrollAmount : currentScroll + scrollAmount,
        behavior: "smooth",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-12 flex items-center space-x-4 overflow-x-auto">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-full" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  // Si no hay categorías, mostrar mensaje
  if (categories.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <p className="text-gray-500">No hay categorías disponibles</p>
      </div>
    )
  }

  return (
    <Tabs value={activeCategory || undefined} onValueChange={setActiveCategory} className="w-full">
      <div className="relative">
        {showLeftScroll && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm shadow-sm"
            onClick={() => scrollTabs("left")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        <div className="border-b sticky top-16 md:top-[4.5rem] bg-white z-10 pb-2 overflow-hidden">
          <TabsList
            ref={tabsListRef}
            className="w-full h-auto flex overflow-x-auto py-2 px-6 justify-start scrollbar-hide"
          >
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="px-4 py-2 whitespace-nowrap rounded-full">
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {showRightScroll && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm shadow-sm"
            onClick={() => scrollTabs("right")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {categories.map((category) => (
        <TabsContent key={category.id} value={category.id} className="mt-6">
          <h2 className="text-xl font-bold mb-4">{category.name}</h2>
          {category.description && <p className="text-gray-600 mb-6">{category.description}</p>}

          <MenuProductList tenantId={tenantId} branchId={branchId} categoryId={category.id} />
        </TabsContent>
      ))}
    </Tabs>
  )
}
