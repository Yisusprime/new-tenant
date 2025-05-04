"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import Image from "next/image"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase-config"

export function ProductSelector({ isOpen, onOpenChange, tenantId, onProductSelect, selectedCategoryId = null }) {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsRef = collection(db, `tenants/${tenantId}/products`)
        let productsQuery = productsRef

        if (selectedCategoryId) {
          productsQuery = query(productsRef, where("categoryId", "==", selectedCategoryId))
        }

        const snapshot = await getDocs(productsQuery)
        const productsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setProducts(productsData)
        setFilteredProducts(productsData)
      } catch (error) {
        console.error("Error fetching products:", error)
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
      <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Seleccionar Producto</SheetTitle>
        </SheetHeader>

        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar productos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 mt-4">
          {filteredProducts.map((product) => (
            <Button
              key={product.id}
              variant="outline"
              className="flex items-center justify-start h-auto p-3 text-left"
              onClick={() => {
                onProductSelect(product)
                onOpenChange(false)
              }}
            >
              <div className="flex items-center gap-3 w-full">
                {product.imageUrl && (
                  <div className="flex-shrink-0">
                    <Image
                      src={product.imageUrl || "/placeholder.svg"}
                      alt={product.name}
                      width={50}
                      height={50}
                      className="rounded-md object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">${product.price.toFixed(2)}</p>
                </div>
              </div>
            </Button>
          ))}

          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No se encontraron productos</div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
