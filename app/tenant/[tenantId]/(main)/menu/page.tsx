"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, collection, query, where, getDocs, limit } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import { getRestaurantConfig } from "@/lib/services/restaurant-config-service"
import { RestaurantHeader } from "./components/restaurant-header"
import { MenuCategories } from "./components/menu-categories"
import { RestaurantInfoModal } from "./components/restaurant-info-modal"
import { Skeleton } from "@/components/ui/skeleton"

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
      <div className="space-y-6 pt-4">
        <Skeleton className="h-56 w-full rounded-lg" />
        <div className="flex gap-4">
          <Skeleton className="h-24 w-24 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-20 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-8 w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!restaurantData) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-center p-8 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-2">Restaurante no encontrado</h2>
          <p className="text-gray-500">No pudimos encontrar la información de este restaurante</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <RestaurantHeader
        restaurantData={restaurantData}
        restaurantConfig={restaurantConfig}
        onInfoClick={() => setInfoModalOpen(true)}
      />

      <MenuCategories tenantId={tenantId} branchId={currentBranchId} />

      <RestaurantInfoModal
        open={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        restaurantData={restaurantData}
        restaurantConfig={restaurantConfig}
      />
    </>
  )
}
