"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getRestaurantConfig, initializeRestaurantConfig } from "@/lib/services/restaurant-config-service"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Store,
  Phone,
  MapPin,
  Clock,
  CreditCard,
  Truck,
  Coffee,
  Table,
  CheckCircle,
  Settings,
  ChevronRight,
  Loader2,
  PanelLeft,
  PanelRight,
  Info,
  Utensils,
  DollarSign,
  Share2,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useBranch } from "@/lib/context/branch-context"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

// Definir los grupos de configuración
const configSections = [
  {
    id: "basic",
    label: "Información Básica",
    path: "/admin/restaurant/basic",
    icon: Store,
    description: "Nombre, descripción y logo del restaurante",
    category: "general",
    color: "blue",
  },
  {
    id: "contact",
    label: "Contacto",
    path: "/admin/restaurant/contact",
    icon: Phone,
    description: "Teléfono, email y WhatsApp",
    category: "general",
    color: "blue",
  },
  {
    id: "location",
    label: "Ubicación",
    path: "/admin/restaurant/location",
    icon: MapPin,
    description: "Dirección y zonas de cobertura",
    category: "general",
    color: "blue",
  },
  {
    id: "service",
    label: "Métodos de Servicio",
    path: "/admin/restaurant/service",
    icon: Utensils,
    description: "Opciones de servicio disponibles",
    category: "operations",
    color: "amber",
  },
  {
    id: "hours",
    label: "Horarios",
    path: "/admin/restaurant/hours",
    icon: Clock,
    description: "Horarios de apertura y cierre",
    category: "operations",
    color: "amber",
  },
  {
    id: "tables",
    label: "Mesas",
    path: "/admin/restaurant/tables",
    icon: Table,
    description: "Configuración de mesas disponibles",
    category: "operations",
    color: "amber",
  },
  {
    id: "payment",
    label: "Métodos de Pago",
    path: "/admin/restaurant/payment",
    icon: CreditCard,
    description: "Formas de pago aceptadas",
    category: "payments",
    color: "green",
  },
  {
    id: "delivery",
    label: "Delivery",
    path: "/admin/restaurant/delivery",
    icon: Truck,
    description: "Configuración de entrega a domicilio",
    category: "payments",
    color: "green",
  },
  {
    id: "social",
    label: "Redes Sociales",
    path: "/admin/restaurant/social",
    icon: Share2,
    description: "Enlaces a redes sociales",
    category: "general",
    color: "blue",
  },
]

const categories = [
  { id: "general", label: "Información General", icon: Info, color: "blue" },
  { id: "operations", label: "Operaciones", icon: Coffee, color: "amber" },
  { id: "payments", label: "Pagos y Envíos", icon: DollarSign, color: "green" },
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

  // Obtener el color de categoría
  const getCategoryColor = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    return category?.color || "gray"
  }

  // Obtener el color de fondo para una tarjeta según su categoría y estado
  const getCardBgColor = (category: string, isCompleted: boolean) => {
    const baseColor = getCategoryColor(category)
    if (isCompleted) return `bg-${baseColor}-50 border-${baseColor}-200`
    return "bg-muted/30 border-gray-200"
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
                    {categories.map((category) => {
                      const CategoryIcon = category.icon
                      return (
                        <TabsTrigger key={category.id} value={category.id} className="text-xs">
                          <CategoryIcon className="h-3.5 w-3.5 mr-1.5" />
                          {category.label}
                        </TabsTrigger>
                      )
                    })}
                  </TabsList>

                  {categories.map((category) => {
                    const categoryItems = configSections.filter((section) => section.category === category.id)
                    const completedCount = categoryItems.filter((item) => isStepCompleted(item.id)).length

                    return (
                      <TabsContent key={category.id} value={category.id} className="mt-0 space-y-1">
                        <div className="mb-2 px-1">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Completado</span>
                            <span>
                              {completedCount}/{categoryItems.length}
                            </span>
                          </div>
                          <Progress
                            value={categoryItems.length ? (completedCount / categoryItems.length) * 100 : 0}
                            className={`h-1.5 ${category.color === "blue" ? "bg-blue-100" : category.color === "amber" ? "bg-amber-100" : "bg-green-100"}`}
                          />
                        </div>

                        {categoryItems.map((section) => {
                          const isCompleted = isStepCompleted(section.id)
                          return (
                            <Button
                              key={section.id}
                              variant="ghost"
                              className={cn(
                                "w-full justify-start text-left font-normal h-auto py-2",
                                isCompleted && `text-${section.color}-600`,
                              )}
                              onClick={() => router.push(section.path)}
                            >
                              <div className="flex items-center w-full">
                                <section.icon
                                  className={`mr-2 h-4 w-4 ${isCompleted ? `text-${section.color}-500` : "text-muted-foreground"}`}
                                />
                                <span className="flex-1">{section.label}</span>
                                {isCompleted ? (
                                  <CheckCircle className={`h-4 w-4 text-${section.color}-500`} />
                                ) : (
                                  <ChevronRight className="h-4 w-4 opacity-50" />
                                )}
                              </div>
                            </Button>
                          )
                        })}
                      </TabsContent>
                    )
                  })}
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

            <Tabs defaultValue="general" className="w-full">
              <TabsList className="w-full mb-6">
                {categories.map((category) => {
                  const CategoryIcon = category.icon
                  return (
                    <TabsTrigger key={category.id} value={category.id} className="flex-1">
                      <CategoryIcon className="h-4 w-4 mr-2" />
                      {category.label}
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              {categories.map((category) => (
                <TabsContent key={category.id} value={category.id}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {configSections
                      .filter((section) => section.category === category.id)
                      .map((section) => {
                        const isCompleted = isStepCompleted(section.id)
                        return (
                          <Card
                            key={section.id}
                            className={cn(
                              "overflow-hidden transition-all hover:shadow-md",
                              isCompleted ? `border-${section.color}-200` : "border-gray-200",
                            )}
                          >
                            <CardHeader className={cn("p-4", isCompleted ? `bg-${section.color}-50` : "bg-muted/30")}>
                              <div className="flex items-center">
                                <section.icon
                                  className={`h-5 w-5 mr-2 ${isCompleted ? `text-${section.color}-500` : "text-muted-foreground"}`}
                                />
                                <div className="flex-1">
                                  <CardTitle className="text-base">{section.label}</CardTitle>
                                  <CardDescription>{section.description}</CardDescription>
                                </div>
                                {isCompleted && (
                                  <Badge
                                    variant="outline"
                                    className={`bg-${section.color}-100 text-${section.color}-700 border-${section.color}-200`}
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Completado
                                  </Badge>
                                )}
                              </div>
                            </CardHeader>
                            <CardFooter className="p-4 flex justify-end">
                              <Button
                                variant={isCompleted ? "outline" : "default"}
                                size="sm"
                                onClick={() => router.push(section.path)}
                                className={
                                  isCompleted
                                    ? `border-${section.color}-200 text-${section.color}-700 hover:bg-${section.color}-50`
                                    : ""
                                }
                              >
                                {isCompleted ? "Editar" : "Configurar"}
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Button>
                            </CardFooter>
                          </Card>
                        )
                      })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
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
