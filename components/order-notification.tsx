"use client"

import { useState, useEffect } from "react"
import { Bell, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

interface OrderNotificationProps {
  show: boolean
  message: string
  orderId?: string
  tenantId?: string
  branchId?: string
  onClose: () => void
}

export function OrderNotification({ show, message, orderId, tenantId, branchId, onClose }: OrderNotificationProps) {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  // Efecto para manejar la visibilidad y el cierre automático
  useEffect(() => {
    if (show) {
      setIsVisible(true)

      // Vibrar el dispositivo si es compatible (móviles)
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200])
      }

      // Cerrar automáticamente después de 10 segundos
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300) // Dar tiempo a la animación de salida
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  // Manejar clic en la notificación
  const handleClick = () => {
    if (orderId && tenantId && branchId) {
      router.push(`/tenant/${tenantId}/admin/orders/${orderId}`)
    }
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  // Intentar mostrar una notificación del navegador
  useEffect(() => {
    if (show && "Notification" in window) {
      // Verificar si ya tenemos permiso
      if (Notification.permission === "granted") {
        try {
          const notification = new Notification("Nuevo Pedido", {
            body: message,
            icon: "/restaurant-logo.png",
          })

          notification.onclick = () => {
            if (orderId && tenantId && branchId) {
              router.push(`/tenant/${tenantId}/admin/orders/${orderId}`)
              window.focus()
            }
          }
        } catch (err) {
          console.error("Error al mostrar notificación del navegador:", err)
        }
      }
      // Solicitar permiso si no lo hemos pedido antes
      else if (Notification.permission !== "denied") {
        Notification.requestPermission()
      }
    }
  }, [show, message, orderId, tenantId, branchId, router])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 z-50 max-w-md"
          onClick={handleClick}
        >
          <div className="bg-green-600 text-white p-4 rounded-lg shadow-lg flex items-start cursor-pointer">
            <Bell className="h-6 w-6 mr-3 flex-shrink-0 animate-pulse" />
            <div className="flex-1">
              <h4 className="font-bold text-lg">¡Nuevo Pedido!</h4>
              <p>{message}</p>
              <p className="text-xs mt-1 text-green-100">Haz clic para ver detalles</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsVisible(false)
                setTimeout(onClose, 300)
              }}
              className="ml-2 text-white hover:text-green-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
