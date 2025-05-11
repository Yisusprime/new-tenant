"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"

interface VisualNotificationProps {
  show: boolean
  message: string
  onClose: () => void
}

export function VisualNotification({ show, message, onClose }: VisualNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false)
        onClose()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
      <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg flex items-start max-w-md">
        <div className="flex-shrink-0 mr-3">
          <Bell className="h-6 w-6 text-green-500 animate-pulse" />
        </div>
        <div>
          <p className="font-bold">¡Nuevo pedido!</p>
          <p className="text-sm">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            onClose()
          }}
          className="ml-auto -mt-1 -mr-1 text-green-700 hover:text-green-900"
        >
          &times;
        </button>
      </div>
    </div>
  )
}
