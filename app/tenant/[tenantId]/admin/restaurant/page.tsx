"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getRestaurantConfig } from "@/lib/services/restaurant-config-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Store,
  Phone,
  MapPin,
  Clock,
  CreditCard,
  Truck,
  Globe,
  Coffee,
  Table,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useBranch } from "@/lib/context/branch-context"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"

// Definir los grupos de configuración
const configGroups = [
  {
    id: "basic",
    title: "Información General",
    description: "Configura la información básica de tu restaurante",
    items: [
      { id: "basic", label: "Información Básica", path: "/admin/restaurant/basic", icon: Store },
      { id: "contact", label: "Contacto", path: "/admin/restaurant/contact", icon: Phone },
      { id: "location", label: "Ubicación", path: "/admin/restaurant/location", icon: MapPin },
      { id: "social", label: "Redes Sociales", path: "/admin/restaurant/social", icon: Globe },
    ],
  },
  {
    id: "operations",
    title: "Operaciones",
    description: "Configura cómo opera tu restaurante",
    items: [
      { id: "service", label: "Métodos de Servicio", path: "/admin/restaurant/service", icon: Coffee },
      { id: "hours", label: "Horarios", path: "/admin/restaurant/hours", icon: Clock },
      { id: "tables", label: "Mesas", path: "/admin/restaurant/tables", icon: Table },
    ],
  },
  {
    id: "payments",
    title: "Pagos y Envíos",
    description: "Configura métodos de pago y opciones de delivery",
    items: [
      { id: "payment", label: "Métodos de Pago", path: "/admin/restaurant/payment", icon: CreditCard },
      { id: "delivery", label: "Delivery", path: "/admin/restaurant/delivery", icon: Truck },
    ],
  },
]

export default function RestaurantConfigPage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("basic")
  const [config, setConfig] = useState<any>(null)
  const { toast } = useToast()
  const { currentBranch, loading: branchLoading } = useBranch()

  // Obtener todos los pasos de configuración
  const allConfigSteps = configGroups.flatMap((group) => group.items)

  useEffect(() => {
    let isMounted = true

    async function loadConfig() {
      try {
        if (branchLoading) return
        if (isMounted) setLoading(true)

        if (!currentBranch) {
          if (isMounted) {
            setCompletedSteps([])
            setConfig(null)
            setLoading(false)
          }
          return
        }

        // Cargar los pasos completados desde localStorage
        const branchKey = `${tenantId}_${currentBranch.id}_completedConfigSteps`
        const savedCompletedSteps = localStorage.getItem(branchKey)

        if (savedCompletedSteps && isMounted) {
          setCompletedSteps(JSON.parse(savedCompletedSteps))
        } else if (isMounted) {
          setCompletedSteps([])
        }

        // Cargar la configuración actual
        try {
          const restaurantConfig = await getRestaurantConfig(tenantId, currentBranch.id)
          if (isMounted) {
            setConfig(restaurantConfig || {})
          }
        } catch (err) {
          console.error("Error al cargar configuración:", err)
        }
      } catch (error) {
        console.error("Error general:", error)
        if (isMounted) {
          toast({
            title: "Error",
            description: "No se pudo cargar la información del restaurante",
            variant: "destructive",
          })
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadConfig()

    return () => {
      isMounted = false
    }
  }, [tenantId, currentBranch, branchLoading, toast])

  const getCompletionPercentage = () => {
    if (!allConfigSteps.length) return 0
    return Math.round((completedSteps.length / allConfigSteps.length) * 100)
  }

  const isStepCompleted = (stepId: string) => {
    return completedSteps.includes(stepId)
  }

  const handleMarkAllAsCompleted = async () => {
    if (!currentBranch) return

    const allStepIds = allConfigSteps.map((step) => step.id)
    setCompletedSteps(allStepIds)

    const branchKey = `${tenantId}_${currentBranch.id}_completedConfigSteps`
    localStorage.setItem(branchKey, JSON.stringify(allStepIds))

    toast({
      title: "Configuración completada",
      description: "Todas las secciones han sido marcadas como completadas",
    })
  }

  // Si todavía se están cargando las sucursales, mostramos un indicador de carga
  if (branchLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando sucursales...</span>
      </div>
    )
  }

  // Si se están cargando los datos de configuración, mostramos un indicador de carga
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando configuración...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Configuración del Restaurante</h1>

        {currentBranch && (
          <Button variant="outline" onClick={handleMarkAllAsCompleted} disabled={getCompletionPercentage() === 100}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Marcar todo como completado
          </Button>
        )}
      </div>

      {/* Mostrar alerta si no hay sucursal seleccionada */}
      <NoBranchSelectedAlert />

      {currentBranch ? (
        <>
          {/* Barra de progreso */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Progreso de configuración</CardTitle>
                <span className="text-sm font-medium bg-primary text-primary-foreground px-2 py-1 rounded-md">
                  {getCompletionPercentage()}%
                </span>
              </div>
              <CardDescription>Sucursal: {currentBranch.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${getCompletionPercentage()}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs de configuración */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              {configGroups.map((group) => (
                <TabsTrigger key={group.id} value={group.id}>
                  {group.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {configGroups.map((group) => (
              <TabsContent key={group.id} value={group.id} className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>{group.title}</CardTitle>
                    <CardDescription>{group.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {group.items.map((item) => {
                        const isCompleted = isStepCompleted(item.id)

                        return (
                          <Card
                            key={item.id}
                            className={`border ${isCompleted ? "border-green-200" : "border-gray-200"} hover:border-primary transition-colors`}
                          >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
                              {isCompleted ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <AlertCircle className="h-5 w-5 text-amber-500" />
                              )}
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center justify-between pt-4">
                                <item.icon className="h-8 w-8 text-muted-foreground" />
                                <Button
                                  onClick={() => router.push(item.path)}
                                  variant={isCompleted ? "outline" : "default"}
                                >
                                  {isCompleted ? "Editar" : "Configurar"}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Selecciona una sucursal para configurar la información del restaurante.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
