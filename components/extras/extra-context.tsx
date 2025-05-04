"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { ref, onValue, push, set, remove, update } from "firebase/database"
import { rtdb } from "@/lib/firebase-config"
import { useToast } from "@/components/ui/use-toast"

export type Extra = {
  id: string
  name: string
  description?: string
  price: number
  imageUrl?: string
  available: boolean
}

type ExtraContextType = {
  extras: Extra[]
  loading: boolean
  addExtra: (extra: Omit<Extra, "id">) => Promise<void>
  updateExtra: (id: string, extra: Partial<Omit<Extra, "id">>) => Promise<void>
  deleteExtra: (id: string) => Promise<void>
  selectedExtra: Extra | null
  setSelectedExtra: (extra: Extra | null) => void
  tenantId: string
}

const ExtraContext = createContext<ExtraContextType | undefined>(undefined)

export const useExtras = () => {
  const context = useContext(ExtraContext)
  if (!context) {
    throw new Error("useExtras must be used within an ExtraProvider")
  }
  return context
}

export const ExtraProvider: React.FC<{ children: React.ReactNode; tenantId: string }> = ({ children, tenantId }) => {
  const [extras, setExtras] = useState<Extra[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedExtra, setSelectedExtra] = useState<Extra | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!tenantId) return

    const extrasRef = ref(rtdb, `tenants/${tenantId}/extras`)

    const unsubscribe = onValue(
      extrasRef,
      (snapshot) => {
        const data = snapshot.val()
        const extrasArray: Extra[] = []

        if (data) {
          Object.keys(data).forEach((key) => {
            const extra = {
              id: key,
              name: data[key].name,
              description: data[key].description || "",
              price: data[key].price || 0,
              imageUrl: data[key].imageUrl || "",
              available: data[key].available !== false, // Por defecto true
            }
            extrasArray.push(extra)
          })
        }

        setExtras(extrasArray)
        setLoading(false)
      },
      (error) => {
        console.error("Error al cargar extras:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los extras",
          variant: "destructive",
        })
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [tenantId, toast])

  const addExtra = async (extra: Omit<Extra, "id">) => {
    try {
      const newExtraRef = push(ref(rtdb, `tenants/${tenantId}/extras`))
      await set(newExtraRef, extra)
      toast({
        title: "Extra añadido",
        description: "El extra se ha añadido correctamente",
      })
    } catch (error) {
      console.error("Error al añadir extra:", error)
      toast({
        title: "Error",
        description: "No se pudo añadir el extra",
        variant: "destructive",
      })
    }
  }

  const updateExtra = async (id: string, extra: Partial<Omit<Extra, "id">>) => {
    try {
      const extraRef = ref(rtdb, `tenants/${tenantId}/extras/${id}`)
      await update(extraRef, extra)
      toast({
        title: "Extra actualizado",
        description: "El extra se ha actualizado correctamente",
      })
    } catch (error) {
      console.error("Error al actualizar extra:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el extra",
        variant: "destructive",
      })
    }
  }

  const deleteExtra = async (id: string) => {
    try {
      const extraRef = ref(rtdb, `tenants/${tenantId}/extras/${id}`)
      await remove(extraRef)
      toast({
        title: "Extra eliminado",
        description: "El extra se ha eliminado correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar extra:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el extra",
        variant: "destructive",
      })
    }
  }

  return (
    <ExtraContext.Provider
      value={{
        extras,
        loading,
        addExtra,
        updateExtra,
        deleteExtra,
        selectedExtra,
        setSelectedExtra,
        tenantId,
      }}
    >
      {children}
    </ExtraContext.Provider>
  )
}
