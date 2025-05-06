"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ref, onValue, off } from "firebase/database"
import { rtdb } from "@/lib/firebase-config"
import { useParams } from "next/navigation"

export function StoreStatusBadge() {
  const [isOpen, setIsOpen] = useState(false)
  const params = useParams()
  const tenantId = params?.tenant || ""

  useEffect(() => {
    if (!tenantId) return

    const shiftsRef = ref(rtdb, `tenants/${tenantId}/shifts`)

    const handleShiftsChange = (snapshot: any) => {
      if (snapshot.exists()) {
        const shifts = snapshot.val()
        // Verificar si hay algún turno activo
        const activeShift = Object.values(shifts).some((shift: any) => shift.status === "active")
        setIsOpen(activeShift)
      } else {
        setIsOpen(false)
      }
    }

    onValue(shiftsRef, handleShiftsChange)

    return () => {
      off(shiftsRef, "value", handleShiftsChange)
    }
  }, [tenantId])

  if (!tenantId) return null

  return <Badge variant={isOpen ? "success" : "destructive"}>{isOpen ? "Abierto" : "Cerrado"}</Badge>
}
