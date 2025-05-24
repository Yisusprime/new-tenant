"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, X, Check } from "lucide-react"
import Image from "next/image"
import type { ProductExtra } from "@/lib/services/product-service"

interface ExtrasSelectorProps {
  extras: ProductExtra[]
  selectedExtras: string[]
  onSelectionChange: (selectedIds: string[]) => void
}

export function ExtrasSelector({ extras, selectedExtras, onSelectionChange }: ExtrasSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSelected, setShowSelected] = useState(false)

  // Filtrar extras basado en la búsqueda
  const filteredExtras = useMemo(() => {
    let filtered = extras

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (extra) => extra.name.toLowerCase().includes(query) || extra.description?.toLowerCase().includes(query),
      )
    }

    // Filtrar por seleccionados si está activo
    if (showSelected) {
      filtered = filtered.filter((extra) => selectedExtras.includes(extra.id))
    }

    return filtered
  }, [extras, searchQuery, showSelected, selectedExtras])

  // Manejar selección/deselección de extra
  const handleExtraToggle = (extraId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedExtras, extraId])
    } else {
      onSelectionChange(selectedExtras.filter((id) => id !== extraId))
    }
  }

  // Limpiar selección
  const clearSelection = () => {
    onSelectionChange([])
  }

  // Seleccionar todos los filtrados
  const selectAllFiltered = () => {
    const filteredIds = filteredExtras.map((extra) => extra.id)
    const newSelection = [...new Set([...selectedExtras, ...filteredIds])]
    onSelectionChange(newSelection)
  }

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda y controles */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar extras..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={showSelected ? "default" : "outline"}
            size="sm"
            onClick={() => setShowSelected(!showSelected)}
          >
            {showSelected ? "Ver todos" : "Ver seleccionados"}
            {selectedExtras.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedExtras.length}
              </Badge>
            )}
          </Button>
          {filteredExtras.length > 0 && !showSelected && (
            <Button type="button" variant="outline" size="sm" onClick={selectAllFiltered}>
              Seleccionar todos
            </Button>
          )}
          {selectedExtras.length > 0 && (
            <Button type="button" variant="outline" size="sm" onClick={clearSelection}>
              <X className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>
          {searchQuery || showSelected
            ? `Mostrando ${filteredExtras.length} de ${extras.length} extras`
            : `${extras.length} extras disponibles`}
        </span>
        {selectedExtras.length > 0 && <span>{selectedExtras.length} seleccionados</span>}
      </div>

      {/* Lista de extras */}
      <div className="max-h-96 overflow-y-auto border rounded-lg">
        {filteredExtras.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {searchQuery ? "No se encontraron extras" : "No hay extras para mostrar"}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 p-2">
            {filteredExtras.map((extra) => {
              const isSelected = selectedExtras.includes(extra.id)
              return (
                <Card
                  key={extra.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    isSelected ? "ring-2 ring-primary bg-primary/5" : ""
                  }`}
                  onClick={() => handleExtraToggle(extra.id, !isSelected)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => {}} // Manejado por el click del card
                        className="pointer-events-none"
                      />

                      {/* Imagen del extra */}
                      <div className="relative w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                        {extra.imageUrl ? (
                          <Image
                            src={extra.imageUrl || "/placeholder.svg"}
                            alt={extra.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                            Sin imagen
                          </div>
                        )}
                      </div>

                      {/* Información del extra */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm truncate">{extra.name}</h4>
                          {isSelected && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
                        </div>
                        {extra.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{extra.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            ${extra.price.toFixed(2)}
                          </Badge>
                          {!extra.isActive && (
                            <Badge variant="destructive" className="text-xs">
                              Inactivo
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Resumen de selección */}
      {selectedExtras.length > 0 && (
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="text-sm font-medium mb-2">Extras seleccionados ({selectedExtras.length}):</div>
          <div className="flex flex-wrap gap-1">
            {selectedExtras.slice(0, 10).map((extraId) => {
              const extra = extras.find((e) => e.id === extraId)
              if (!extra) return null
              return (
                <Badge
                  key={extraId}
                  variant="secondary"
                  className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleExtraToggle(extraId, false)
                  }}
                >
                  {extra.name}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )
            })}
            {selectedExtras.length > 10 && (
              <Badge variant="outline" className="text-xs">
                +{selectedExtras.length - 10} más
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
