"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCategories } from "@/lib/services/category-service"
import { Loader2 } from "lucide-react"

interface DesktopCategoryMenuProps {
  activeCategory: string | null
  onCategoryChange: (categoryId: string) => void
}

// Obtener el tenantId y branchId del contexto global o de props
export function DesktopCategoryMenu({ activeCategory, onCategoryChange }: DesktopCategoryMenuProps) {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Obtener tenantId y branchId de la URL
  const [tenantId, setTenantId] = useState<string>("")
  const [branchId, setBranchId] = useState<string | null>(null)

  useEffect(() => {
    // Extraer tenantId de la URL
    const pathParts = window.location.pathname.split("/")
    const tenantIdIndex = pathParts.findIndex((part) => part === "tenant") + 1
    if (tenantIdIndex > 0 && tenantIdIndex < pathParts.length) {
      setTenantId(pathParts[tenantIdIndex])
    }

    // Obtener branchId de localStorage o de alguna otra fuente
    // Por ahora, usaremos un enfoque simplificado
    const fetchBranchId = async () => {
      try {
        // Aquí normalmente obtendrías el branchId de alguna fuente
        // Por ahora, usaremos localStorage como ejemplo
        const storedBranchId = localStorage.getItem("currentBranchId")
        if (storedBranchId) {
          setBranchId(storedBranchId)
        } else {
          // Si no hay branchId en localStorage, intentamos obtenerlo de otra manera
          // Por ejemplo, obteniendo la primera sucursal activa
          // Esto es solo un placeholder, deberías implementar tu propia lógica
          setBranchId(null)
        }
      } catch (error) {
        console.error("Error al obtener branchId:", error)
        setBranchId(null)
      }
    }

    fetchBranchId()
  }, [])

  useEffect(() => {
    async function loadCategories() {
      if (!tenantId || !branchId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const categoriesData = await getCategories(tenantId, branchId)
        // Filtrar solo categorías activas
        const activeCategories = categoriesData.filter((cat) => cat.isActive)
        setCategories(activeCategories)

        // Si no hay categoría activa y hay categorías disponibles, seleccionar la primera
        if (!activeCategory && activeCategories.length > 0) {
          onCategoryChange(activeCategories[0].id)
        }

        setError(null)
      } catch (err) {
        console.error("Error al cargar categorías:", err)
        setError("Error al cargar categorías")
      } finally {
        setLoading(false)
      }
    }

    if (tenantId && branchId) {
      loadCategories()
    }
  }, [tenantId, branchId, activeCategory, onCategoryChange])

  if (loading) {
    return (
      <div className="bg-white p-2 rounded-md shadow-sm flex justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    )
  }

  if (error || categories.length === 0) {
    return null
  }

  return (
    <div className="bg-white p-2 rounded-md shadow-sm">
      <Tabs value={activeCategory || categories[0]?.id} onValueChange={onCategoryChange} className="w-full">
        <TabsList className="h-auto p-1 w-full flex justify-center">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="px-4 py-2">
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
