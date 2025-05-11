"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Store,
  User,
  Truck,
  MapPin,
  Clock,
  CreditCard,
  Globe,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Save,
  Table,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useBranch } from "@/lib/context/branch-context"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"
import { useToast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Step {
  id: string
  label: string
  path: string
  icon: React.ElementType
  description: string
}

export function RestaurantConfigSteps({ tenantId, currentStep }: { tenantId: string; currentStep: string }) {
  const router = useRouter()
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const { currentBranch } = useBranch()
  const { toast } = useToast()

  // Definir los pasos de configuración con descripciones
  const steps: Step[] = [
    {
      id: "basic",
      label: "Información Básica",
      path: `/admin/restaurant/basic`,
      icon: Store,
      description: "Nombre, descripción y logo del restaurante",
    },
    {
      id: "contact",
      label: "Contacto",
      path: `/admin/restaurant/contact`,
      icon: User,
      description: "Teléfono, email y persona de contacto",
    },
    {
      id: "service",
      label: "Métodos de Servicio",
      path: `/admin/restaurant/service`,
      icon: Truck,
      description: "Opciones de servicio disponibles",
    },
    {
      id: "location",
      label: "Ubicación",
      path: `/admin/restaurant/location`,
      icon: MapPin,
      description: "Dirección y ubicación en el mapa",
    },
    {
      id: "hours",
      label: "Horarios",
      path: `/admin/restaurant/hours`,
      icon: Clock,
      description: "Horarios de apertura y cierre",
    },
    {
      id: "tables",
      label: "Mesas",
      path: `/admin/restaurant/tables`,
      icon: Table,
      description: "Configuración de mesas disponibles",
    },
    {
      id: "payment",
      label: "Pagos",
      path: `/admin/restaurant/payment`,
      icon: CreditCard,
      description: "Métodos de pago aceptados",
    },
    {
      id: "delivery",
      label: "Delivery",
      path: `/admin/restaurant/delivery`,
      icon: Truck,
      description: "Configuración de entrega a domicilio",
    },
    {
      id: "social",
      label: "Redes Sociales",
      path: `/admin/restaurant/social`,
      icon: Globe,
      description: "Enlaces a redes sociales",
    },
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
    <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-220px)]">
      {/* Panel lateral con pasos */}
      <div className="w-full md:w-64 flex-shrink-0">
        <Card className="h-full">
          <CardContent className="p-3 h-full flex flex-col">
            <div className="mb-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Progreso</span>
                <span className="font-medium">{calculateProgress()}%</span>
              </div>
              <Progress value={calculateProgress()} className="h-2" />
            </div>

            <ScrollArea className="flex-1 pr-3">
              <div className="space-y-1">
                {steps.map((step, index) => {
                  const isActive = step.id === currentStep
                  const isCompleted = completedSteps.includes(step.id)

                  return (
                    <Button
                      key={step.id}
                      variant={isActive ? "default" : isCompleted ? "outline" : "ghost"}
                      size="sm"
                      className={cn(
                        "w-full justify-start text-left h-auto py-2",
                        isActive ? "pointer-events-none" : "",
                      )}
                      onClick={() => router.push(step.path)}
                    >
                      <div className="flex items-center w-full">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full mr-2 text-xs font-medium bg-muted">
                          {isCompleted ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : index + 1}
                        </div>
                        <span className="flex-1 text-sm">{step.label}</span>
                      </div>
                    </Button>
                  )
                })}
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
          <CardContent className="p-4 h-full overflow-auto">
            <div className="flex items-center mb-4">
              {currentStepObj?.icon && <currentStepObj.icon className="mr-2 h-5 w-5 text-muted-foreground" />}
              <div>
                <h2 className="text-lg font-medium">{currentStepObj?.label}</h2>
                <p className="text-sm text-muted-foreground">{currentStepObj?.description}</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Aquí va el contenido específico de cada paso */}
              {/* Este contenido lo proporciona la página que usa este componente */}
              <NoBranchSelectedAlert />

              <div className="min-h-[300px]">
                {/* Contenido del paso */}
                {/* Slot para el contenido */}
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button onClick={() => markStepAsCompleted(currentStep)} disabled={!currentBranch} className="ml-auto">
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
