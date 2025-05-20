"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useBranch } from "@/lib/context/branch-context"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useRestaurantConfig } from "@/lib/hooks/use-restaurant-config"
import {
  PieChart,
  DollarSign,
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
} from "lucide-react"
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseCategories,
  createExpenseCategory,
  getFinancialSummary,
} from "@/lib/services/finance-service"
import { getInventoryItems } from "@/lib/services/inventory-service"
import { getCashMovements } from "@/lib/services/cash-register-service"
import type { Expense, ExpenseCategory, FinancialSummary } from "@/lib/types/finance"
import type { InventoryItem } from "@/lib/types/inventory"
import type { CashMovement } from "@/lib/types/cash-register"
import { DatePicker } from "@/components/ui/date-picker"

export default function FinancesPage() {
  const params = useParams<{ tenantId: string }>()
  const { currentBranch } = useBranch()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([])
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [loading, setLoading] = useState(true)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [cashMovements, setCashMovements] = useState<CashMovement[]>([])
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null)

  // Estados para diálogos
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Estados para formularios
  const [newExpense, setNewExpense] = useState<Omit<Expense, "id" | "createdAt" | "updatedAt">>({
    amount: 0,
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "cash",
    reference: "",
    inventoryItemId: "",
    isRecurring: false,
    recurringFrequency: "",
    nextDueDate: "",
    status: "paid",
    attachmentUrl: "",
    notes: "",
  })

  const [newCategory, setNewCategory] = useState<Omit<ExpenseCategory, "id">>({
    name: "",
    description: "",
    color: "#6366F1",
    isActive: true,
  })

  // Obtener la configuración del restaurante para el formato de moneda
  const { data: restaurantConfig } = useRestaurantConfig(params.tenantId, "basicInfo", {
    currencyCode: "CLP",
  })

  // Obtener el código de moneda configurado
  const currencyCode = restaurantConfig?.currencyCode || "CLP"

  // Cargar datos
  useEffect(() => {
    if (currentBranch?.id) {
      loadData()
    }
  }, [currentBranch])

  // Filtrar gastos cuando cambia la búsqueda o filtros
  useEffect(() => {
    filterExpenses()
  }, [searchQuery, categoryFilter, dateFilter, expenses])

  // Función para cargar todos los datos
  const loadData = async () => {
    if (!currentBranch?.id) return

    setLoading(true)
    try {
      // Cargar gastos
      const expensesData = await getExpenses(params.tenantId, currentBranch.id)
      setExpenses(expensesData)
      setFilteredExpenses(expensesData)

      // Cargar categorías de gastos
      const categoriesData = await getExpenseCategories(params.tenantId, currentBranch.id)
      setExpenseCategories(categoriesData)

      // Cargar items de inventario
      const inventoryData = await getInventoryItems(params.tenantId, currentBranch.id)
      setInventoryItems(inventoryData)

      // Cargar movimientos de caja
      const cashData = await getCashMovements(params.tenantId, currentBranch.id, "all")
      setCashMovements(cashData)

      // Cargar resumen financiero
      const summaryData = await getFinancialSummary(params.tenantId, currentBranch.id)
      setFinancialSummary(summaryData)
    } catch (error) {
      console.error("Error al cargar datos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos financieros",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Función para filtrar gastos
  const filterExpenses = () => {
    let filtered = [...expenses]

    // Filtrar por búsqueda
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (expense) =>
          expense.description.toLowerCase().includes(query) ||
          expense.category.toLowerCase().includes(query) ||
          expense.reference.toLowerCase().includes(query),
      )
    }

    // Filtrar por categoría
    if (categoryFilter !== "all") {
      filtered = filtered.filter((expense) => expense.category === categoryFilter)
    }

    // Filtrar por fecha
    if (dateFilter.from) {
      filtered = filtered.filter((expense) => new Date(expense.date) >= new Date(dateFilter.from!))
    }
    if (dateFilter.to) {
      filtered = filtered.filter((expense) => new Date(expense.date) <= new Date(dateFilter.to!))
    }

    setFilteredExpenses(filtered)
  }

  // Función para crear o actualizar un gasto
  const handleSaveExpense = async () => {
    if (!currentBranch?.id) return

    if (!newExpense.description || newExpense.amount <= 0 || !newExpense.category) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    try {
      if (selectedExpense) {
        // Actualizar gasto existente
        await updateExpense(params.tenantId, currentBranch.id, selectedExpense.id, newExpense)
        toast({
          title: "Éxito",
          description: "Gasto actualizado correctamente",
        })
      } else {
        // Crear nuevo gasto
        await createExpense(params.tenantId, currentBranch.id, newExpense)
        toast({
          title: "Éxito",
          description: "Gasto registrado correctamente",
        })
      }

      // Recargar datos y cerrar diálogo
      await loadData()
      setExpenseDialogOpen(false)
      resetExpenseForm()
    } catch (error) {
      console.error("Error al guardar gasto:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el gasto",
        variant: "destructive",
      })
    }
  }

  // Función para crear una nueva categoría
  const handleSaveCategory = async () => {
    if (!currentBranch?.id) return

    if (!newCategory.name) {
      toast({
        title: "Error",
        description: "Por favor ingrese un nombre para la categoría",
        variant: "destructive",
      })
      return
    }

    try {
      await createExpenseCategory(params.tenantId, currentBranch.id, newCategory)
      toast({
        title: "Éxito",
        description: "Categoría creada correctamente",
      })

      // Recargar categorías y cerrar diálogo
      const categoriesData = await getExpenseCategories(params.tenantId, currentBranch.id)
      setExpenseCategories(categoriesData)
      setCategoryDialogOpen(false)
      setNewCategory({
        name: "",
        description: "",
        color: "#6366F1",
        isActive: true,
      })
    } catch (error) {
      console.error("Error al crear categoría:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la categoría",
        variant: "destructive",
      })
    }
  }

  // Función para eliminar un gasto
  const handleDeleteExpense = async () => {
    if (!currentBranch?.id || !selectedExpense) return

    try {
      await deleteExpense(params.tenantId, currentBranch.id, selectedExpense.id)
      toast({
        title: "Éxito",
        description: "Gasto eliminado correctamente",
      })

      // Recargar datos y cerrar diálogo
      await loadData()
      setDeleteDialogOpen(false)
      setSelectedExpense(null)
    } catch (error) {
      console.error("Error al eliminar gasto:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el gasto",
        variant: "destructive",
      })
    }
  }

  // Función para abrir el diálogo de nuevo gasto
  const openNewExpenseDialog = () => {
    setSelectedExpense(null)
    resetExpenseForm()
    setExpenseDialogOpen(true)
  }

  // Función para abrir el diálogo de edición
  const openEditExpenseDialog = (expense: Expense) => {
    setSelectedExpense(expense)
    setNewExpense({
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      date: expense.date,
      paymentMethod: expense.paymentMethod,
      reference: expense.reference || "",
      inventoryItemId: expense.inventoryItemId || "",
      isRecurring: expense.isRecurring || false,
      recurringFrequency: expense.recurringFrequency || "",
      nextDueDate: expense.nextDueDate || "",
      status: expense.status || "paid",
      attachmentUrl: expense.attachmentUrl || "",
      notes: expense.notes || "",
    })
    setExpenseDialogOpen(true)
  }

  // Función para abrir el diálogo de eliminación
  const openDeleteDialog = (expense: Expense) => {
    setSelectedExpense(expense)
    setDeleteDialogOpen(true)
  }

  // Función para resetear el formulario de gasto
  const resetExpenseForm = () => {
    setNewExpense({
      amount: 0,
      category: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      paymentMethod: "cash",
      reference: "",
      inventoryItemId: "",
      isRecurring: false,
      recurringFrequency: "",
      nextDueDate: "",
      status: "paid",
      attachmentUrl: "",
      notes: "",
    })
  }

  // Función para exportar datos a CSV
  const exportToCSV = () => {
    // Implementación básica de exportación a CSV
    const headers = ["Fecha", "Descripción", "Categoría", "Monto", "Método de Pago", "Estado"]
    const csvData = [
      headers.join(","),
      ...filteredExpenses.map((expense) =>
        [
          expense.date,
          `"${expense.description}"`,
          `"${expense.category}"`,
          expense.amount,
          expense.paymentMethod,
          expense.status,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `gastos_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Función para obtener el color de la categoría
  const getCategoryColor = (categoryName: string) => {
    const category = expenseCategories.find((cat) => cat.name === categoryName)
    return category?.color || "#6366F1"
  }

  // Función para obtener el nombre del item de inventario
  const getInventoryItemName = (itemId: string) => {
    const item = inventoryItems.find((item) => item.id === itemId)
    return item?.name || "No especificado"
  }

  // Calcular totales para el dashboard
  const calculateTotals = () => {
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

    // Calcular ingresos (ventas) de los movimientos de caja
    const totalIncome = cashMovements
      .filter((movement) => ["income", "sale"].includes(movement.type))
      .reduce((sum, movement) => sum + movement.amount, 0)

    // Calcular gastos por categoría para el gráfico
    const expensesByCategory = expenseCategories
      .map((category) => {
        const amount = expenses
          .filter((expense) => expense.category === category.name)
          .reduce((sum, expense) => sum + expense.amount, 0)
        return {
          category: category.name,
          amount,
          color: category.color,
        }
      })
      .filter((item) => item.amount > 0)

    return {
      totalExpenses,
      totalIncome,
      profit: totalIncome - totalExpenses,
      expensesByCategory,
    }
  }

  const totals = calculateTotals()

  if (!currentBranch) {
    return <NoBranchSelectedAlert />
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión Financiera</h1>
          <p className="text-muted-foreground">Controle sus gastos, ingresos y analice su rentabilidad</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <ArrowDownRight className="h-4 w-4" />
            <span>Gastos</span>
          </TabsTrigger>
          <TabsTrigger value="income" className="flex items-center gap-2">
            <ArrowUpRight className="h-4 w-4" />
            <span>Ingresos</span>
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tarjetas de resumen */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <ArrowDownRight className="h-5 w-5 mr-2 text-red-500" />
                  Total Gastos
                </CardTitle>
                <CardDescription>Gastos acumulados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(totals.totalExpenses, currencyCode)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <ArrowUpRight className="h-5 w-5 mr-2 text-green-500" />
                  Total Ingresos
                </CardTitle>
                <CardDescription>Ingresos acumulados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(totals.totalIncome, currencyCode)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-blue-500" />
                  Ganancia Neta
                </CardTitle>
                <CardDescription>Ingresos - Gastos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${totals.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(totals.profit, currencyCode)}
                </div>
              </CardContent>
            </Card>

            {/* Gráficos y análisis */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Distribución de Gastos por Categoría</CardTitle>
                <CardDescription>Análisis de gastos por categoría</CardDescription>
              </CardHeader>
              <CardContent>
                {totals.expensesByCategory.length > 0 ? (
                  <div className="space-y-4">
                    {/* Aquí iría un gráfico de barras o pastel, pero lo simulamos con barras de progreso */}
                    {totals.expensesByCategory.map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{item.category}</span>
                          <span>{formatCurrency(item.amount, currencyCode)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="h-2.5 rounded-full"
                            style={{
                              width: `${(item.amount / totals.totalExpenses) * 100}%`,
                              backgroundColor: item.color,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay datos suficientes para mostrar el gráfico
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gastos Recientes</CardTitle>
                <CardDescription>Últimos gastos registrados</CardDescription>
              </CardHeader>
              <CardContent>
                {expenses.length > 0 ? (
                  <div className="space-y-4">
                    {expenses.slice(0, 5).map((expense, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{expense.description}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(expense.date)}</p>
                        </div>
                        <Badge style={{ backgroundColor: getCategoryColor(expense.category) }} className="text-white">
                          {formatCurrency(expense.amount, currencyCode)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">No hay gastos registrados</div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setActiveTab("expenses")}>
                  Ver todos los gastos
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Registro de Gastos</CardTitle>
                <div className="flex gap-2">
                  <Button onClick={openNewExpenseDialog} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Nuevo Gasto
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCategoryDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Nueva Categoría
                  </Button>
                </div>
              </div>
              <CardDescription>Gestione todos los gastos de su negocio</CardDescription>

              {/* Filtros y búsqueda */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar gastos..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {expenseCategories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 items-center">
                  <DatePicker
                    selected={dateFilter.from}
                    onSelect={(date) => setDateFilter({ ...dateFilter, from: date })}
                    placeholder="Fecha inicio"
                  />
                  <span>-</span>
                  <DatePicker
                    selected={dateFilter.to}
                    onSelect={(date) => setDateFilter({ ...dateFilter, to: date })}
                    placeholder="Fecha fin"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("")
                      setCategoryFilter("all")
                      setDateFilter({ from: undefined, to: undefined })
                    }}
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Limpiar filtros
                  </Button>
                  <Button variant="outline" onClick={exportToCSV} className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Exportar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Cargando gastos...</div>
              ) : filteredExpenses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Método de Pago</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{formatDate(expense.date)}</TableCell>
                        <TableCell className="font-medium">
                          {expense.description}
                          {expense.inventoryItemId && (
                            <Badge variant="outline" className="ml-2">
                              Inventario: {getInventoryItemName(expense.inventoryItemId)}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge style={{ backgroundColor: getCategoryColor(expense.category) }} className="text-white">
                            {expense.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(expense.amount, currencyCode)}</TableCell>
                        <TableCell>{expense.paymentMethod}</TableCell>
                        <TableCell>
                          <Badge variant={expense.status === "paid" ? "default" : "secondary"}>
                            {expense.status === "paid" ? "Pagado" : "Pendiente"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditExpenseDialog(expense)}
                              className="flex items-center gap-1"
                            >
                              <Edit className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Editar</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(expense)}
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
                  {searchQuery || categoryFilter !== "all" || dateFilter.from || dateFilter.to
                    ? "No se encontraron gastos que coincidan con los filtros"
                    : "No hay gastos registrados"}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Income Tab */}
        <TabsContent value="income" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Ingresos</CardTitle>
              <CardDescription>
                Los ingresos se registran automáticamente desde el módulo de Caja cuando se realizan ventas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Cargando ingresos...</div>
              ) : cashMovements.filter((m) => ["income", "sale"].includes(m.type)).length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Método de Pago</TableHead>
                      <TableHead>Referencia</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cashMovements
                      .filter((movement) => ["income", "sale"].includes(movement.type))
                      .slice(0, 20)
                      .map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell>{formatDate(movement.createdAt)}</TableCell>
                          <TableCell className="font-medium">{movement.description}</TableCell>
                          <TableCell>
                            <Badge variant={movement.type === "sale" ? "default" : "secondary"}>
                              {movement.type === "sale" ? "Venta" : "Ingreso"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-green-600">
                            {formatCurrency(movement.amount, currencyCode)}
                          </TableCell>
                          <TableCell>{movement.paymentMethod}</TableCell>
                          <TableCell>{movement.reference || "-"}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No hay ingresos registrados</div>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Para registrar nuevos ingresos, utilice el módulo de Caja o realice ventas a través del sistema.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo para crear/editar gasto */}
      <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedExpense ? "Editar Gasto" : "Nuevo Gasto"}</DialogTitle>
            <DialogDescription>
              {selectedExpense
                ? "Actualice la información del gasto seleccionado"
                : "Complete la información para registrar un nuevo gasto"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="expense-description">Descripción</Label>
                <Input
                  id="expense-description"
                  placeholder="Descripción del gasto"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="expense-amount">Monto</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="expense-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    className="pl-8"
                    placeholder="0.00"
                    value={newExpense.amount || ""}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="expense-date">Fecha</Label>
                <div className="relative">
                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="expense-date"
                    type="date"
                    className="pl-8"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="col-span-2">
                <Label htmlFor="expense-category">Categoría</Label>
                <Select
                  value={newExpense.category}
                  onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                >
                  <SelectTrigger id="expense-category">
                    <SelectValue placeholder="Seleccione una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="expense-payment-method">Método de Pago</Label>
                <Select
                  value={newExpense.paymentMethod}
                  onValueChange={(value) => setNewExpense({ ...newExpense, paymentMethod: value })}
                >
                  <SelectTrigger id="expense-payment-method">
                    <SelectValue placeholder="Método de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Efectivo</SelectItem>
                    <SelectItem value="card">Tarjeta</SelectItem>
                    <SelectItem value="transfer">Transferencia</SelectItem>
                    <SelectItem value="app">Aplicación</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="expense-status">Estado</Label>
                <Select
                  value={newExpense.status}
                  onValueChange={(value) => setNewExpense({ ...newExpense, status: value })}
                >
                  <SelectTrigger id="expense-status">
                    <SelectValue placeholder="Estado del gasto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Pagado</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label htmlFor="expense-reference">Referencia (opcional)</Label>
                <Input
                  id="expense-reference"
                  placeholder="Número de factura, boleta, etc."
                  value={newExpense.reference || ""}
                  onChange={(e) => setNewExpense({ ...newExpense, reference: e.target.value })}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="expense-inventory-item">Item de Inventario (opcional)</Label>
                <Select
                  value={newExpense.inventoryItemId || ""}
                  onValueChange={(value) => setNewExpense({ ...newExpense, inventoryItemId: value })}
                >
                  <SelectTrigger id="expense-inventory-item">
                    <SelectValue placeholder="Seleccione un item (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguno</SelectItem>
                    {inventoryItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Vincule este gasto con un item de inventario para mejor seguimiento
                </p>
              </div>

              <div className="col-span-2">
                <Label htmlFor="expense-notes">Notas (opcional)</Label>
                <Input
                  id="expense-notes"
                  placeholder="Notas adicionales"
                  value={newExpense.notes || ""}
                  onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setExpenseDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveExpense}>{selectedExpense ? "Actualizar" : "Guardar"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo para crear categoría */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva Categoría de Gasto</DialogTitle>
            <DialogDescription>Cree una nueva categoría para clasificar sus gastos</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="category-name">Nombre</Label>
              <Input
                id="category-name"
                placeholder="Nombre de la categoría"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="category-description">Descripción (opcional)</Label>
              <Input
                id="category-description"
                placeholder="Descripción de la categoría"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="category-color">Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="category-color"
                  type="color"
                  className="w-12 h-10 p-1"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                />
                <div
                  className="w-full h-10 rounded-md flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: newCategory.color }}
                >
                  {newCategory.name || "Vista previa"}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCategory}>Crear Categoría</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo para confirmar eliminación */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea eliminar este gasto? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteExpense}>
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
