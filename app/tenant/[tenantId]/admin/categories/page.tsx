"use client"

import { useState, useEffect } from "react"
import { useBranch } from "@/lib/context/branch-context"
import { getParentCategories, getSubcategories, type Category } from "@/lib/services/category-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Plus, FolderTree, Tag } from "lucide-react"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"
import { CategoryList } from "./components/category-list"
import { CategoryForm } from "./components/category-form"

export default function CategoriesPage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  const { currentBranch, loading: branchLoading } = useBranch()
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Record<string, Category[]>>({})
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [parentCategoryId, setParentCategoryId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("categories")

  // Load categories when branch changes
  useEffect(() => {
    async function loadCategories() {
      if (!currentBranch) {
        setCategories([])
        setSubcategories({})
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const parentCats = await getParentCategories(tenantId, currentBranch.id)
        setCategories(parentCats)

        // Load subcategories for each parent category
        const subCats: Record<string, Category[]> = {}
        for (const cat of parentCats) {
          const subs = await getSubcategories(tenantId, currentBranch.id, cat.id)
          if (subs.length > 0) {
            subCats[cat.id] = subs
          }
        }
        setSubcategories(subCats)
      } catch (error) {
        console.error("Error loading categories:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [tenantId, currentBranch])

  const handleAddCategory = () => {
    setEditingCategory(null)
    setParentCategoryId(null)
    setIsFormOpen(true)
  }

  const handleAddSubcategory = (parentId: string) => {
    setEditingCategory(null)
    setParentCategoryId(parentId)
    setIsFormOpen(true)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setParentCategoryId(category.parentId || null)
    setIsFormOpen(true)
  }

  const handleCategoryCreated = (newCategory: Category) => {
    if (newCategory.parentId) {
      // It's a subcategory
      setSubcategories((prev) => ({
        ...prev,
        [newCategory.parentId!]: [...(prev[newCategory.parentId!] || []), newCategory].sort(
          (a, b) => a.order - b.order,
        ),
      }))
    } else {
      // It's a parent category
      setCategories((prev) => [...prev, newCategory].sort((a, b) => a.order - b.order))
    }
    setIsFormOpen(false)
  }

  const handleCategoryUpdated = (updatedCategory: Category) => {
    if (updatedCategory.parentId) {
      // It's a subcategory
      setSubcategories((prev) => ({
        ...prev,
        [updatedCategory.parentId!]: prev[updatedCategory.parentId!]
          .map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat))
          .sort((a, b) => a.order - b.order),
      }))
    } else {
      // It's a parent category
      setCategories((prev) =>
        prev.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat)).sort((a, b) => a.order - b.order),
      )
    }
    setIsFormOpen(false)
  }

  const handleCategoryDeleted = (categoryId: string, parentId?: string) => {
    if (parentId) {
      // It's a subcategory
      setSubcategories((prev) => ({
        ...prev,
        [parentId]: prev[parentId].filter((cat) => cat.id !== categoryId),
      }))
    } else {
      // It's a parent category
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId))
      // Also remove any subcategories
      setSubcategories((prev) => {
        const newSubcategories = { ...prev }
        delete newSubcategories[categoryId]
        return newSubcategories
      })
    }
  }

  if (branchLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Categorías</h1>
        {currentBranch && (
          <Button onClick={handleAddCategory}>
            <Plus className="mr-2 h-4 w-4" /> Nueva Categoría
          </Button>
        )}
      </div>

      <NoBranchSelectedAlert />

      {currentBranch && (
        <Tabs defaultValue="categories" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="categories" className="flex items-center">
              <FolderTree className="mr-2 h-4 w-4" />
              Categorías
            </TabsTrigger>
            <TabsTrigger value="subcategories" className="flex items-center">
              <Tag className="mr-2 h-4 w-4" />
              Subcategorías
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Categorías Principales</CardTitle>
                <CardDescription>
                  Gestiona las categorías principales de tu menú para la sucursal {currentBranch.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <CategoryList
                    categories={categories}
                    onEdit={handleEditCategory}
                    onDelete={handleCategoryDeleted}
                    onAddSubcategory={handleAddSubcategory}
                    showSubcategoryButton={true}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subcategories">
            <Card>
              <CardHeader>
                <CardTitle>Subcategorías</CardTitle>
                <CardDescription>Gestiona las subcategorías de cada categoría principal</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-8">
                    {categories.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No hay categorías principales. Crea una categoría primero.</p>
                      </div>
                    ) : (
                      categories.map((category) => (
                        <div key={category.id} className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">{category.name}</h3>
                            <Button variant="outline" size="sm" onClick={() => handleAddSubcategory(category.id)}>
                              <Plus className="mr-2 h-4 w-4" /> Añadir Subcategoría
                            </Button>
                          </div>

                          {subcategories[category.id]?.length > 0 ? (
                            <CategoryList
                              categories={subcategories[category.id] || []}
                              onEdit={handleEditCategory}
                              onDelete={handleCategoryDeleted}
                              showSubcategoryButton={false}
                            />
                          ) : (
                            <div className="text-center py-4 bg-gray-50 rounded-lg">
                              <p className="text-gray-500">No hay subcategorías para {category.name}</p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Category Form Dialog */}
      <CategoryForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        category={editingCategory}
        parentId={parentCategoryId}
        tenantId={tenantId}
        branchId={currentBranch?.id}
        categories={categories}
        onCategoryCreated={handleCategoryCreated}
        onCategoryUpdated={handleCategoryUpdated}
      />
    </div>
  )
}
