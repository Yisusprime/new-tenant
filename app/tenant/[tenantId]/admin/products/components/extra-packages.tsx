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
import { Loader2, Check, Info } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createProductExtra } from "@/lib/services/product-service"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

// Definición de paquetes de extras con URLs externas
const extraPackages = {
  fruits: [
    {
      name: "Manzana",
      price: 10,
      description: "Manzana fresca",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/415/415682.png",
    },
    {
      name: "Plátano",
      price: 8,
      description: "Plátano maduro",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/2909/2909808.png",
    },
    {
      name: "Pera",
      price: 12,
      description: "Pera jugosa",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/590/590772.png",
    },
    {
      name: "Naranja",
      price: 9,
      description: "Naranja dulce",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/415/415733.png",
    },
    {
      name: "Fresa",
      price: 15,
      description: "Fresas frescas",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/590/590685.png",
    },
    {
      name: "Sandía",
      price: 14,
      description: "Sandía refrescante",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/874/874997.png",
    },
    {
      name: "Piña",
      price: 16,
      description: "Piña tropical",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/2909/2909787.png",
    },
    {
      name: "Uvas",
      price: 13,
      description: "Racimo de uvas",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/2909/2909761.png",
    },
    {
      name: "Kiwi",
      price: 11,
      description: "Kiwi verde",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/590/590779.png",
    },
    {
      name: "Mango",
      price: 17,
      description: "Mango dulce",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/2909/2909793.png",
    },
    {
      name: "Cereza",
      price: 18,
      description: "Cerezas frescas",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/590/590774.png",
    },
    {
      name: "Limón",
      price: 7,
      description: "Limón ácido",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/2909/2909841.png",
    },
    {
      name: "Durazno",
      price: 13,
      description: "Durazno jugoso",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/2909/2909803.png",
    },
    {
      name: "Arándano",
      price: 19,
      description: "Arándanos frescos",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/590/590806.png",
    },
    {
      name: "Frambuesa",
      price: 20,
      description: "Frambuesas frescas",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/590/590801.png",
    },
    {
      name: "Coco",
      price: 15,
      description: "Coco tropical",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/2909/2909799.png",
    },
    {
      name: "Melón",
      price: 14,
      description: "Melón dulce",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/2909/2909811.png",
    },
    {
      name: "Granada",
      price: 16,
      description: "Granada roja",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/590/590791.png",
    },
    {
      name: "Higo",
      price: 15,
      description: "Higo maduro",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/2909/2909823.png",
    },
    {
      name: "Maracuyá",
      price: 17,
      description: "Maracuyá tropical",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/2909/2909834.png",
    },
  ],
  toppings: [
    {
      name: "Chocolate",
      price: 12,
      description: "Salsa de chocolate",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/2965/2965567.png",
    },
    {
      name: "Caramelo",
      price: 10,
      description: "Salsa de caramelo",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/2965/2965879.png",
    },
    {
      name: "Crema batida",
      price: 8,
      description: "Crema batida fresca",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/2965/2965853.png",
    },
    {
      name: "Chispas",
      price: 7,
      description: "Chispas de colores",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/2965/2965691.png",
    },
    {
      name: "Nueces",
      price: 14,
      description: "Nueces picadas",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/2965/2965658.png",
    },
    {
      name: "Almendras",
      price: 15,
      description: "Almendras fileteadas",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/2965/2965715.png",
    },
    {
      name: "Coco rallado",
      price: 9,
      description: "Coco rallado",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/2965/2965742.png",
    },
    {
      name: "Galleta",
      price: 11,
      description: "Trozos de galleta",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/2965/2965592.png",
    },
    {
      name: "Miel",
      price: 13,
      description: "Miel natural",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/2965/2965618.png",
    },
    {
      name: "Mermelada",
      price: 12,
      description: "Mermelada de fresa",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/2965/2965633.png",
    },
  ],
  sauces: [
    {
      name: "Ketchup",
      price: 5,
      description: "Salsa de tomate",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/2965/2965760.png",
    },
    {
      name: "Mayonesa",
      price: 5,
      description: "Mayonesa",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/2965/2965775.png",
    },
    {
      name: "Mostaza",
      price: 5,
      description: "Mostaza",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/2965/2965782.png",
    },
    {
      name: "BBQ",
      price: 7,
      description: "Salsa barbacoa",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/2965/2965798.png",
    },
    {
      name: "Ranch",
      price: 8,
      description: "Aderezo ranch",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/2965/2965805.png",
    },
    {
      name: "Salsa picante",
      price: 6,
      description: "Salsa picante",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/2965/2965812.png",
    },
    {
      name: "Salsa de soya",
      price: 7,
      description: "Salsa de soya",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/2965/2965819.png",
    },
    {
      name: "Salsa tártara",
      price: 8,
      description: "Salsa tártara",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/2965/2965826.png",
    },
    {
      name: "Guacamole",
      price: 12,
      description: "Guacamole fresco",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/2965/2965833.png",
    },
    {
      name: "Pesto",
      price: 14,
      description: "Salsa pesto",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/2965/2965840.png",
    },
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
  const [progress, setProgress] = useState(0)
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({})
  const [selectAll, setSelectAll] = useState(false)
  const { toast } = useToast()

  const handleSelectItem = (name: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [name]: !prev[name],
    }))
  }

  const handleSelectAll = () => {
    const newSelectAll = !selectAll
    setSelectAll(newSelectAll)

    const newSelectedItems: Record<string, boolean> = {}
    extraPackages[selectedPackage].forEach((item) => {
      newSelectedItems[item.name] = newSelectAll
    })

    setSelectedItems(newSelectedItems)
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
        setLoading(false)
        return
      }

      // Crear cada extra seleccionado con barra de progreso
      let completed = 0
      for (const extra of selectedExtras) {
        await createProductExtra(tenantId, branchId, {
          name: extra.name,
          price: extra.price,
          description: extra.description,
          imageUrl: extra.imageUrl,
          isActive: true,
        })

        completed++
        setProgress(Math.round((completed / selectedExtras.length) * 100))
      }

      toast({
        title: "Paquete importado",
        description: `Se han importado ${selectedExtras.length} extras correctamente`,
      })

      setOpen(false)
      setSelectedItems({})
      setProgress(0)
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

  const selectedCount = Object.values(selectedItems).filter(Boolean).length
  const totalItems = extraPackages[selectedPackage].length

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" className="gap-2">
        <Info className="h-4 w-4" />
        Importar Paquete de Extras
      </Button>

      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!loading) setOpen(isOpen)
        }}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Importar Paquete de Extras</DialogTitle>
            <DialogDescription>
              Selecciona los extras que deseas importar a tu menú. Puedes elegir entre diferentes categorías.
            </DialogDescription>
          </DialogHeader>

          <Tabs
            defaultValue="fruits"
            value={selectedPackage}
            onValueChange={(v) => {
              setSelectedPackage(v as any)
              setSelectedItems({})
              setSelectAll(false)
            }}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="fruits">Frutas ({extraPackages.fruits.length})</TabsTrigger>
              <TabsTrigger value="toppings">Toppings ({extraPackages.toppings.length})</TabsTrigger>
              <TabsTrigger value="sauces">Salsas ({extraPackages.sauces.length})</TabsTrigger>
            </TabsList>

            <div className="flex items-center justify-between my-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="selectAll" checked={selectAll} onCheckedChange={handleSelectAll} />
                <label htmlFor="selectAll" className="text-sm font-medium cursor-pointer">
                  Seleccionar todos
                </label>
              </div>

              <Badge variant="outline">
                {selectedCount} de {totalItems} seleccionados
              </Badge>
            </div>

            {Object.entries(extraPackages).map(([key, items]) => (
              <TabsContent key={key} value={key} className="mt-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {items.map((item) => (
                    <Card
                      key={item.name}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedItems[item.name] ? "ring-2 ring-primary bg-primary/5" : ""
                      }`}
                      onClick={() => handleSelectItem(item.name)}
                    >
                      <CardHeader className="p-3 pb-0 relative">
                        {selectedItems[item.name] && (
                          <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                        <div className="flex justify-center">
                          <div className="relative w-16 h-16">
                            <Image
                              src={item.imageUrl || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-contain"
                              sizes="64px"
                            />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <h4 className="font-medium text-sm truncate">{item.name}</h4>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{item.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <p className="text-xs text-muted-foreground">${item.price}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {loading && (
            <div className="space-y-2 my-4">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">Importando extras... {progress}%</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleImportPackage} disabled={loading || selectedCount === 0}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Importando..." : `Importar ${selectedCount} extras`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
