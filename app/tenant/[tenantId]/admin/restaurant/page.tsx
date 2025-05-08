"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getRestaurantConfig } from "@/lib/services/restaurant-config-service"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function RestaurantConfigPage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const { toast } = useToast()

  // Definir los pasos de configuración
  const configSteps = [
    { id: "basic", label: "Información Básica", path: `/admin/restaurant/basic` },
    { id: "contact", label: "Contacto", path: `/admin/restaurant/contact` },
    { id: "service", label: "Métodos de Servicio", path: `/admin/restaurant/service` },
    { id: "location", label: "Ubicación", path: `/admin/restaurant/location` },
    { id: "hours", label: "Horarios", path: `/admin/restaurant/hours` },
    { id: "payment", label: "Pagos", path: `/admin/restaurant/payment` },
    { id: "delivery", label: "Delivery", path: `/admin/restaurant/delivery` },
    { id: "social", label: "Redes Sociales", path: `/admin/restaurant/social` },
  ]

  useEffect(() => {
    async function loadConfig() {
      try {
        setLoading(true)

        // Cargar los pasos completados desde localStorage
        const savedCompletedSteps = localStorage.getItem(`${tenantId}_completedConfigSteps`)
        if (savedCompletedSteps) {
          setCompletedSteps(JSON.parse(savedCompletedSteps))
        }

        // Verificar si existe configuración
        const config = await getRestaurantConfig(tenantId)
        if (!config) {
          // Si no hay configuración, redirigir al primer paso
          router.push(configSteps[0].path)
        }
      } catch (error) {
        console.error("Error al cargar configuración:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la información del restaurante",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [tenantId, router, toast])

  const getNextIncompleteStep = () => {
    const nextStep = configSteps.find((step) => !completedSteps.includes(step.id))
    return nextStep || configSteps[0]
  }

  const getCompletionPercentage = () => {
    return Math.round((completedSteps.length / configSteps.length) * 100)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Configuración del Restaurante</h1>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
        <CardHeader>
          <CardTitle>Personaliza tu Restaurante</CardTitle>
          <CardDescription>
            Configura todos los aspectos de tu restaurante para ofrecer la mejor experiencia a tus clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Progreso de configuración</span>
              <span className="text-sm font-medium">{getCompletionPercentage()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-primary h-2.5 rounded-full" style={{ width: `${getCompletionPercentage()}%` }}></div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {configSteps.map((step) => {
              const isCompleted = completedSteps.includes(step.id)

              return (
                <Card
                  key={step.id}
                  className={`relative overflow-hidden ${
                    isCompleted ? "border-green-200 bg-green-50" : "border-gray-200"
                  }`}
                >
                  {isCompleted && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">{step.label}</CardTitle>
                  </CardHeader>
                  <CardFooter className="p-4 pt-0">
                    <Button
                      variant={isCompleted ? "outline" : "default"}
                      size="sm"
                      className="w-full"
                      onClick={() => router.push(step.path)}
                    >
                      {isCompleted ? "Editar" : "Configurar"}
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push(getNextIncompleteStep().path)} className="w-full">
            {completedSteps.length === configSteps.length
              ? "Revisar Configuración"
              : `Continuar con ${getNextIncompleteStep().label}`}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
