import { Loader2 } from "lucide-react"

export default function RestaurantLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
      <span className="ml-2">Cargando configuración del restaurante...</span>
    </div>
  )
}
