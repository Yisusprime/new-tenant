"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, ShoppingBag, MapPin, CreditCard, Bell, LogOut, ChevronRight, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { DesktopNavigation } from "../components/desktop-navigation"
import { MobileNavigation } from "../components/mobile-navigation"

export default function ProfilePage({ params }: { params: { tenantId: string } }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profile")

  // Datos de muestra del usuario
  const user = {
    name: "Carlos Rodríguez",
    email: "carlos.rodriguez@example.com",
    phone: "+34 612 345 678",
    avatar: "/abstract-geometric-shapes.png",
    address: "Calle Principal 123, Madrid, España",
    orders: [
      { id: "ORD-1234", date: "15/04/2023", total: "€24.99", status: "Entregado" },
      { id: "ORD-5678", date: "02/05/2023", total: "€32.50", status: "En proceso" },
      { id: "ORD-9012", date: "18/05/2023", total: "€18.75", status: "Cancelado" },
    ],
  }

  const handleLogout = () => {
    // Simulación de cierre de sesión
    router.push(`/menu/login`)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <DesktopNavigation />

      <div className="max-w-5xl mx-auto px-4 pt-6 pb-24">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar con información del usuario */}
          <div className="w-full md:w-1/3">
            <Card className="mb-4">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    <p className="text-gray-500">{user.email}</p>
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
                      <p className="font-medium">{user.name}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Correo electrónico</label>
                      <p className="font-medium">{user.email}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Teléfono</label>
                      <p className="font-medium">{user.phone}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Dirección principal</label>
                      <p className="font-medium">{user.address}</p>
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

                  <div className="space-y-4">
                    {user.orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{order.id}</p>
                            <p className="text-sm text-gray-500">{order.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{order.total}</p>
                            <p
                              className={`text-sm ${
                                order.status === "Entregado"
                                  ? "text-green-500"
                                  : order.status === "Cancelado"
                                    ? "text-red-500"
                                    : "text-orange-500"
                              }`}
                            >
                              {order.status}
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "addresses" && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Mis direcciones</h3>

                  <div className="border rounded-lg p-4 mb-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">Casa</p>
                        <p className="text-gray-500">{user.address}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50">
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 mb-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">Trabajo</p>
                        <p className="text-gray-500">Avenida Empresarial 45, Madrid, España</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50">
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button>Añadir nueva dirección</Button>
                </CardContent>
              </Card>
            )}

            {activeTab === "payment" && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Métodos de pago</h3>

                  <div className="border rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded">
                          <CreditCard className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Visa terminada en 4567</p>
                          <p className="text-sm text-gray-500">Expira: 05/25</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Eliminar
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="bg-red-100 p-2 rounded">
                          <CreditCard className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium">Mastercard terminada en 8901</p>
                          <p className="text-sm text-gray-500">Expira: 12/24</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Eliminar
                      </Button>
                    </div>
                  </div>

                  <Button>Añadir método de pago</Button>
                </CardContent>
              </Card>
            )}

            {activeTab === "favorites" && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Mis favoritos</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 flex">
                      <div className="h-16 w-16 rounded-md bg-gray-100 mr-3 flex-shrink-0">
                        <img
                          src="/classic-burger.png"
                          alt="Hamburguesa"
                          className="h-full w-full object-cover rounded-md"
                        />
                      </div>
                      <div>
                        <p className="font-medium">Hamburguesa Clásica</p>
                        <p className="text-sm text-gray-500">€8.99</p>
                        <Button variant="link" size="sm" className="p-0 h-auto text-primary">
                          Añadir al carrito
                        </Button>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 flex">
                      <div className="h-16 w-16 rounded-md bg-gray-100 mr-3 flex-shrink-0">
                        <img
                          src="/margherita-pizza.png"
                          alt="Pizza"
                          className="h-full w-full object-cover rounded-md"
                        />
                      </div>
                      <div>
                        <p className="font-medium">Pizza Margherita</p>
                        <p className="text-sm text-gray-500">€10.50</p>
                        <Button variant="link" size="sm" className="p-0 h-auto text-primary">
                          Añadir al carrito
                        </Button>
                      </div>
                    </div>
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
