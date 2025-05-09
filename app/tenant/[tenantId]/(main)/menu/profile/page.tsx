"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, ShoppingBag, MapPin, CreditCard, Bell, LogOut, Heart, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { MobileNavigation } from "../components/mobile-navigation"
import { useAuth } from "@/lib/context/auth-context"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/client"

export default function ProfilePage({ params }: { params: { tenantId: string } }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profile")
  const { user, signOut, loading } = useAuth()
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!loading && !user) {
      router.push("/menu/login")
    }
  }, [user, loading, router])

  // Cargar datos del usuario desde Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, `tenants/${params.tenantId}/users`, user.uid)
          const userDoc = await getDoc(userDocRef)

          if (userDoc.exists()) {
            setUserData(userDoc.data())
          } else {
            // Si no existe en la colección de usuarios del tenant, crear un perfil básico
            setUserData({
              name: user.displayName || "Usuario",
              email: user.email || "",
              phone: user.phoneNumber || "",
              role: "customer",
            })
          }
        } catch (error) {
          console.error("Error al cargar datos del usuario:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    if (user) {
      fetchUserData()
    } else if (!loading) {
      setIsLoading(false)
    }
  }, [user, params.tenantId, loading])

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/menu")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  // Si está cargando, mostrar spinner
  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Si no hay usuario autenticado, no debería llegar aquí (useEffect redirige)
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-24">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar con información del usuario */}
          <div className="w-full md:w-1/3">
            <Card className="mb-4">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={user.photoURL || "/abstract-geometric-shapes.png"}
                      alt={userData?.name || user.displayName || ""}
                    />
                    <AvatarFallback>{(userData?.name || user.displayName || "U").charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold">{userData?.name || user.displayName || "Usuario"}</h2>
                    <p className="text-gray-500">{userData?.email || user.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <nav className="flex flex-col">
                  <button
                    className={`flex items-center space-x-3 p-4 hover:bg-gray-50 ${activeTab === "profile" ? "bg-gray-50 font-medium" : ""}`}
                    onClick={() => setActiveTab("profile")}
                  >
                    <User className="h-5 w-5 text-gray-500" />
                    <span>Mi perfil</span>
                  </button>

                  <button
                    className={`flex items-center space-x-3 p-4 hover:bg-gray-50 ${activeTab === "orders" ? "bg-gray-50 font-medium" : ""}`}
                    onClick={() => setActiveTab("orders")}
                  >
                    <ShoppingBag className="h-5 w-5 text-gray-500" />
                    <span>Mis pedidos</span>
                  </button>

                  <button
                    className={`flex items-center space-x-3 p-4 hover:bg-gray-50 ${activeTab === "addresses" ? "bg-gray-50 font-medium" : ""}`}
                    onClick={() => setActiveTab("addresses")}
                  >
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <span>Direcciones</span>
                  </button>

                  <button
                    className={`flex items-center space-x-3 p-4 hover:bg-gray-50 ${activeTab === "payment" ? "bg-gray-50 font-medium" : ""}`}
                    onClick={() => setActiveTab("payment")}
                  >
                    <CreditCard className="h-5 w-5 text-gray-500" />
                    <span>Métodos de pago</span>
                  </button>

                  <button
                    className={`flex items-center space-x-3 p-4 hover:bg-gray-50 ${activeTab === "favorites" ? "bg-gray-50 font-medium" : ""}`}
                    onClick={() => setActiveTab("favorites")}
                  >
                    <Heart className="h-5 w-5 text-gray-500" />
                    <span>Favoritos</span>
                  </button>

                  <button
                    className={`flex items-center space-x-3 p-4 hover:bg-gray-50 ${activeTab === "notifications" ? "bg-gray-50 font-medium" : ""}`}
                    onClick={() => setActiveTab("notifications")}
                  >
                    <Bell className="h-5 w-5 text-gray-500" />
                    <span>Notificaciones</span>
                  </button>

                  <Separator />

                  <button
                    className="flex items-center space-x-3 p-4 text-red-500 hover:bg-gray-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Cerrar sesión</span>
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Contenido principal */}
          <div className="w-full md:w-2/3">
            {activeTab === "profile" && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Información personal</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Nombre completo</label>
                      <p className="font-medium">{userData?.name || user.displayName || "No especificado"}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Correo electrónico</label>
                      <p className="font-medium">{userData?.email || user.email}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Teléfono</label>
                      <p className="font-medium">{userData?.phone || user.phoneNumber || "No especificado"}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Dirección principal</label>
                      <p className="font-medium">{userData?.address || "No especificada"}</p>
                    </div>
                  </div>

                  <Button className="mt-6">Editar perfil</Button>
                </CardContent>
              </Card>
            )}

            {activeTab === "orders" && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Mis pedidos</h3>

                  <div className="text-center py-8 text-gray-500">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No tienes pedidos recientes</p>
                    <Button variant="outline" className="mt-4" onClick={() => router.push("/menu")}>
                      Explorar menú
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "addresses" && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Mis direcciones</h3>

                  {userData?.addresses && userData.addresses.length > 0 ? (
                    <div className="space-y-4">
                      {userData.addresses.map((address: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4 mb-4">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium">{address.name}</p>
                              <p className="text-gray-500">{address.fullAddress}</p>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                Editar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 border-red-200 hover:bg-red-50"
                              >
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No tienes direcciones guardadas</p>
                    </div>
                  )}

                  <Button>Añadir nueva dirección</Button>
                </CardContent>
              </Card>
            )}

            {activeTab === "payment" && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Métodos de pago</h3>

                  <div className="text-center py-8 text-gray-500">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No tienes métodos de pago guardados</p>
                  </div>

                  <Button>Añadir método de pago</Button>
                </CardContent>
              </Card>
            )}

            {activeTab === "favorites" && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Mis favoritos</h3>

                  <div className="text-center py-8 text-gray-500">
                    <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No tienes productos favoritos</p>
                    <Button variant="outline" className="mt-4" onClick={() => router.push("/menu")}>
                      Explorar menú
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "notifications" && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Notificaciones</h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p>Notificaciones de pedidos</p>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input type="checkbox" id="toggle-1" defaultChecked className="sr-only" />
                        <div className="block h-6 bg-gray-300 rounded-full w-12"></div>
                        <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p>Ofertas y promociones</p>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input type="checkbox" id="toggle-2" defaultChecked className="sr-only" />
                        <div className="block h-6 bg-gray-300 rounded-full w-12"></div>
                        <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p>Actualizaciones del restaurante</p>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input type="checkbox" id="toggle-3" className="sr-only" />
                        <div className="block h-6 bg-gray-300 rounded-full w-12"></div>
                        <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Navegación móvil */}
      <div className="md:hidden">
        <MobileNavigation />
      </div>
    </div>
  )
}
