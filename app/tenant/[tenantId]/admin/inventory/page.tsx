"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useBranch } from "@/lib/context/branch-context"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"
import { useRestaurantConfig } from "@/lib/hooks/use-restaurant-config"
import { Package, Plus, Search, Edit, Trash2, ShoppingCart, History, AlertTriangle, FileText } from "lucide-react"
import {
  getInventoryItems,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  registerPurchase,
  getItemPurchaseHistory,
} from "@/lib/services/inventory-service"
import type { InventoryItem, PurchaseRecord } from "@/lib/types/inventory"

export default function InventoryPage() {
  const params = useParams<{ tenantId: string }>()
  const { currentBranch } = useBranch()
  const [activeTab, setActiveTab] = useState("items")
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

  // Estados para diálogos
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Estados para formularios
  const [newItem, setNewItem] = useState<Omit<InventoryItem, "id" | "lastUpdated">>({
    name: "",
    description: "",
    category: "general",
    unit: "unidad",
    currentStock: 0,
    minStock: 0,
    costPerUnit: 0,
    isActive: true,
  })

  const [newPurchase, setNewPurchase] = useState<Omit<PurchaseRecord, "id">>({
    itemId: "",
    date: new Date().toISOString().split("T")[0],
    quantity: 0,
    totalCost: 0,
    supplier: "",
    invoiceNumber: "",
    notes: "",
  })

  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseRecord[]>([])

  // Obtener la configuración del restaurante para el formato de moneda
  const { data: restaurantConfig } = useRestaurantConfig(params.tenantId, "basicInfo", {
    currencyCode: "CLP",
  })

  // Obtener el código de moneda configurado
  const currencyCode = restaurantConfig?.currencyCode || "CLP"

  // Cargar items del inventario
  useEffect(() => {
    if (currentBranch?.id) {
      loadInventoryItems()
    }
  }, [currentBranch])

  // Filtrar items cuando cambia la búsqueda
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredItems(inventoryItems)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = inventoryItems.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query),
      )
      setFilteredItems(filtered)
    }
  }, [searchQuery, inventoryItems])

  // Función para cargar items del inventario
  const loadInventoryItems = async () => {
    if (!currentBranch?.id) return

    setLoading(true)
    try {
      const items = await getInventoryItems(params.tenantId, currentBranch.id)
      setInventoryItems(items)
      setFilteredItems(items)
    } catch (error) {
      console.error("Error al cargar inventario:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el inventario",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Función para crear o actualizar un item
  const handleSaveItem = async () => {
    if (!currentBranch?.id) return

    if (!newItem.name || newItem.costPerUnit < 0) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    try {
      if (selectedItem) {
        // Actualizar item existente
        await updateInventoryItem(params.tenantId, currentBranch.id, selectedItem.id, newItem)
        toast({
          title: "Éxito",
          description: "Item actualizado correctamente",
        })
      } else {
        // Crear nuevo item
        await createInventoryItem(params.tenantId, currentBranch.id, newItem)
        toast({
          title: "Éxito",
          description: "Item creado correctamente",
        })
      }

      // Recargar items y cerrar diálogo
      await loadInventoryItems()
      setItemDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error al guardar item:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el item",
        variant: "destructive",
      })
    }
  }

  // Función para eliminar un item
  const handleDeleteItem = async () => {
    if (!currentBranch?.id || !selectedItem) return

    try {
      await deleteInventoryItem(params.tenantId, currentBranch.id, selectedItem.id)
      toast({
        title: "Éxito",
        description: "Item eliminado correctamente",
      })

      // Recargar items y cerrar diálogo
      await loadInventoryItems()
      setDeleteDialogOpen(false)
      setSelectedItem(null)
    } catch (error) {
      console.error("Error al eliminar item:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el item",
        variant: "destructive",
      })
    }
  }

  // Función para registrar una compra
  const handleRegisterPurchase = async () => {
    if (!currentBranch?.id || !selectedItem) return

    if (newPurchase.quantity <= 0 || newPurchase.totalCost <= 0) {
      toast({
        title: "Error",
        description: "La cantidad y el costo total deben ser mayores que cero",
        variant: "destructive",
      })
      return
    }

    try {
      await registerPurchase(params.tenantId, currentBranch.id, {
        ...newPurchase,
        itemId: selectedItem.id,
      })

      toast({
        title: "Éxito",
        description: "Compra registrada correctamente",
      })

      // Recargar items y cerrar diálogo
      await loadInventoryItems()
      setPurchaseDialogOpen(false)
      resetPurchaseForm()
    } catch (error) {
      console.error("Error al registrar compra:", error)
      toast({
        title: "Error",
        description: "No se pudo registrar la compra",
        variant: "destructive",
      })
    }
  }

  // Función para cargar el historial de compras
  const loadPurchaseHistory = async (item: InventoryItem) => {
    if (!currentBranch?.id) return

    try {
      const history = await getItemPurchaseHistory(params.tenantId, currentBranch.id, item.id)
      setPurchaseHistory(history)
      setSelectedItem(item)
      setHistoryDialogOpen(true)
    } catch (error) {
      console.error("Error al cargar historial de compras:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el historial de compras",
        variant: "destructive",
      })
    }
  }

  // Función para abrir el diálogo de nuevo item
  const openNewItemDialog = () => {
    setSelectedItem(null)
    resetForm()
    setItemDialogOpen(true)
  }

  // Función para abrir el diálogo de edición
  const openEditItemDialog = (item: InventoryItem) => {
    setSelectedItem(item)
    setNewItem({
      name: item.name,
      description: item.description || "",
      category: item.category,
      unit: item.unit,
      currentStock: item.currentStock,
      minStock: item.minStock || 0,
      costPerUnit: item.costPerUnit,
      isActive: item.isActive,
    })
    setItemDialogOpen(true)
  }

  // Función para abrir el diálogo de compra
  const openPurchaseDialog = (item: InventoryItem) => {
    setSelectedItem(item)
    resetPurchaseForm()
    setPurchaseDialogOpen(true)
  }

  // Función para abrir el diálogo de eliminación
  const openDeleteDialog = (item: InventoryItem) => {
    setSelectedItem(item)
    setDeleteDialogOpen(true)
  }

  // Función para resetear el formulario de item
  const resetForm = () => {
    setNewItem({
      name: "",
      description: "",
      category: "general",
      unit: "unidad",
      currentStock: 0,
      minStock: 0,
      costPerUnit: 0,
      isActive: true,
    })
  }

  // Función para resetear el formulario de compra
  const resetPurchaseForm = () => {
    setNewPurchase({
      itemId: selectedItem?.id || "",
      date: new Date().toISOString().split("T")[0],
      quantity: 0,
      totalCost: 0,
      supplier: "",
      invoiceNumber: "",
      notes: "",
    })
  }

  // Calcular costo unitario en tiempo real para el formulario de compra
  const calculateUnitCost = () => {
    if (newPurchase.quantity <= 0) return 0
    return newPurchase.totalCost / newPurchase.quantity
  }

  if (!currentBranch) {
    return <NoBranchSelectedAlert />
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Inventario</h1>
          <p className="text-muted-foreground">Administre su inventario, registre compras y controle costos</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="items" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span>Inventario</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Reportes</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Items de Inventario</CardTitle>
                <Button onClick={openNewItemDialog} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nuevo Item
                </Button>
              </div>
              <CardDescription>Gestione todos los insumos y materiales de su inventario</CardDescription>
              <div className="mt-4 relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar items..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Cargando inventario...</div>
              ) : filteredItems.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Stock Actual</TableHead>
                      <TableHead>Unidad</TableHead>
                      <TableHead>Costo Unitario</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          <span className={item.currentStock <= (item.minStock || 0) ? "text-red-500 font-bold" : ""}>
                            {item.currentStock}
                          </span>
                          {item.currentStock <= (item.minStock || 0) && (
                            <AlertTriangle className="inline-block ml-2 h-4 w-4 text-red-500" />
                          )}
                        </TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>{formatCurrency(item.costPerUnit, currencyCode)}</TableCell>
                        <TableCell>
                          <Badge variant={item.isActive ? "default" : "secondary"}>
                            {item.isActive ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPurchaseDialog(item)}
                              className="flex items-center gap-1"
                            >
                              <ShoppingCart className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Compra</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => loadPurchaseHistory(item)}
                              className="flex items-center gap-1"
                            >
                              <History className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Historial</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditItemDialog(item)}
                              className="flex items-center gap-1"
                            >
                              <Edit className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Editar</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(item)}
                              className="flex items-center gap-1 text-red-500"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Eliminar</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery
                    ? "No se encontraron items que coincidan con la búsqueda"
                    : "No hay items en el inventario"}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Reportes de Inventario</CardTitle>
              <CardDescription>Visualice reportes y estadísticas de su inventario</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Items con Stock Bajo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {filteredItems.filter((item) => item.currentStock <= (item.minStock || 0)).length > 0 ? (
                      <ul className="space-y-2">
                        {filteredItems
                          .filter((item) => item.currentStock <= (item.minStock || 0))
                          .map((item) => (
                            <li key={item.id} className="flex justify-between items-center">
                              <span className="font-medium">{item.name}</span>
                              <span className="text-red-500">
                                {item.currentStock} / {item.minStock} {item.unit}
                              </span>
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <p className="text-center py-4 text-muted-foreground">No hay items con stock bajo</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Valor Total del Inventario</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-4">
                      <p className="text-3xl font-bold">
                        {formatCurrency(
                          filteredItems.reduce((total, item) => total + item.currentStock * item.costPerUnit, 0),
                          currencyCode,
                        )}
                      </p>
                      <p className="text-muted-foreground mt-2">Basado en {filteredItems.length} items</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Categorías</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {filteredItems.length > 0 ? (
                      <ul className="space-y-2">
                        {Array.from(new Set(filteredItems.map((item) => item.category))).map((category) => (
                          <li key={category} className="flex justify-between items-center">
                            <span className="font-medium">{category}</span>
                            <span>{filteredItems.filter((item) => item.category === category).length} items</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-center py-4 text-muted-foreground">No hay categorías disponibles</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo para crear/editar item */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedItem ? "Editar Item" : "Nuevo Item"}</DialogTitle>
            <DialogDescription>
              {selectedItem
                ? "Actualice la información del item seleccionado"
                : "Complete la información para agregar un nuevo item al inventario"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="item-name">Nombre</Label>
                <Input
                  id="item-name"
                  placeholder="Nombre del item"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="item-description">Descripción (opcional)</Label>
                <Input
                  id="item-description"
                  placeholder="Descripción del item"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="item-category">Categoría</Label>
                <Input
                  id="item-category"
                  placeholder="Categoría"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="item-unit">Unidad de Medida</Label>
                <Input
                  id="item-unit"
                  placeholder="Unidad"
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="item-stock">Stock Actual</Label>
                <Input
                  id="item-stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={newItem.currentStock}
                  onChange={(e) => setNewItem({ ...newItem, currentStock: Number(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="item-min-stock">Stock Mínimo</Label>
                <Input
                  id="item-min-stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={newItem.minStock}
                  onChange={(e) => setNewItem({ ...newItem, minStock: Number(e.target.value) })}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="item-cost">Costo Unitario</Label>
                <div className="relative">
                  <span className="absolute left-2 top-2.5 text-muted-foreground">$</span>
                  <Input
                    id="item-cost"
                    type="number"
                    min="0"
                    step="0.01"
                    className="pl-6"
                    placeholder="0.00"
                    value={newItem.costPerUnit}
                    onChange={(e) => setNewItem({ ...newItem, costPerUnit: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setItemDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveItem}>{selectedItem ? "Actualizar" : "Guardar"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo para registrar compra */}
      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Compra</DialogTitle>
            <DialogDescription>Registre una nueva compra para {selectedItem?.name}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="purchase-date">Fecha</Label>
                <Input
                  id="purchase-date"
                  type="date"
                  value={newPurchase.date}
                  onChange={(e) => setNewPurchase({ ...newPurchase, date: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="purchase-quantity">Cantidad</Label>
                <Input
                  id="purchase-quantity"
                  type="number"
                  min="1"
                  placeholder="0"
                  value={newPurchase.quantity || ""}
                  onChange={(e) => setNewPurchase({ ...newPurchase, quantity: Number(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="purchase-total-cost">Costo Total</Label>
                <div className="relative">
                  <span className="absolute left-2 top-2.5 text-muted-foreground">$</span>
                  <Input
                    id="purchase-total-cost"
                    type="number"
                    min="0"
                    step="0.01"
                    className="pl-6"
                    placeholder="0.00"
                    value={newPurchase.totalCost || ""}
                    onChange={(e) => setNewPurchase({ ...newPurchase, totalCost: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="col-span-2">
                <Label>Costo Unitario Calculado</Label>
                <div className="p-2 border rounded-md bg-muted/50">
                  <p className="font-medium">{formatCurrency(calculateUnitCost(), currencyCode)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Costo actual: {formatCurrency(selectedItem?.costPerUnit || 0, currencyCode)}
                  </p>
                </div>
              </div>

              <div className="col-span-2">
                <Label htmlFor="purchase-supplier">Proveedor (opcional)</Label>
                <Input
                  id="purchase-supplier"
                  placeholder="Nombre del proveedor"
                  value={newPurchase.supplier || ""}
                  onChange={(e) => setNewPurchase({ ...newPurchase, supplier: e.target.value })}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="purchase-invoice">N° Factura/Boleta (opcional)</Label>
                <Input
                  id="purchase-invoice"
                  placeholder="Número de factura o boleta"
                  value={newPurchase.invoiceNumber || ""}
                  onChange={(e) => setNewPurchase({ ...newPurchase, invoiceNumber: e.target.value })}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="purchase-notes">Notas (opcional)</Label>
                <Input
                  id="purchase-notes"
                  placeholder="Notas adicionales"
                  value={newPurchase.notes || ""}
                  onChange={(e) => setNewPurchase({ ...newPurchase, notes: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setPurchaseDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRegisterPurchase}>Registrar Compra</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo para historial de compras */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Historial de Compras</DialogTitle>
            <DialogDescription>Historial de compras para {selectedItem?.name}</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {purchaseHistory.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Costo Total</TableHead>
                    <TableHead>Costo Unitario</TableHead>
                    <TableHead>Proveedor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseHistory.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell>{new Date(purchase.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {purchase.quantity} {selectedItem?.unit}
                      </TableCell>
                      <TableCell>{formatCurrency(purchase.totalCost, currencyCode)}</TableCell>
                      <TableCell>{formatCurrency(purchase.totalCost / purchase.quantity, currencyCode)}</TableCell>
                      <TableCell>{purchase.supplier || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-muted-foreground">No hay compras registradas para este item</div>
            )}
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setHistoryDialogOpen(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo para confirmar eliminación */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea eliminar {selectedItem?.name}? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem}>
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
