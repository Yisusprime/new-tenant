"use client"

import type React from "react"

import { forwardRef, useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { Printer } from "lucide-react"
import type { Order } from "@/lib/types/order"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface OrderTicketProps {
  order: Order
  restaurantName: string
  restaurantAddress?: string
  restaurantPhone?: string
  restaurantLogo?: string
  showPrintButton?: boolean
  onPrint?: () => void
}

export const OrderTicket = forwardRef<HTMLDivElement, OrderTicketProps>(
  (
    { order, restaurantName, restaurantAddress, restaurantPhone, restaurantLogo, showPrintButton = true, onPrint },
    ref,
  ) => {
    const ticketRef = useRef<HTMLDivElement>(null)
    const localRef = ref || ticketRef

    const handlePrint = useReactToPrint({
      content: () => (localRef as React.RefObject<HTMLDivElement>).current,
      documentTitle: `Ticket-${order.orderNumber}`,
      onAfterPrint: onPrint,
    })

    const formatDate = (dateString: string) => {
      try {
        return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: es })
      } catch (error) {
        return dateString
      }
    }

    const getOrderTypeText = (type: string) => {
      const typeMap: Record<string, string> = {
        local: "Consumo en local",
        takeaway: "Para llevar",
        table: `Mesa ${order.tableNumber || ""}`,
        delivery: "Delivery",
      }
      return typeMap[type] || type
    }

    return (
      <div className="flex flex-col">
        {showPrintButton && (
          <div className="mb-4 flex justify-end">
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Printer className="mr-2 h-4 w-4" />
              Imprimir Ticket
            </Button>
          </div>
        )}

        <div
          ref={localRef as React.RefObject<HTMLDivElement>}
          className="bg-white p-6 w-[300px] mx-auto font-mono text-sm"
          style={{ minHeight: "200px" }}
        >
          {/* Encabezado del ticket */}
          <div className="text-center mb-4">
            {restaurantLogo && (
              <div className="flex justify-center mb-2">
                <img src={restaurantLogo || "/placeholder.svg"} alt={restaurantName} className="h-12 object-contain" />
              </div>
            )}
            <h2 className="font-bold text-base">{restaurantName}</h2>
            {restaurantAddress && <p className="text-xs">{restaurantAddress}</p>}
            {restaurantPhone && <p className="text-xs">Tel: {restaurantPhone}</p>}
            <div className="border-t border-b border-dashed border-gray-300 my-2 py-1">
              <p className="font-bold">TICKET #{order.orderNumber}</p>
              <p className="text-xs">{formatDate(order.createdAt)}</p>
            </div>
            <p className="text-xs font-bold">{getOrderTypeText(order.type)}</p>
          </div>

          {/* Información del cliente */}
          {(order.customerName || order.customerPhone) && (
            <div className="mb-3 text-xs">
              <p className="font-bold">Cliente:</p>
              {order.customerName && <p>{order.customerName}</p>}
              {order.customerPhone && <p>Tel: {order.customerPhone}</p>}
              {order.type === "delivery" && order.deliveryAddress && (
                <div>
                  <p className="font-bold mt-1">Dirección:</p>
                  <p>
                    {order.deliveryAddress.street} {order.deliveryAddress.number}
                  </p>
                  {order.deliveryAddress.notes && <p>Notas: {order.deliveryAddress.notes}</p>}
                </div>
              )}
            </div>
          )}

          {/* Línea divisoria */}
          <div className="border-t border-dashed border-gray-300 my-2"></div>

          {/* Artículos del pedido */}
          <div className="mb-3">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left">Cant</th>
                  <th className="text-left">Artículo</th>
                  <th className="text-right">Precio</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td className="align-top">{item.quantity}x</td>
                    <td>
                      <div>
                        <p>{item.name}</p>
                        {item.extras && item.extras.length > 0 && (
                          <ul className="list-disc list-inside pl-2 text-[10px]">
                            {item.extras.map((extra, i) => (
                              <li key={i}>
                                {extra.name} ({formatCurrency(extra.price)})
                              </li>
                            ))}
                          </ul>
                        )}
                        {item.notes && <p className="text-[10px] italic">Nota: {item.notes}</p>}
                      </div>
                    </td>
                    <td className="text-right">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Línea divisoria */}
          <div className="border-t border-dashed border-gray-300 my-2"></div>

          {/* Resumen de precios */}
          <div className="text-xs">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>

            {/* Solo mostrar impuestos si están habilitados y no incluidos */}
            {order.taxEnabled && !order.taxIncluded && order.tax > 0 && (
              <div className="flex justify-between">
                <span>IVA:</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
            )}

            {order.tip && order.tip > 0 && (
              <div className="flex justify-between">
                <span>Propina:</span>
                <span>{formatCurrency(order.tip)}</span>
              </div>
            )}

            <div className="flex justify-between font-bold mt-1 text-sm">
              <span>TOTAL:</span>
              <span>{formatCurrency(order.total)}</span>
            </div>

            {/* Método de pago */}
            {order.paymentMethod && (
              <div className="mt-2">
                <p>Método de pago: {order.paymentMethod}</p>
                {order.cashDetails && (
                  <>
                    <div className="flex justify-between">
                      <span>Recibido:</span>
                      <span>{formatCurrency(order.cashDetails.amountReceived)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cambio:</span>
                      <span>{formatCurrency(order.cashDetails.change)}</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Pie de página */}
          <div className="mt-4 text-center text-xs border-t border-dashed border-gray-300 pt-2">
            <p>¡Gracias por su compra!</p>
            <p className="mt-1">Este documento no es un comprobante fiscal</p>
          </div>
        </div>
      </div>
    )
  },
)

OrderTicket.displayName = "OrderTicket"

export default OrderTicket
