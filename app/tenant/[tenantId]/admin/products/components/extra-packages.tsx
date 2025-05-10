"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createProductExtra } from "@/lib/services/product-service"
import Image from "next/image"

// Definición de paquetes de extras
const extraPackages = {
  fruits: [
    { name: "Manzana", price: 10, description: "Manzana fresca", imageUrl: "/icons/apple.png" },
    { name: "Plátano", price: 8, description: "Plátano maduro", imageUrl: "/icons/banana.png" },
    { name: "Pera", price: 12, description: "Pera jugosa", imageUrl: "/icons/pear.png" },
    { name: "Naranja", price: 9, description: "Naranja dulce", imageUrl: "/icons/orange.png" },
    { name: "Fresa", price: 15, description: "Fresas frescas", imageUrl: "/icons/strawberry.png" },
  ],
  toppings: [
    { name: "Chocolate", price: 12, description: "Salsa de chocolate", imageUrl: "/icons/chocolate.png" },
    { name: "Caramelo", price: 10, description: "Salsa de caramelo", imageUrl: "/icons/caramel.png" },
    { name: "Crema batida", price: 8, description: "Crema batida fresca", imageUrl: "/icons/whipped-cream.png" },
    { name: "Chispas", price: 7, description: "Chispas de colores", imageUrl: "/icons/sprinkles.png" },
  ],
  sauces: [
    { name: "Ketchup", price: 5, description: "Salsa de tomate", imageUrl: "/icons/ketchup.png" },
    { name: "Mayonesa", price: 5, description: "Mayonesa", imageUrl: "/icons/mayonnaise.png" },
    { name: "Mostaza", price: 5, description: "Mostaza", imageUrl: "/icons/mustard.png" },
    { name: "BBQ", price: 7, description: "Salsa barbacoa", imageUrl: "/icons/bbq-sauce.png" },
  ],
}

interface ExtraPackagesProps {
  tenantId: string
  branchId: string
  onComplete: () => void
}

export function ExtraPackages({ tenantId, branchId, onComplete }: ExtraPackagesProps) {
  const [open, setOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<"fruits" | "toppings" | "sauces">("fruits")
  const [loading, setLoading] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  const handleSelectItem = (name: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [name]: !prev[name],
    }))
  }

  const handleImportPackage = async () => {
    try {
      setLoading(true)
      const selectedExtras = extraPackages[selectedPackage].filter((item) => selectedItems[item.name])

      if (selectedExtras.length === 0) {
        toast({
          title: "Selección vacía",
          description: "Por favor, selecciona al menos un extra para importar",
          variant: "destructive",
        })
        return
      }

      // Crear cada extra seleccionado
      for (const extra of selectedExtras) {
        await createProductExtra(tenantId, branchId, {
          name: extra.name,
          price: extra.price,
          description: extra.description,
          imageUrl: extra.imageUrl,
          isActive: true,
        })
      }

      toast({
        title: "Paquete importado",
        description: `Se han importado ${selectedExtras.length} extras correctamente`,
      })

      setOpen(false)
      setSelectedItems({})
      onComplete()
    } catch (error) {
      console.error("Error al importar paquete:", error)
      toast({
        title: "Error",
        description: "No se pudo importar el paquete de extras",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline">
        Importar Paquete de Extras
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Importar Paquete de Extras</DialogTitle>
            <DialogDescription>Selecciona un paquete predefinido de extras para importar a tu menú.</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="fruits" value={selectedPackage} onValueChange={(v) => setSelectedPackage(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="fruits">Frutas</TabsTrigger>
              <TabsTrigger value="toppings">Toppings</TabsTrigger>
              <TabsTrigger value="sauces">Salsas</TabsTrigger>
            </TabsList>

            {Object.entries(extraPackages).map(([key, items]) => (
              <TabsContent key={key} value={key} className="mt-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {items.map((item) => (
                    <Card
                      key={item.name}
                      className={`cursor-pointer transition-all ${
                        selectedItems[item.name] ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => handleSelectItem(item.name)}
                    >
                      <CardHeader className="p-3 pb-0">
                        <div className="flex justify-center">
                          <div className="relative w-12 h-12">
                            <Image
                              src={item.imageUrl || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-contain"
                              sizes="48px"
                            />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 text-center">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">${item.price}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleImportPackage} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Importar Seleccionados
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
