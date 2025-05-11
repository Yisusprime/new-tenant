import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea un valor numérico como moneda
 * @param value - El valor a formatear
 * @param currency - El código de moneda (por defecto 'USD')
 * @param locale - El locale a usar para el formato (por defecto 'es-MX')
 * @returns String formateado como moneda
 */
export function formatCurrency(value: number, currency = "USD", locale = "es-MX"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Formatea una fecha ISO a un formato legible
 * @param dateString - Fecha en formato ISO string
 * @param locale - El locale a usar (por defecto 'es-MX')
 * @returns String de fecha formateada
 */
export function formatDate(dateString: string, locale = "es-MX"): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

/**
 * Trunca un texto a una longitud máxima
 * @param text - El texto a truncar
 * @param maxLength - Longitud máxima (por defecto 100)
 * @returns Texto truncado con elipsis si es necesario
 */
export function truncateText(text: string, maxLength = 100): string {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

/**
 * Genera un ID único
 * @returns String con ID único
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

/**
 * Convierte un objeto a parámetros de URL
 * @param params - Objeto con parámetros
 * @returns String de parámetros URL
 */
export function objectToUrlParams(params: Record<string, any>): string {
  return Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&")
}
