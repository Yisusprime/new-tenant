"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useBranch } from "@/lib/context/branch-context"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"
import { useToast } from "@/components/ui/use-toast"

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
    <div className="space-y-6">
      {/* Mostrar alerta si no hay sucursal seleccionada */}
      <NoBranchSelectedAlert />

      {currentBranch && (
        <>
          {/* Tarjeta de progreso */}
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                {currentStepObj?.icon && <currentStepObj.icon className="mr-2 h-5 w-5" />}
                {currentStepObj?.label}
              </CardTitle>
              <CardDescription>{currentStepObj?.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>
                  Paso {currentIndex + 1} de {steps.length}
                </span>
                <span>{calculateProgress()}% completado</span>
              </div>
              <Progress value={calculateProgress()} className="h-2" />
            </CardContent>
          </Card>

          {/* Navegación de pasos */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep
              const isCompleted = completedSteps.includes(step.id)

              return (
                <Button
                  key={step.id}
                  variant={isActive ? "default" : isCompleted ? "outline" : "ghost"}
                  size="sm"
                  className={cn("flex items-center gap-1 relative", isActive ? "pointer-events-none" : "")}
                  onClick={() => router.push(step.path)}
                >
                  {isCompleted && !isActive && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                  <step.icon className="h-4 w-4" />
                  <span className="hidden md:inline">{step.label}</span>
                  <span className="inline md:hidden">{index + 1}</span>
                </Button>
              )
            })}
          </div>
        </>
      )}

      {/* Contenido del paso actual */}
      <div className="bg-card rounded-lg border p-6 shadow-sm">
        {/* Aquí va el contenido específico de cada paso */}
        {/* Este contenido lo proporciona la página que usa este componente */}
        <div className="min-h-[300px]">{/* Contenido del paso */}</div>
      </div>

      {/* Botones de navegación */}
      <CardFooter className="flex justify-between pt-6 px-0">
        <Button variant="outline" onClick={goToPreviousStep} disabled={currentStep === steps[0].id || !currentBranch}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>

        <div className="flex gap-2">
          <Button variant="default" onClick={() => markStepAsCompleted(currentStep)} disabled={!currentBranch}>
            <Save className="mr-2 h-4 w-4" />
            Guardar
          </Button>

          <Button
            variant="default"
            onClick={() => {
              markStepAsCompleted(currentStep)
              goToNextStep()
            }}
            disabled={currentStep === steps[steps.length - 1].id || !currentBranch}
          >
            Siguiente
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </div>
  )
}
