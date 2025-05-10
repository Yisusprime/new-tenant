"use client"

import { useState, useEffect } from "react"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { useRouter } from "next/navigation"
import { Search, User, Package } from "lucide-react"

interface RestaurantHeaderProps {
  restaurantData: any
  restaurantConfig: any
  onInfoClick: () => void
}

export function RestaurantHeader({ restaurantData, restaurantConfig, onInfoClick }: RestaurantHeaderProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userLoading, setUserLoading] = useState(true)
  const auth = getAuth()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setUserLoading(false)
    })

    return () => unsubscribe()
  }, [auth])

  // Función para construir rutas correctamente
  const buildRoute = (path: string) => {
    // Si estamos en un subdominio, no necesitamos incluir /tenant/[tenantId]
    const isSubdomain =
      typeof window !== "undefined" &&
      window.location.hostname.includes(".") &&
      !window.location.hostname.startsWith("www.") &&
      !window.location.hostname.startsWith("localhost")

    // Extraer el tenantId de la URL actual
    const pathSegments = window.location.pathname.split("/")
    const tenantIdIndex = pathSegments.findIndex((segment) => segment === "tenant") + 1
    const tenantId = pathSegments[tenantIdIndex]

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

  const isOpen = restaurantConfig?.hours?.isOpen || false
  const logoUrl = restaurantConfig?.logo || restaurantData?.logo || "/restaurant-logo.png"

  return (
    <div className="relative">
      {/* Fondo de cabecera */}
      <div className="h-40 bg-gray-200 w-full">
        {restaurantConfig?.coverImage ? (
          <img
            src={restaurantConfig.coverImage || "/placeholder.svg"}
            alt="Portada del restaurante"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Botón de abierto/cerrado */}
      <div className="absolute top-4 left-4">
        <div
          className={`px-4 py-2 rounded-full text-white text-sm font-medium ${isOpen ? "bg-green-500" : "bg-red-500"}`}
        >
          {isOpen ? "Abierto ahora" : "Cerrado"}
        </div>
      </div>

      {/* Botones de acción (derecha) */}
      <div className="absolute top-4 right-4 flex space-x-2">
        <button
          onClick={handleSearchClick}
          className="bg-white rounded-full p-2 flex items-center shadow-md hover:bg-gray-50 transition-colors"
        >
          <Search className="h-5 w-5" />
          <span className="ml-2 hidden sm:inline">Buscar</span>
        </button>

        <button
          onClick={handleProfileClick}
          className="bg-white rounded-full p-2 flex items-center shadow-md hover:bg-gray-50 transition-colors"
        >
          {user ? (
            <>
              {user.photoURL ? (
                <img src={user.photoURL || "/placeholder.svg"} alt="Foto de perfil" className="h-5 w-5 rounded-full" />
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
          className="bg-white rounded-full p-2 flex items-center shadow-md hover:bg-gray-50 transition-colors"
        >
          <Package className="h-5 w-5" />
          <span className="ml-2 hidden sm:inline">Pedidos</span>
        </button>
      </div>

      {/* Logo y nombre del restaurante */}
      <div className="flex flex-col items-center -mt-16 relative z-10">
        <div className="w-32 h-32 rounded-full bg-white p-2 shadow-md overflow-hidden" onClick={onInfoClick}>
          <img
            src={logoUrl || "/placeholder.svg"}
            alt={restaurantData?.name || "Logo del restaurante"}
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        <h1 className="text-2xl font-bold mt-2">{restaurantData?.name || "Restaurante"}</h1>
        <div className="flex items-center mt-1 space-x-2">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="ml-1 text-sm">{restaurantConfig?.rating || restaurantData?.rating || "4.5"}</span>
          </div>
          <span className="text-sm text-gray-500">
            ({restaurantConfig?.reviewCount || restaurantData?.reviewCount || "200+"}){" "}
          </span>
          <span className="text-sm text-gray-500">•</span>
          <span className="text-sm text-gray-500">
            {restaurantConfig?.distance || restaurantData?.distance || "0.9 km"}
          </span>
        </div>
        <div className="flex items-center mt-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="ml-1 text-sm text-gray-500">
            {restaurantConfig?.address || restaurantData?.address || "Av las torres 0285"}
          </span>
        </div>
      </div>
    </div>
  )
}
