import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currencyCode = "CLP"): string {
  // Para pesos chilenos, usar formato sin decimales y con punto como separador de miles
  if (currencyCode === "CLP") {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Para otras monedas, usar el formato estándar
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  if (typeof date === "string") {
    date = new Date(date)
  }
  return new Intl.DateTimeFormat("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

export function formatDateTime(date: Date | string): string {
  if (typeof date === "string") {
    date = new Date(date)
  }
  return new Intl.DateTimeFormat("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function formatTime(date: Date | string): string {
  if (typeof date === "string") {
    date = new Date(date)
  }
  return new Intl.DateTimeFormat("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `${timestamp}${random}`
}

export function calculateTimeElapsed(startTime: string): number {
  const start = new Date(startTime).getTime()
  const now = new Date().getTime()
  return Math.floor((now - start) / 1000) // Tiempo en segundos
}

export function formatTimeElapsed(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  } else {
    return `${remainingSeconds}s`
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "pending":
      return "bg-yellow-500"
    case "preparing":
      return "bg-blue-500"
    case "ready":
      return "bg-green-500"
    case "delivered":
      return "bg-purple-500"
    case "cancelled":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

export function getStatusText(status: string): string {
  switch (status) {
    case "pending":
      return "Pendiente"
    case "preparing":
      return "Preparando"
    case "ready":
      return "Listo"
    case "delivered":
      return "Entregado"
    case "cancelled":
      return "Cancelado"
    default:
      return "Desconocido"
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}
