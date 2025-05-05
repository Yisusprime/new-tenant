"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ref, onValue, off } from "firebase/database"
import { rtdb } from "@/lib/firebase-config"

interface StoreStatusBadgeProps {
  tenantId: string
}

export function StoreStatusBadge({ tenantId }: StoreStatusBadgeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tenantId) return

    const shiftsRef = ref(rtdb, `tenants/${tenantId}/shifts`)

    const handleShiftsUpdate = (snapshot: any) => {
      const shiftsData = snapshot.val() || {}

      // Buscar si hay algún turno activo
      const hasActiveShift = Object.values(shiftsData).some((shift: any) => shift.status === "active")

      setIsOpen(hasActiveShift)
      setLoading(false)
    }

    // Establecer el listener
    onValue(shiftsRef, handleShiftsUpdate)

    // Limpiar el listener cuando el componente se desmonte
    return () => {
      off(shiftsRef)
    }
  }, [tenantId])

  if (loading) {
    return <Badge variant="outline">Cargando...</Badge>
  }

  return <Badge variant={isOpen ? "success" : "destructive"}>{isOpen ? "Abierto" : "Cerrado"}</Badge>
}
