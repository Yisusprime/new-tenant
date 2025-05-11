"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useBranch } from "@/lib/context/branch-context"
import { createCategory } from "@/lib/services/category-service"
import { createProduct } from "@/lib/services/product-service"
import { Database, ShoppingBag, Check, Loader2 } from "lucide-react"

// Datos de muestra para categorías
const sampleCategories = [
  {
    name: "Platos Principales",
    description: "Nuestros platos principales más populares",
    imageUrl: "https://img.icons8.com/color/96/000000/dinner.png",
    order: 1,
    isActive: true,
  },
  {
    name: "Bebidas",
    description: "Refrescantes bebidas para acompañar tu comida",
    imageUrl: "https://img.icons8.com/color/96/000000/cocktail.png",
    order: 2,
    isActive: true,
  },
  {
    name: "Postres",
    description: "Deliciosos postres para terminar tu comida",
    imageUrl: "https://img.icons8.com/color/96/000000/cake.png",
    order: 3,
    isActive: true,
  },
]

// Datos de muestra para productos
const sampleProducts = [
  // Platos Principales
  {
    name: "Hamburguesa Clásica",
    description: "Deliciosa hamburguesa con carne de res, lechuga, tomate, cebolla y queso cheddar",
    price: 8.99,
    categoryName: "Platos Principales",
    imageUrl: "https://img.icons8.com/color/96/000000/hamburger.png",
    isActive: true,
    isFeatured: true,
  },
  {
    name: "Pizza Margarita",
    description: "Pizza tradicional con salsa de tomate, mozzarella fresca y albahaca",
    price: 10.99,
    categoryName: "Platos Principales",
    imageUrl: "https://img.icons8.com/color/96/000000/pizza.png",
    isActive: true,
    isFeatured: true,
  },
  {
    name: "Ensalada César",
    description: "Lechuga romana, crutones, queso parmesano y aderezo césar",
    price: 7.5,
    categoryName: "Platos Principales",
    imageUrl: "https://img.icons8.com/color/96/000000/salad.png",
    isActive: true,
    isFeatured: false,
  },
  {
    name: "Pasta Carbonara",
    description: "Espaguetis con salsa cremosa, panceta, huevo y queso parmesano",
    price: 9.99,
    categoryName: "Platos Principales",
    imageUrl: "https://img.icons8.com/color/96/000000/spaghetti.png",
    isActive: true,
    isFeatured: false,
  },
  {
    name: "Tacos de Pollo",
    description: "Tres tacos de pollo con guacamole, pico de gallo y crema agria",
    price: 8.5,
    categoryName: "Platos Principales",
    imageUrl: "https://img.icons8.com/color/96/000000/taco.png",
    isActive: true,
    isFeatured: true,
  },
  {
    name: "Sándwich Club",
    description: "Triple sándwich con pollo, tocino, lechuga, tomate y mayonesa",
    price: 7.99,
    categoryName: "Platos Principales",
    imageUrl: "https://img.icons8.com/color/96/000000/sandwich.png",
    isActive: true,
    isFeatured: false,
  },
  {
    name: "Burrito de Carne",
    description: "Burrito grande con carne de res, frijoles, arroz, queso y pico de gallo",
    price: 9.5,
    categoryName: "Platos Principales",
    imageUrl: "https://img.icons8.com/color/96/000000/burrito.png",
    isActive: true,
    isFeatured: false,
  },
  {
    name: "Pollo a la Parrilla",
    description: "Pechuga de pollo a la parrilla con verduras asadas y puré de papas",
    price: 11.99,
    categoryName: "Platos Principales",
    imageUrl: "https://img.icons8.com/color/96/000000/chicken.png",
    isActive: true,
    isFeatured: true,
  },

  // Bebidas
  {
    name: "Refresco de Cola",
    description: "Refresco de cola clásico, frío y refrescante",
    price: 2.5,
    categoryName: "Bebidas",
    imageUrl: "https://img.icons8.com/color/96/000000/cola.png",
    isActive: true,
    isFeatured: false,
  },
  {
    name: "Limonada Casera",
    description: "Limonada fresca hecha con limones recién exprimidos y azúcar",
    price: 3.5,
    categoryName: "Bebidas",
    imageUrl: "https://img.icons8.com/color/96/000000/lemonade.png",
    isActive: true,
    isFeatured: true,
  },
  {
    name: "Café Americano",
    description: "Café recién hecho, fuerte y aromático",
    price: 2.99,
    categoryName: "Bebidas",
    imageUrl: "https://img.icons8.com/color/96/000000/coffee.png",
    isActive: true,
    isFeatured: false,
  },
  {
    name: "Té Helado",
    description: "Té negro helado con limón y menta",
    price: 2.75,
    categoryName: "Bebidas",
    imageUrl: "https://img.icons8.com/color/96/000000/iced-tea.png",
    isActive: true,
    isFeatured: false,
  },
  {
    name: "Batido de Fresa",
    description: "Batido cremoso de fresas frescas con leche y helado de vainilla",
    price: 4.99,
    categoryName: "Bebidas",
    imageUrl: "https://img.icons8.com/color/96/000000/milkshake.png",
    isActive: true,
    isFeatured: true,
  },
  {
    name: "Agua Mineral",
    description: "Agua mineral con o sin gas",
    price: 1.99,
    categoryName: "Bebidas",
    imageUrl: "https://img.icons8.com/color/96/000000/water.png",
    isActive: true,
    isFeatured: false,
  },

  // Postres
  {
    name: "Tarta de Chocolate",
    description: "Deliciosa tarta de chocolate con ganache y frutos rojos",
    price: 5.99,
    categoryName: "Postres",
    imageUrl: "https://img.icons8.com/color/96/000000/chocolate-cake.png",
    isActive: true,
    isFeatured: true,
  },
  {
    name: "Helado de Vainilla",
    description: "Cremoso helado de vainilla con sirope de chocolate",
    price: 3.99,
    categoryName: "Postres",
    imageUrl: "https://img.icons8.com/color/96/000000/ice-cream-cone.png",
    isActive: true,
    isFeatured: false,
  },
  {
    name: "Cheesecake",
    description: "Cheesecake cremoso con base de galleta y cobertura de frutos rojos",
    price: 5.5,
    categoryName: "Postres",
    imageUrl: "https://img.icons8.com/color/96/000000/cheesecake.png",
    isActive: true,
    isFeatured: true,
  },
  {
    name: "Brownie con Helado",
    description: "Brownie caliente de chocolate con helado de vainilla y nueces",
    price: 6.5,
    categoryName: "Postres",
    imageUrl: "https://img.icons8.com/color/96/000000/brownie.png",
    isActive: true,
    isFeatured: false,
  },
  {
    name: "Flan de Caramelo",
    description: "Flan casero con salsa de caramelo",
    price: 4.5,
    categoryName: "Postres",
    imageUrl: "https://img.icons8.com/color/96/000000/creme-caramel.png",
    isActive: true,
    isFeatured: false,
  },
  {
    name: "Tiramisú",
    description: "Postre italiano clásico con café, mascarpone y cacao",
    price: 5.99,
    categoryName: "Postres",
    imageUrl: "https://img.icons8.com/color/96/000000/tiramisu.png",
    isActive: true,
    isFeatured: true,
  },
]

export function SampleDataImporter({ tenantId }: { tenantId: string }) {
  const { currentBranch } = useBranch()
  const { toast } = useToast()
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(sampleCategories.map((cat) => cat.name))
  const [importedData, setImportedData] = useState<{
    categories: number
    products: number
  }>({ categories: 0, products: 0 })

  const toggleCategory = (categoryName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName) ? prev.filter((cat) => cat !== categoryName) : [...prev, categoryName],
    )
  }

  const selectAllCategories = () => {
    setSelectedCategories(sampleCategories.map((cat) => cat.name))
  }

  const deselectAllCategories = () => {
    setSelectedCategories([])
  }

  const getProductCountForCategory = (categoryName: string) => {
    return sampleProducts.filter((product) => product.categoryName === categoryName).length
  }

  const importSampleData = async () => {
    if (!currentBranch) {
      toast({
        title: "Error",
        description: "Por favor, selecciona una sucursal primero",
        variant: "destructive",
      })
      return
    }

    if (selectedCategories.length === 0) {
      toast({
        title: "Error",
        description: "Por favor, selecciona al menos una categoría",
        variant: "destructive",
      })
      return
    }

    try {
      setImporting(true)
      setProgress(0)

      // Filtrar categorías seleccionadas
      const categoriesToImport = sampleCategories.filter((cat) => selectedCategories.includes(cat.name))

      // Crear un mapa para almacenar los IDs de las categorías creadas
      const categoryMap = new Map<string, string>()

      // Importar categorías
      let importedCategoriesCount = 0
      for (const category of categoriesToImport) {
        const newCategory = await createCategory(tenantId, currentBranch.id, {
          name: category.name,
          description: category.description,
          imageUrl: category.imageUrl,
          order: category.order,
          isActive: category.isActive,
        })

        categoryMap.set(category.name, newCategory.id)
        importedCategoriesCount++

        // Actualizar progreso
        setProgress(
          Math.floor(
            (importedCategoriesCount /
              (categoriesToImport.length +
                sampleProducts.filter((p) => selectedCategories.includes(p.categoryName)).length)) *
              100,
          ),
        )
      }

      // Filtrar productos por categorías seleccionadas
      const productsToImport = sampleProducts.filter((product) => selectedCategories.includes(product.categoryName))

      // Importar productos
      let importedProductsCount = 0
      for (const product of productsToImport) {
        const categoryId = categoryMap.get(product.categoryName)

        if (categoryId) {
          await createProduct(tenantId, currentBranch.id, {
            name: product.name,
            description: product.description,
            price: product.price,
            categoryId: categoryId,
            imageUrl: product.imageUrl,
            isActive: product.isActive,
            isFeatured: product.isFeatured,
          })

          importedProductsCount++

          // Actualizar progreso
          setProgress(
            Math.floor(
              ((importedCategoriesCount + importedProductsCount) /
                (categoriesToImport.length + productsToImport.length)) *
                100,
            ),
          )
        }
      }

      setImportedData({
        categories: importedCategoriesCount,
        products: importedProductsCount,
      })

      toast({
        title: "Datos importados correctamente",
        description: `Se han importado ${importedCategoriesCount} categorías y ${importedProductsCount} productos.`,
      })
    } catch (error) {
      console.error("Error al importar datos de muestra:", error)
      toast({
        title: "Error",
        description: "Ha ocurrido un error al importar los datos de muestra",
        variant: "destructive",
      })
    } finally {
      setImporting(false)
      setProgress(100)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Importar Datos de Muestra
        </CardTitle>
        <CardDescription>Importa categorías y productos de muestra para probar tu tienda</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Selecciona las categorías a importar:</h3>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={selectAllCategories} disabled={importing}>
                Seleccionar todo
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAllCategories} disabled={importing}>
                Deseleccionar todo
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sampleCategories.map((category) => (
              <div key={category.name} className="flex items-start space-x-3 border rounded-md p-3">
                <Checkbox
                  id={`category-${category.name}`}
                  checked={selectedCategories.includes(category.name)}
                  onCheckedChange={() => toggleCategory(category.name)}
                  disabled={importing}
                />
                <div className="grid gap-1.5">
                  <Label htmlFor={`category-${category.name}`} className="font-medium">
                    {category.name}
                  </Label>
                  <div className="flex items-center gap-2">
                    <img src={category.imageUrl || "/placeholder.svg"} alt={category.name} className="w-8 h-8" />
                    <Badge variant="outline">{getProductCountForCategory(category.name)} productos</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {importing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Importando datos...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {importedData.categories > 0 && !importing && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 text-green-800">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <span className="font-medium">Importación completada</span>
              </div>
              <p className="text-sm mt-1">
                Se han importado {importedData.categories} categorías y {importedData.products} productos.
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={importSampleData} disabled={importing || selectedCategories.length === 0} className="w-full">
          {importing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importando...
            </>
          ) : (
            <>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Importar Datos de Muestra
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
