"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getRestaurantConfig, initializeRestaurantConfig } from "@/lib/services/restaurant-config-service"
import { Card, CardContent } from "@/components/ui/card"
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
  Settings,
  ChevronRight,
  Loader2,
  PanelLeft,
  PanelRight,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useBranch } from "@/lib/context/branch-context"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

// Definir los grupos de configuración
const configSections = [
  {
    id: "basic",
    label: "Información Básica",
    path: "/admin/restaurant/basic",
    icon: Store,
    description: "Nombre, descripción y logo del restaurante",
    category: "general",
  },
  {
    id: "contact",
    label: "Contacto",
    path: "/admin/restaurant/contact",
    icon: Phone,
    description: "Teléfono, email y WhatsApp",
    category: "general",
  },
  {
    id: "location",
    label: "Ubicación",
    path: "/admin/restaurant/location",
    icon: MapPin,
    description: "Dirección y zonas de cobertura",
    category: "general",
  },
  {
    id: "service",
    label: "Métodos de Servicio",
    path: "/admin/restaurant/service",
    icon: Coffee,
    description: "Opciones de servicio disponibles",
    category: "operations",
  },
  {
    id: "hours",
    label: "Horarios",
    path: "/admin/restaurant/hours",
    icon: Clock,
    description: "Horarios de apertura y cierre",
    category: "operations",
  },
  {
    id: "tables",
    label: "Mesas",
    path: "/admin/restaurant/tables",
    icon: Table,
    description: "Configuración de mesas disponibles",
    category: "operations",
  },
  {
    id: "payment",
    label: "Métodos de Pago",
    path: "/admin/restaurant/payment",
    icon: CreditCard,
    description: "Formas de pago aceptadas",
    category: "payments",
  },
  {
    id: "delivery",
    label: "Delivery",
    path: "/admin/restaurant/delivery",
    icon: Truck,
    description: "Configuración de entrega a domicilio",
    category: "payments",
  },
  {
    id: "social",
    label: "Redes Sociales",
    path: "/admin/restaurant/social",
    icon: Globe,
    description: "Enlaces a redes sociales",
    category: "general",
  },
]

const categories = [
  { id: "general", label: "Información General" },
  { id: "operations", label: "Operaciones" },
  { id: "payments", label: "Pagos y Envíos" },
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
  const [activeCategory, setActiveCategory] = useState("general")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [config, setConfig] = useState<any>(null)
  const { toast } = useToast()
  const { currentBranch, loading: branchLoading } = useBranch()

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
    if (!configSections.length) return 0
    return Math.round((completedSteps.length / configSections.length) * 100)
  }

  const isStepCompleted = (stepId: string) => {
    return completedSteps.includes(stepId)
  }

  const handleInitializeConfig = async () => {
    if (!currentBranch) return

    try {
      setLoading(true)
      await initializeRestaurantConfig(tenantId, currentBranch.id, currentBranch.name)

      toast({
        title: "Configuración inicializada",
        description: "Se ha creado una configuración básica para tu restaurante",
      })

      // Recargar la página para mostrar la nueva configuración
      window.location.reload()
    } catch (error) {
      console.error("Error al inicializar configuración:", error)
      toast({
        title: "Error",
        description: "No se pudo inicializar la configuración",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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
    <div className="h-[calc(100vh-120px)] overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Configuración del Restaurante</h1>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="md:hidden"
        >
          {sidebarCollapsed ? <PanelRight className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mostrar alerta si no hay sucursal seleccionada */}
      <NoBranchSelectedAlert />

      {currentBranch ? (
        <div className="flex h-full border rounded-lg overflow-hidden">
          {/* Panel lateral */}
          <div
            className={cn(
              "border-r bg-muted/40 transition-all duration-300",
              sidebarCollapsed ? "w-0 opacity-0" : "w-full md:w-72 opacity-100",
            )}
          >
            <div className="p-4 border-b">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Sucursal: {currentBranch.name}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarCollapsed(true)}
                  className="hidden md:flex"
                >
                  <PanelLeft className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Progreso</span>
                  <span className="font-medium">{getCompletionPercentage()}%</span>
                </div>
                <Progress value={getCompletionPercentage()} className="h-2" />
              </div>
            </div>

            <ScrollArea className="h-[calc(100%-73px)]">
              <div className="p-2">
                <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
                  <TabsList className="grid grid-cols-3 mb-4">
                    {categories.map((category) => (
                      <TabsTrigger key={category.id} value={category.id} className="text-xs">
                        {category.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {categories.map((category) => (
                    <TabsContent key={category.id} value={category.id} className="mt-0 space-y-1">
                      {configSections
                        .filter((section) => section.category === category.id)
                        .map((section) => {
                          const isCompleted = isStepCompleted(section.id)
                          return (
                            <Button
                              key={section.id}
                              variant="ghost"
                              className={cn(
                                "w-full justify-start text-left font-normal h-auto py-2",
                                isCompleted && "text-green-600",
                              )}
                              onClick={() => router.push(section.path)}
                            >
                              <div className="flex items-center w-full">
                                <section.icon className="mr-2 h-4 w-4" />
                                <span className="flex-1">{section.label}</span>
                                {isCompleted ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 opacity-50" />
                                )}
                              </div>
                            </Button>
                          )
                        })}
                    </TabsContent>
                  ))}
                </Tabs>

                {!config || Object.keys(config).length === 0 ? (
                  <div className="mt-6 p-4 border rounded-lg bg-amber-50 border-amber-200">
                    <h3 className="font-medium text-amber-800 mb-2">No hay configuración</h3>
                    <p className="text-sm text-amber-700 mb-4">
                      No se ha encontrado configuración para esta sucursal. Puedes inicializar la configuración con
                      valores predeterminados.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full border-amber-300 bg-amber-100 hover:bg-amber-200"
                      onClick={handleInitializeConfig}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Inicializar Configuración
                    </Button>
                  </div>
                ) : null}
              </div>
            </ScrollArea>
          </div>

          {/* Contenido principal */}
          <div className={cn("flex-1 p-6 bg-card", sidebarCollapsed ? "w-full" : "w-0 md:w-auto")}>
            {sidebarCollapsed ? (
              <Button variant="outline" size="icon" onClick={() => setSidebarCollapsed(false)} className="mb-4">
                <PanelRight className="h-4 w-4" />
              </Button>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {configSections.map((section) => {
                const isCompleted = isStepCompleted(section.id)
                return (
                  <Card
                    key={section.id}
                    className={cn(
                      "overflow-hidden transition-all hover:shadow-md",
                      isCompleted ? "border-green-200" : "border-gray-200",
                    )}
                  >
                    <CardContent className="p-0">
                      <div
                        className={cn("flex items-center p-4 border-b", isCompleted ? "bg-green-50" : "bg-muted/30")}
                      >
                        <section.icon className="h-5 w-5 mr-2 text-muted-foreground" />
                        <div className="flex-1">
                          <h3 className="font-medium">{section.label}</h3>
                          <p className="text-xs text-muted-foreground">{section.description}</p>
                        </div>
                        {isCompleted ? <CheckCircle className="h-4 w-4 text-green-600" /> : null}
                      </div>
                      <div className="p-4 flex justify-end">
                        <Button
                          variant={isCompleted ? "outline" : "default"}
                          size="sm"
                          onClick={() => router.push(section.path)}
                        >
                          {isCompleted ? "Editar" : "Configurar"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
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
