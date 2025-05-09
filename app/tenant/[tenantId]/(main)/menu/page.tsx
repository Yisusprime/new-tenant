"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, collection, query, where, getDocs, limit } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import { getRestaurantConfig } from "@/lib/services/restaurant-config-service"
import { RestaurantHeader } from "./components/restaurant-header"
import { MenuCategories } from "./components/menu-categories"
import { RestaurantInfoModal } from "./components/restaurant-info-modal"
import { Loader2 } from "lucide-react"
import { MobileNavigation } from "./components/mobile-navigation"
import { FeaturedProducts } from "./components/featured-products"
import { CategoryCards } from "./components/category-cards"
import { Cart } from "./components/cart"
import { CartProvider } from "./context/cart-context"
import { DesktopCategoryMenu } from "./components/desktop-category-menu"

export default function MenuPage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  const [restaurantData, setRestaurantData] = useState<any>(null)
  const [restaurantConfig, setRestaurantConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [infoModalOpen, setInfoModalOpen] = useState(false)
  const [currentBranchId, setCurrentBranchId] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>("cat1") // Categoría predeterminada

  useEffect(() => {
    async function loadRestaurantData() {
      try {
        setLoading(true)

        // Obtener datos del tenant
        const tenantDoc = await getDoc(doc(db, "tenants", tenantId))
        if (tenantDoc.exists()) {
          setRestaurantData(tenantDoc.data())
        }

        // Obtener la primera sucursal activa
        const branchesRef = collection(db, `tenants/${tenantId}/branches`)
        const branchesSnapshot = await getDocs(query(branchesRef, where("isActive", "==", true), limit(1)))

        if (!branchesSnapshot.empty) {
          const branchId = branchesSnapshot.docs[0].id
          setCurrentBranchId(branchId)

          // Obtener configuración del restaurante para esta sucursal
          const config = await getRestaurantConfig(tenantId, branchId)
          if (config) {
            setRestaurantConfig(config)
          }
        }
      } catch (error) {
        console.error("Error al cargar datos del restaurante:", error)
      } finally {
        setLoading(false)
      }
    }

    loadRestaurantData()
  }, [tenantId])

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId)
    // Desplazarse a la sección de productos
    const productsSection = document.getElementById("products-section")
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500">Cargando menú...</p>
        </div>
      </div>
    )
  }

  if (!restaurantData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-500">Restaurante no encontrado</p>
      </div>
    )
  }

  return (
    <CartProvider>
      <div className="bg-gray-50 min-h-screen pb-20 flex justify-center">
        <div className="w-full max-w-5xl">
          <RestaurantHeader
            restaurantData={restaurantData}
            restaurantConfig={restaurantConfig}
            onInfoClick={() => setInfoModalOpen(true)}
          />

          {/* Menú de categorías para PC */}
          <DesktopCategoryMenu activeCategory={activeCategory} onCategoryChange={handleCategorySelect} />

          {/* Productos destacados */}
          <div className="bg-white px-4 py-6 mb-2">
            <h2 className="text-xl font-bold mb-4">Artículos destacados</h2>
            <FeaturedProducts tenantId={tenantId} branchId={currentBranchId} />
          </div>

          {/* Tarjetas de categorías solo para móvil */}
          <div className="md:hidden bg-white px-4 py-4 mb-2">
            <CategoryCards onSelectCategory={handleCategorySelect} />
          </div>

          {/* Categorías y productos */}
          <div id="products-section" className="mt-2 bg-white">
            <MenuCategories
              tenantId={tenantId}
              branchId={currentBranchId}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>

          <RestaurantInfoModal
            open={infoModalOpen}
            onClose={() => setInfoModalOpen(false)}
            restaurantData={restaurantData}
            restaurantConfig={restaurantConfig}
          />

          {/* Navegación móvil */}
          <div className="md:hidden">
            <MobileNavigation />
          </div>

          {/* Carrito */}
          <Cart />
        </div>
      </div>
    </CartProvider>
  )
}
