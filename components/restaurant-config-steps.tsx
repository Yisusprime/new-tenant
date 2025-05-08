"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Store, User, Truck, MapPin, Clock, CreditCard, Globe, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Step {
  id: string
  label: string
  path: string
  icon: React.ElementType
}

export function RestaurantConfigSteps({ tenantId, currentStep }: { tenantId: string; currentStep: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  // Definir los pasos de configuración
  const steps: Step[] = [
    { id: "basic", label: "Información Básica", path: `/admin/restaurant/basic`, icon: Store },
    { id: "contact", label: "Contacto", path: `/admin/restaurant/contact`, icon: User },
    { id: "service", label: "Métodos de Servicio", path: `/admin/restaurant/service`, icon: Truck },
    { id: "location", label: "Ubicación", path: `/admin/restaurant/location`, icon: MapPin },
    { id: "hours", label: "Horarios", path: `/admin/restaurant/hours`, icon: Clock },
    { id: "payment", label: "Pagos", path: `/admin/restaurant/payment`, icon: CreditCard },
    { id: "delivery", label: "Delivery", path: `/admin/restaurant/delivery`, icon: Truck },
    { id: "social", label: "Redes Sociales", path: `/admin/restaurant/social`, icon: Globe },
  ]

  // Cargar los pasos completados desde localStorage
  useEffect(() => {
    const savedCompletedSteps = localStorage.getItem(`${tenantId}_completedConfigSteps`)
    if (savedCompletedSteps) {
      setCompletedSteps(JSON.parse(savedCompletedSteps))
    }
  }, [tenantId])

  // Función para marcar un paso como completado
  const markStepAsCompleted = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      const newCompletedSteps = [...completedSteps, stepId]
      setCompletedSteps(newCompletedSteps)
      localStorage.setItem(`${tenantId}_completedConfigSteps`, JSON.stringify(newCompletedSteps))
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

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex flex-wrap gap-2 justify-center">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep
            const isCompleted = completedSteps.includes(step.id)

            return (
              <Link
                key={step.id}
                href={step.path}
                className={cn(
                  "flex flex-col items-center p-2 rounded-md transition-colors relative min-w-[100px]",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isCompleted
                      ? "bg-green-50 text-green-700 hover:bg-green-100"
                      : "bg-gray-50 hover:bg-gray-100",
                )}
              >
                {isCompleted && <CheckCircle2 className="absolute top-1 right-1 h-4 w-4 text-green-500" />}
                <step.icon className={cn("h-6 w-6 mb-1", isActive ? "text-primary-foreground" : "")} />
                <span className="text-xs text-center">{step.label}</span>
                <span className="text-xs mt-1">
                  {index + 1}/{steps.length}
                </span>
              </Link>
            )
          })}
        </div>
      </Card>

      {/* Botones de navegación */}
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={goToPreviousStep} disabled={currentStep === steps[0].id}>
          Anterior
        </Button>
        <Button
          onClick={() => {
            markStepAsCompleted(currentStep)
            goToNextStep()
          }}
          disabled={currentStep === steps[steps.length - 1].id}
        >
          Siguiente
        </Button>
      </div>
    </div>
  )
}
