import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"
import { AlertCircle } from "lucide-react"

interface SessionDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessionDetails: any
  loading: boolean
}

export function SessionDetailsDialog({ open, onOpenChange, sessionDetails, loading }: SessionDetailsDialogProps) {
  if (!sessionDetails && !loading) {
    return null
  }

  const session = sessionDetails?.session
  const orders = sessionDetails?.orders || []
  const summary = sessionDetails?.financialSummary || {
    totalSales: 0,
    cashSales: 0,
    cardSales: 0,
    transferSales: 0,
    otherSales: 0,
    totalOrders: 0,
    completedOrders: 0,
    canceledOrders: 0,
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles de Sesión</DialogTitle>
          <DialogDescription>
            {session
              ? `Sesión del ${new Date(session.startTime).toLocaleDateString()} (${
                  session.status === "open" ? "Abierta" : "Cerrada"
                })`
              : "Cargando detalles..."}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : (
          <Tabs defaultValue="summary">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="summary">Resumen</TabsTrigger>
              <TabsTrigger value="financial">Financiero</TabsTrigger>
              <TabsTrigger value="orders">Órdenes ({orders.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Información General</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm font-medium">ID:</div>
                    <div className="text-sm">{session?.id}</div>

                    <div className="text-sm font-medium">Fecha de apertura:</div>
                    <div className="text-sm">{new Date(session?.startTime).toLocaleString()}</div>

                    <div className="text-sm font-medium">Fecha de cierre:</div>
                    <div className="text-sm">
                      {session?.endTime ? new Date(session.endTime).toLocaleString() : "En curso"}
                    </div>

                    <div className="text-sm font-medium">Estado:</div>
                    <div className="text-sm">
                      {session?.status === "open" ? (
                        <Badge className="bg-green-100 text-green-800">Abierta</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800">
                          Cerrada
                        </Badge>
                      )}
                    </div>

                    <div className="text-sm font-medium">Abierta por:</div>
                    <div className="text-sm">{session?.openedBy || "No disponible"}</div>

                    {session?.status === "closed" && (
                      <>
                        <div className="text-sm font-medium">Cerrada por:</div>
                        <div className="text-sm">{session?.closedBy || "No disponible"}</div>
                      </>
                    )}

                    <div className="text-sm font-medium">Efectivo inicial:</div>
                    <div className="text-sm">{formatCurrency(session?.initialCash || 0)}</div>

                    {session?.status === "closed" && (
                      <>
                        <div className="text-sm font-medium">Efectivo final:</div>
                        <div className="text-sm">{formatCurrency(session?.endCash || 0)}</div>

                        <div className="text-sm font-medium">Diferencia:</div>
                        <div
                          className={`text-sm ${
                            session?.difference < 0 ? "text-red-600" : session?.difference > 0 ? "text-green-600" : ""
                          }`}
                        >
                          {formatCurrency(session?.difference || 0)}
                        </div>
                      </>
                    )}
                  </div>

                  {session?.notes && (
                    <div className="mt-4">
                      <div className="text-sm font-medium">Notas:</div>
                      <div className="text-sm mt-1 p-2 bg-gray-50 rounded-md">{session.notes}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financial" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen financiero</CardTitle>
                </CardHeader>
                <CardContent>
                  {summary.totalSales > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-md">
                          <div className="text-sm text-blue-600">Ventas totales</div>
                          <div className="text-2xl font-bold">{formatCurrency(summary.totalSales)}</div>
                        </div>

                        <div className="bg-green-50 p-4 rounded-md">
                          <div className="text-sm text-green-600">Efectivo</div>
                          <div className="text-xl font-bold">{formatCurrency(summary.cashSales)}</div>
                          <div className="text-sm">
                            {summary.totalSales > 0
                              ? `${((summary.cashSales / summary.totalSales) * 100).toFixed(1)}%`
                              : "0%"}
                          </div>
                        </div>

                        <div className="bg-orange-50 p-4 rounded-md">
                          <div className="text-sm text-orange-600">Tarjeta</div>
                          <div className="text-xl font-bold">{formatCurrency(summary.cardSales)}</div>
                          <div className="text-sm">
                            {summary.totalSales > 0
                              ? `${((summary.cardSales / summary.totalSales) * 100).toFixed(1)}%`
                              : "0%"}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-purple-50 p-4 rounded-md">
                          <div className="text-sm text-purple-600">Transferencia</div>
                          <div className="text-xl font-bold">{formatCurrency(summary.transferSales)}</div>
                          <div className="text-sm">
                            {summary.totalSales > 0
                              ? `${((summary.transferSales / summary.totalSales) * 100).toFixed(1)}%`
                              : "0%"}
                          </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-md">
                          <div className="text-sm text-gray-600">Otros</div>
                          <div className="text-xl font-bold">{formatCurrency(summary.otherSales)}</div>
                          <div className="text-sm">
                            {summary.totalSales > 0
                              ? `${((summary.otherSales / summary.totalSales) * 100).toFixed(1)}%`
                              : "0%"}
                          </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-md">
                          <div className="text-sm text-gray-600">Ticket promedio</div>
                          <div className="text-xl font-bold">
                            {summary.completedOrders > 0
                              ? formatCurrency(summary.totalSales / summary.completedOrders)
                              : formatCurrency(0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-8 text-muted-foreground">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      No hay ventas registradas en esta sesión
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Órdenes ({summary.totalOrders})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="text-sm text-gray-600">Total</div>
                      <div className="text-xl font-bold">{summary.totalOrders}</div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-md">
                      <div className="text-sm text-green-600">Completadas</div>
                      <div className="text-xl font-bold">{summary.completedOrders}</div>
                      <div className="text-sm">
                        {summary.totalOrders > 0
                          ? `${((summary.completedOrders / summary.totalOrders) * 100).toFixed(1)}%`
                          : "0%"}
                      </div>
                    </div>

                    <div className="bg-red-50 p-4 rounded-md">
                      <div className="text-sm text-red-600">Canceladas</div>
                      <div className="text-xl font-bold">{summary.canceledOrders}</div>
                      <div className="text-sm">
                        {summary.totalOrders > 0
                          ? `${((summary.canceledOrders / summary.totalOrders) * 100).toFixed(1)}%`
                          : "0%"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Órdenes ({orders.length})</CardTitle>
                  <CardDescription>Órdenes procesadas durante esta sesión</CardDescription>
                </CardHeader>
                <CardContent>
                  {orders.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Número</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Pago</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order: any) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">{order.orderNumber}</TableCell>
                              <TableCell>
                                {new Date(
                                  typeof order.createdAt === "object" && order.createdAt.toDate
                                    ? order.createdAt.toDate()
                                    : order.createdAt,
                                ).toLocaleString()}
                              </TableCell>
                              <TableCell>{formatCurrency(order.total || 0)}</TableCell>
                              <TableCell>
                                <Badge
                                  className={
                                    order.status === "completed"
                                      ? "bg-green-100 text-green-800"
                                      : order.status === "cancelled"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-blue-100 text-blue-800"
                                  }
                                >
                                  {order.status === "completed"
                                    ? "Completada"
                                    : order.status === "cancelled"
                                      ? "Cancelada"
                                      : order.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {order.paymentMethod === "cash"
                                    ? "Efectivo"
                                    : order.paymentMethod === "card"
                                      ? "Tarjeta"
                                      : order.paymentMethod === "transfer"
                                        ? "Transferencia"
                                        : "Otro"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-8 text-muted-foreground">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      No hay órdenes completadas en esta sesión
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
