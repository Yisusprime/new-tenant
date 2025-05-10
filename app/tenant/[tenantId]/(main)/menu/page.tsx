"use client"

import { useState, useEffect, useRef } from "react"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { getRestaurantConfig } from "@/lib/services/restaurant-config-service"
import { RestaurantHeader } from "./components/restaurant-header"
import { MenuCategories } from "./components/menu-categories"
import { RestaurantInfoModal } from "./components/restaurant-info-modal"
import { Loader2, User, Package, Search } from "lucide-react"
import { MobileNavigation } from "./components/mobile-navigation"
import { FeaturedProducts } from "./components/featured-products"
import { Cart } from "./components/cart"
import { CartProvider } from "./context/cart-context"
import { useRouter } from "next/navigation"

export default function MenuPage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  const router = useRouter()
  const [restaurantData, setRestaurantData] = useState<any>(null)
  const [restaurantConfig, setRestaurantConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [infoModalOpen, setInfoModalOpen] = useState(false)
  const [currentBranchId, setCurrentBranchId] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [branches, setBranches] = useState<any[]>([])
  const [showBranchSelector, setShowBranchSelector] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userLoading, setUserLoading] = useState(true)
  const headerRef = useRef<HTMLDivElement>(null)
  const auth = getAuth()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setUserLoading(false)
    })

    return () => unsubscribe()
  }, [auth])

  useEffect(() => {
    async function loadRestaurantData() {
      try {
        setLoading(true)

        // Obtener datos del tenant
        const tenantDoc = await getDoc(doc(db, "tenants", tenantId))
        if (tenantDoc.exists()) {
          setRestaurantData(tenantDoc.data())
        }

        // Obtener todas las sucursales activas
        const branchesRef = collection(db, `tenants/${tenantId}/branches`)
        const branchesSnapshot = await getDocs(query(branchesRef, where("isActive", "==", true)))

        const branchesData = branchesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setBranches(branchesData)

        // Verificar si hay sucursales
        if (branchesData.length === 0) {
          setLoading(false)
          return
        }

        // Si solo hay una sucursal, seleccionarla automáticamente
        if (branchesData.length === 1) {
          const branchId = branchesData[0].id
          setCurrentBranchId(branchId)
          localStorage.setItem(`${tenantId}_currentBranch`, branchId)

          // Obtener configuración del restaurante para esta sucursal
          const config = await getRestaurantConfig(tenantId, branchId)
          if (config) {
            setRestaurantConfig(config)
          }
        } else {
          // Si hay más de una sucursal, verificar si hay una guardada en localStorage
          const savedBranchId = localStorage.getItem(`${tenantId}_currentBranch`)

          // Verificar que la sucursal guardada exista y esté activa
          const savedBranchExists = savedBranchId && branchesData.some((b) => b.id === savedBranchId)

          if (savedBranchExists) {
            setCurrentBranchId(savedBranchId)

            // Obtener configuración del restaurante para esta sucursal
            const config = await getRestaurantConfig(tenantId, savedBranchId!)
            if (config) {
              setRestaurantConfig(config)
            }
          } else {
            // Si no hay una sucursal guardada o no es válida, mostrar el selector
            setShowBranchSelector(true)
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

  const handleBranchSelect = async (branchId: string) => {
    setCurrentBranchId(branchId)
    localStorage.setItem(`${tenantId}_currentBranch`, branchId)
    setShowBranchSelector(false)

    // Cargar configuración del restaurante para la sucursal seleccionada
    try {
      const config = await getRestaurantConfig(tenantId, branchId)
      if (config) {
        setRestaurantConfig(config)
      }
    } catch (error) {
      console.error("Error al cargar configuración del restaurante:", error)
    }
  }

  useEffect(() => {
    // Función para manejar el scroll y mostrar/ocultar el menú móvil
    const handleScroll = () => {
      // Mostrar el menú después de un pequeño scroll (50px)
      if (window.scrollY > 50) {
        setShowMobileMenu(true)
      } else {
        setShowMobileMenu(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId)
  }

  // Función para construir rutas correctamente
  const buildRoute = (path: string) => {
    // Si estamos en un subdominio, no necesitamos incluir /tenant/[tenantId]
    const isSubdomain =
      typeof window !== "undefined" &&
      window.location.hostname.includes(".") &&
      !window.location.hostname.startsWith("www.") &&
      !window.location.hostname.startsWith("localhost")

    return isSubdomain ? path : `/tenant/${tenantId}${path}`
  }

  const handleProfileClick = () => {
    if (user) {
      router.push(buildRoute("/menu/profile"))
    } else {
      router.push(buildRoute("/menu/login"))
    }
  }

  const handleOrdersClick = () => {
    if (user) {
      router.push(buildRoute("/menu/orders"))
    } else {
      router.push(buildRoute("/menu/login?redirect=orders"))
    }
  }

  const handleSearchClick = () => {
    router.push(buildRoute("/menu/search"))
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

  if (branches.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-500">No hay sucursales disponibles</p>
      </div>
    )
  }

  if (showBranchSelector || !currentBranchId) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl font-bold mb-4 text-center">Selecciona una sucursal</h2>
          <div className="space-y-3">
            {branches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => handleBranchSelect(branch.id)}
                className="w-full p-4 border rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium">{branch.name}</p>
                  <p className="text-sm text-gray-500">{branch.address}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <CartProvider>
      <div className="bg-gray-50 min-h-screen pb-20 flex justify-center">
        <div className="w-full max-w-5xl">
          <div ref={headerRef}>
            <RestaurantHeader
              restaurantData={restaurantData}
              restaurantConfig={restaurantConfig}
              onInfoClick={() => setInfoModalOpen(true)}
            />

            {/* Botones superiores */}
            <div className="bg-white p-4 flex justify-end space-x-4 border-b">
              <button
                onClick={handleSearchClick}
                className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Buscar"
              >
                <Search className="h-5 w-5" />
                <span className="ml-2 hidden sm:inline">Buscar</span>
              </button>

              <button
                onClick={handleProfileClick}
                className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label={user ? "Perfil" : "Iniciar sesión"}
              >
                {user ? (
                  <>
                    {user.photoURL ? (
                      <img
                        src={user.photoURL || "/placeholder.svg"}
                        alt="Foto de perfil"
                        className="h-5 w-5 rounded-full"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                    <span className="ml-2 hidden sm:inline">
                      {user.displayName ? user.displayName.split(" ")[0] : "Perfil"}
                    </span>
                  </>
                ) : (
                  <>
                    <User className="h-5 w-5" />
                    <span className="ml-2 hidden sm:inline">Login</span>
                  </>
                )}
              </button>

              <button
                onClick={handleOrdersClick}
                className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Mis pedidos"
              >
                <Package className="h-5 w-5" />
                <span className="ml-2 hidden sm:inline">Pedidos</span>
              </button>
            </div>
          </div>

          {/* Productos destacados */}
          <div className="bg-white px-4 py-6 mb-2">
            <h2 className="text-xl font-bold mb-4">Artículos destacados</h2>
            <FeaturedProducts tenantId={tenantId} branchId={currentBranchId} />
          </div>

          {/* Categorías y productos */}
          <div id="products-section" className="mt-2 bg-white">
            <MenuCategories
              tenantId={tenantId}
              branchId={currentBranchId}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              showMobileMenu={showMobileMenu}
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
