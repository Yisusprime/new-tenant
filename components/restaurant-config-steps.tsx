"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import {
  Store,
  User,
  Truck,
  MapPin,
  Clock,
  CreditCard,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Save,
  Table,
  Share2,
  Utensils,
  DollarSign,
  BarChart,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useBranch } from "@/lib/context/branch-context"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"
import { useToast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface Step {
  id: string
  label: string
  path: string
  icon: React.ElementType
  description: string
  color: string
  category: string
}

export function RestaurantConfigSteps({
  tenantId,
  currentStep,
  children,
}: {
  tenantId: string
  currentStep: string
  children: React.ReactNode
}) {
  const router = useRouter()
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const { currentBranch } = useBranch()
  const { toast } = useToast()

  // Definir los pasos de configuración con descripciones y colores
  const steps: Step[] = [
    {
      id: "basic",
      label: "Información Básica",
      path: `/admin/restaurant/basic`,
      icon: Store,
      description: "Nombre, descripción y logo del restaurante",
      color: "blue",
      category: "general",
    },
    {
      id: "contact",
      label: "Contacto",
      path: `/admin/restaurant/contact`,
      icon: User,
      description: "Teléfono, email y persona de contacto",
      color: "blue",
      category: "general",
    },
    {
      id: "currency",
      label: "Moneda e Impuestos",
      path: `/admin/restaurant/currency`,
      icon: DollarSign,
      description: "Configuración de moneda e IVA",
      color: "blue",
      category: "general",
    },
    {
      id: "service",
      label: "Métodos de Servicio",
      path: `/admin/restaurant/service`,
      icon: Utensils,
      description: "Opciones de servicio disponibles",
      color: "amber",
      category: "operations",
    },
    {
      id: "location",
      label: "Ubicación",
      path: `/admin/restaurant/location`,
      icon: MapPin,
      description: "Dirección y ubicación en el mapa",
      color: "blue",
      category: "general",
    },
    {
      id: "hours",
      label: "Horarios",
      path: `/admin/restaurant/hours`,
      icon: Clock,
      description: "Horarios de apertura y cierre",
      color: "amber",
      category: "operations",
    },
    {
      id: "tables",
      label: "Mesas",
      path: `/admin/restaurant/tables`,
      icon: Table,
      description: "Configuración de mesas disponibles",
      color: "purple",
      category: "management",
    },
    {
      id: "payment",
      label: "Pagos",
      path: `/admin/restaurant/payment`,
      icon: CreditCard,
      description: "Métodos de pago aceptados",
      color: "green",
      category: "payments",
    },
    {
      id: "delivery",
      label: "Delivery",
      path: `/admin/restaurant/delivery`,
      icon: Truck,
      description: "Configuración de entrega a domicilio",
      color: "green",
      category: "payments",
    },
    {
      id: "social",
      label: "Redes Sociales",
      path: `/admin/restaurant/social`,
      icon: Share2,
      description: "Enlaces a redes sociales",
      color: "blue",
      category: "general",
    },
  ]

  // Categorías para agrupar los pasos
  const categories = [
    { id: "general", label: "Información General", icon: Store, color: "blue" },
    { id: "operations", label: "Operaciones", icon: Clock, color: "amber" },
    { id: "management", label: "Gestión", icon: BarChart, color: "purple" },
    { id: "payments", label: "Pagos y Envíos", icon: CreditCard, color: "green" },
  ]

  // Cargar los pasos completados desde localStorage
  useEffect(() => {
    let isMounted = true

    const loadCompletedSteps = () => {
      setLoading(true)

      if (!currentBranch) {
        if (isMounted) {
          setCompletedSteps([])
          setLoading(false)
        }
        return
      }

      const branchKey = `${tenantId}_${currentBranch.id}_completedConfigSteps`
      const savedCompletedSteps = localStorage.getItem(branchKey)

      if (savedCompletedSteps && isMounted) {
        try {
          setCompletedSteps(JSON.parse(savedCompletedSteps))
        } catch (err) {
          console.error("Error parsing completed steps:", err)
          setCompletedSteps([])
        }
      } else if (isMounted) {
        // Si no hay pasos guardados para esta sucursal, reiniciar
        setCompletedSteps([])
      }

      if (isMounted) {
        setLoading(false)
      }
    }

    loadCompletedSteps()

    return () => {
      isMounted = false
    }
  }, [tenantId, currentBranch])

  // Función para marcar un paso como completado
  const markStepAsCompleted = (stepId: string) => {
    if (!currentBranch) return

    if (!completedSteps.includes(stepId)) {
      const newCompletedSteps = [...completedSteps, stepId]
      setCompletedSteps(newCompletedSteps)

      const branchKey = `${tenantId}_${currentBranch.id}_completedConfigSteps`
      localStorage.setItem(branchKey, JSON.stringify(newCompletedSteps))

      toast({
        title: "Sección completada",
        description: "Los cambios han sido guardados correctamente",
      })
    }
  }

  // Función para navegar al siguiente paso
  const goToNextStep = () => {
    const currentIndex = steps.findIndex((step) => step.id === currentStep)
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1]
      router.push(nextStep.path)
    }
  }

  // Función para navegar al paso anterior
  const goToPreviousStep = () => {
    const currentIndex = steps.findIndex((step) => step.id === currentStep)
    if (currentIndex > 0) {
      const previousStep = steps[currentIndex - 1]
      router.push(previousStep.path)
    }
  }

  // Calcular el progreso
  const calculateProgress = () => {
    return Math.round((completedSteps.length / steps.length) * 100)
  }

  // Obtener el paso actual
  const currentStepObj = steps.find((step) => step.id === currentStep)
  const currentIndex = steps.findIndex((step) => step.id === currentStep)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-20">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="ml-2">Cargando progreso...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Mostrar alerta si no hay sucursal seleccionada */}
      <NoBranchSelectedAlert />

      <div className="flex flex-col md:flex-row gap-4">
        {/* Panel lateral con pasos */}
        <div className="w-full md:w-64 flex-shrink-0">
          <Card className="h-full">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg">Configuración</CardTitle>
              <CardDescription>
                Paso {currentIndex + 1} de {steps.length}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 h-full flex flex-col">
              <div className="mb-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Progreso</span>
                  <span className="font-medium">{calculateProgress()}%</span>
                </div>
                <Progress value={calculateProgress()} className="h-2" />
              </div>

              <ScrollArea className="flex-1 pr-3">
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div key={category.id} className="space-y-1">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                        {category.label}
                      </h4>
                      {steps
                        .filter((step) => step.category === category.id)
                        .map((step, index) => {
                          const isActive = step.id === currentStep
                          const isCompleted = completedSteps.includes(step.id)
                          const StepIcon = step.icon

                          return (
                            <Button
                              key={step.id}
                              variant={isActive ? "default" : isCompleted ? "outline" : "ghost"}
                              size="sm"
                              className={cn(
                                "w-full justify-start text-left h-auto py-2",
                                isActive ? "pointer-events-none" : "",
                                isCompleted && !isActive
                                  ? `border-${step.color}-200 text-${step.color}-700 hover:bg-${step.color}-50`
                                  : "",
                              )}
                              onClick={() => router.push(step.path)}
                            >
                              <div className="flex items-center w-full">
                                <div
                                  className={`flex items-center justify-center w-6 h-6 rounded-full mr-2 text-xs font-medium ${
                                    isActive
                                      ? "bg-primary text-primary-foreground"
                                      : isCompleted
                                        ? `bg-${step.color}-100 text-${step.color}-700`
                                        : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {isCompleted && !isActive ? (
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  ) : (
                                    <StepIcon className="h-3.5 w-3.5" />
                                  )}
                                </div>
                                <span className="flex-1 text-sm">{step.label}</span>
                                {isCompleted && !isActive && (
                                  <Badge
                                    variant="outline"
                                    className={`bg-${step.color}-50 border-${step.color}-200 text-${step.color}-700 text-xs py-0 px-1.5`}
                                  >
                                    Completado
                                  </Badge>
                                )}
                              </div>
                            </Button>
                          )
                        })}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="mt-3 pt-3 border-t flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousStep}
                  disabled={currentStep === steps[0].id || !currentBranch}
                >
                  <ArrowLeft className="mr-1 h-3 w-3" />
                  Anterior
                </Button>

                <Button
                  size="sm"
                  onClick={() => {
                    markStepAsCompleted(currentStep)
                    goToNextStep()
                  }}
                  disabled={currentStep === steps[steps.length - 1].id || !currentBranch}
                >
                  Siguiente
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contenido principal */}
        <div className="flex-1">
          <Card className="h-full">
            <CardHeader className="p-4 pb-2 border-b">
              <div className="flex items-center">
                {currentStepObj?.icon && (
                  <div className={`p-2 rounded-md bg-${currentStepObj.color}-50 text-${currentStepObj.color}-500 mr-3`}>
                    <currentStepObj.icon className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <CardTitle>{currentStepObj?.label}</CardTitle>
                  <CardDescription>{currentStepObj?.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Renderizar el contenido pasado como children */}
                {children}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end p-4 border-t">
              <Button onClick={() => markStepAsCompleted(currentStep)} disabled={!currentBranch} className="ml-auto">
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
