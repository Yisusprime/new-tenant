"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Search, Edit, Trash2, Star, StarOff, CheckCircle, XCircle } from "lucide-react"
import { productService } from "@/lib/services/product-service"
import { categoryService } from "@/lib/services/category-service"
import { useBranch } from "@/lib/hooks/use-branch"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"
import type { Product } from "@/lib/types/products"

export default function ProductsPage() {
  const { tenantId } = useParams<{ tenantId: string }>()
  const router = useRouter()
  const { selectedBranch } = useBranch()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [availabilityFilter, setAvailabilityFilter] = useState("all")

  useEffect(() => {
    if (!selectedBranch) return

    const fetchData = async () => {
      try {
        setLoading(true)
        const [productsData, categoriesData] = await Promise.all([
          productService.getProducts(tenantId, selectedBranch.id),
          categoryService.getCategories(tenantId, selectedBranch.id),
        ])

        setProducts(productsData)
        setCategories(categoriesData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [tenantId, selectedBranch])

  const handleCreateProduct = () => {
    router.push(`/tenant/${tenantId}/admin/products/create`)
  }

  const handleEditProduct = (productId: string) => {
    router.push(`/tenant/${tenantId}/admin/products/${productId}`)
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!selectedBranch) return

    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await productService.deleteProduct(tenantId, selectedBranch.id, productId)
        setProducts(products.filter((product) => product.id !== productId))
      } catch (error) {
        console.error("Error deleting product:", error)
      }
    }
  }

  const handleToggleFeatured = async (product: Product) => {
    if (!selectedBranch) return

    try {
      const updatedProduct = await productService.updateProduct(tenantId, selectedBranch.id, product.id, {
        featured: !product.featured,
      })

      setProducts(products.map((p) => (p.id === product.id ? updatedProduct : p)))
    } catch (error) {
      console.error("Error updating product:", error)
    }
  }

  const handleToggleAvailability = async (product: Product) => {
    if (!selectedBranch) return

    try {
      const updatedProduct = await productService.updateProduct(tenantId, selectedBranch.id, product.id, {
        available: !product.available,
      })

      setProducts(products.map((p) => (p.id === product.id ? updatedProduct : p)))
    } catch (error) {
      console.error("Error updating product:", error)
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description || "").toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || product.categoryId === categoryFilter

    const matchesAvailability =
      availabilityFilter === "all" ||
      (availabilityFilter === "available" && product.available) ||
      (availabilityFilter === "unavailable" && !product.available)

    return matchesSearch && matchesCategory && matchesAvailability
  })

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId)
    return category ? category.name : "Unknown Category"
  }

  if (!selectedBranch) {
    return <NoBranchSelectedAlert />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={handleCreateProduct}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    Loading products...
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl || "/placeholder.svg"}
                            alt={product.name}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                        )}
                        <div>
                          <div>{product.name}</div>
                          {product.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                    <TableCell className="text-right">
                      <div>
                        {product.discountedPrice ? (
                          <>
                            <span className="line-through text-muted-foreground mr-2">${product.price.toFixed(2)}</span>
                            <span className="font-bold text-green-600">${product.discountedPrice.toFixed(2)}</span>
                          </>
                        ) : (
                          <span>${product.price.toFixed(2)}</span>
                        )}
                      </div>
                      {product.extras && product.extras.length > 0 && (
                        <Badge variant="outline" className="mt-1">
                          {product.extras.length} extras
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleAvailability(product)}
                        className={product.available ? "text-green-600" : "text-red-600"}
                      >
                        {product.available ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleFeatured(product)}
                        className={product.featured ? "text-yellow-500" : "text-muted-foreground"}
                      >
                        {product.featured ? (
                          <Star className="h-5 w-5 fill-yellow-500" />
                        ) : (
                          <StarOff className="h-5 w-5" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
