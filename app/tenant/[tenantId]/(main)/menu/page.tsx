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
    <div className="bg-gray-50 min-h-screen pb-20 md:pb-10">
      <RestaurantHeader
        restaurantData={restaurantData}
        restaurantConfig={restaurantConfig}
        onInfoClick={() => setInfoModalOpen(true)}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-10 relative z-10">
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <MenuCategories tenantId={tenantId} branchId={currentBranchId} />
        </div>
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
    </div>
  )
}
