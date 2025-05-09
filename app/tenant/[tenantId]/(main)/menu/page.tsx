"use client"

import { useState, useEffect } from "react"
import { CategoryCards } from "./components/category-cards"
import { MenuCategories } from "./components/menu-categories"
import { FeaturedProducts } from "./components/featured-products"
import { RestaurantHeader } from "./components/restaurant-header"
import { Cart } from "./components/cart"
import { CartProvider } from "./context/cart-context"
import { useSearchParams } from "next/navigation"

export default function MenuPage({ params }: { params: { tenantId: string } }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [branchId, setBranchId] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    // Obtener branchId de localStorage o de query params
    const branchIdFromQuery = searchParams.get("branchId")
    const branchIdFromStorage = localStorage.getItem("currentBranchId")

    if (branchIdFromQuery) {
      setBranchId(branchIdFromQuery)
      localStorage.setItem("currentBranchId", branchIdFromQuery)
    } else if (branchIdFromStorage) {
      setBranchId(branchIdFromStorage)
    }
  }, [searchParams])

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setShowMobileMenu(scrollPosition > 200)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId)
  }

  return (
    <CartProvider>
      <div className="pb-20">
        <RestaurantHeader tenantId={params.tenantId} branchId={branchId} />

        <div className="container mx-auto px-4">
          <CategoryCards tenantId={params.tenantId} branchId={branchId} onCategorySelect={handleCategoryChange} />

          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">Artículos destacados</h2>
            <FeaturedProducts tenantId={params.tenantId} branchId={branchId} />
          </div>

          <div className="mt-8">
            <MenuCategories
              tenantId={params.tenantId}
              branchId={branchId}
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
              showMobileMenu={showMobileMenu}
            />
          </div>
        </div>

        <Cart />
      </div>
    </CartProvider>
  )
}
