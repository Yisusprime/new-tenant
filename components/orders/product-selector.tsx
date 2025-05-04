"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
// Modificar la importación de Firebase para usar rtdb en lugar de db
import { ref, get } from "firebase/database"
//import { collection, getDocs, query, where } from "firebase/firestore"
import { rtdb } from "@/lib/firebase-config"

// Actualizar la función para obtener productos desde rtdb
export function ProductSelector({ isOpen, onOpenChange, tenantId, onProductSelect, selectedCategoryId = null }) {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      if (!tenantId) return

      try {
        setLoading(true)
        setError(null)

        // Usar rtdb en lugar de Firestore
        const productsRef = ref(rtdb, `tenants/${tenantId}/products`)
        const snapshot = await get(productsRef)
        const productsData = snapshot.val() || {}

        console.log("Productos obtenidos:", productsData)

        const productsArray = Object.keys(productsData).map((key) => ({
          id: key,
          ...productsData[key],
        }))

        setProducts(productsArray)
        setFilteredProducts(productsArray)
        setLoading(false)
      } catch (err) {
        console.error("Error al cargar productos:", err)
        setError("Error al cargar productos")
        setLoading(false)
      }
    }

    if (isOpen && tenantId) {
      fetchProducts()
    }
  }, [isOpen, tenantId, selectedCategoryId])

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(products)
    }
  }, [searchTerm, products])

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="!w-[95vw] !max-w-[95vw] sm:!w-[90vw] sm:!max-w-[90vw] md:!w-[80vw] md:!max-w-[80vw] p-0"
        style={{ width: "95vw", maxWidth: "95vw" }}
      >
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Seleccionar Producto</SheetTitle>
        </SheetHeader>

        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar productos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-grow overflow-auto p-4 h-[calc(100vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">{error}</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No se encontraron productos</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <Button
                  key={product.id}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start text-left"
                  onClick={() => {
                    onProductSelect(product)
                    onOpenChange(false)
                  }}
                >
                  <div className="w-full">
                    <div className="font-medium mb-1">{product.name}</div>
                    <div className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {product.description || "Sin descripción"}
                    </div>
                    <div className="font-bold">${product.price?.toFixed(2) || "0.00"}</div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
