"use client"

import type React from "react"

import { forwardRef, useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { Button } from "@/components/ui/button"
import type { Order } from "@/lib/types/order"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Utensils } from "lucide-react"

interface KitchenOrderProps {
  order: Order
  restaurantName: string
  showPrintButton?: boolean
  onPrint?: () => void
}

export const KitchenOrder = forwardRef<HTMLDivElement, KitchenOrderProps>(
  ({ order, restaurantName, showPrintButton = true, onPrint }, ref) => {
    const commandRef = useRef<HTMLDivElement>(null)
    const localRef = ref || commandRef

    const handlePrint = useReactToPrint({
      content: () => (localRef as React.RefObject<HTMLDivElement>).current,
      documentTitle: `Comanda-${order.orderNumber}`,
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
        local: "CONSUMO EN LOCAL",
        takeaway: "PARA LLEVAR",
        table: `MESA ${order.tableNumber || ""}`,
        delivery: "DELIVERY",
      }
      return typeMap[type] || type
    }

    return (
      <div className="flex flex-col">
        {showPrintButton && (
          <div className="mb-4 flex justify-end">
            <Button onClick={handlePrint} variant="outline" size="icon">
              <Utensils className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div
          ref={localRef as React.RefObject<HTMLDivElement>}
          className="bg-white p-6 w-[300px] mx-auto font-mono text-sm"
          style={{ minHeight: "200px" }}
        >
          {/* Encabezado de la comanda */}
          <div className="text-center mb-4">
            <h2 className="font-bold text-base">{restaurantName}</h2>
            <div className="border-t border-b border-dashed border-gray-300 my-2 py-1">
              <p className="font-bold">COMANDA #{order.orderNumber}</p>
              <p className="text-xs">{formatDate(order.createdAt)}</p>
            </div>
            <p className="text-xs font-bold">{getOrderTypeText(order.type)}</p>
          </div>

          {/* Información del cliente para delivery o mesa */}
          {order.type === "delivery" && (
            <div className="mb-3 text-xs">
              <p className="font-bold">Cliente: {order.customerName || "No especificado"}</p>
              {order.customerPhone && <p>Tel: {order.customerPhone}</p>}
            </div>
          )}

          {order.type === "table" && (
            <div className="mb-3 text-xs">
              <p className="font-bold">Mesa: {order.tableNumber}</p>
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
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td className="align-top font-bold">{item.quantity}x</td>
                    <td>
                      <div>
                        <p className="font-bold">{item.name}</p>
                        {item.extras && item.extras.length > 0 && (
                          <ul className="list-disc list-inside pl-2 text-[10px]">
                            {item.extras.map((extra, i) => (
                              <li key={i}>{extra.name}</li>
                            ))}
                          </ul>
                        )}
                        {item.notes && <p className="text-[10px] italic">Nota: {item.notes}</p>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pie de página */}
          <div className="mt-4 text-center text-xs border-t border-dashed border-gray-300 pt-2">
            <p className="font-bold">PREPARAR INMEDIATAMENTE</p>
            <p className="mt-1 text-[10px]">
              {order.status === "pending" ? "NUEVO PEDIDO" : order.status.toUpperCase()}
            </p>
          </div>
        </div>
      </div>
    )
  },
)

KitchenOrder.displayName = "KitchenOrder"

export default KitchenOrder
