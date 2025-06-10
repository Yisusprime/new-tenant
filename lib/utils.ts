import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea un valor numérico como moneda según la configuración regional
 * @param value - El valor a formatear
 * @param locale - La configuración regional (por defecto 'es-CL')
 * @param currency - El código de moneda (por defecto 'CLP')
 * @returns String formateado como moneda
 */
export function formatCurrency(value: number, locale = "es-CL", currency = "CLP"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Formatea una fecha y hora según la configuración regional
 * @param date - La fecha a formatear
 * @param locale - La configuración regional (por defecto 'es-CL')
 * @returns String formateado con fecha y hora
 */
export function formatDateTime(date: Date | string | number, locale = "es-CL"): string {
  const dateObj = typeof date === "string" || typeof date === "number" ? new Date(date) : date

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(dateObj)
}

/**
 * Formatea una fecha según la configuración regional
 * @param date - La fecha a formatear
 * @param locale - La configuración regional (por defecto 'es-CL')
 * @returns String formateado con fecha
 */
export function formatDate(date: Date | string | number, locale = "es-CL"): string {
  const dateObj = typeof date === "string" || typeof date === "number" ? new Date(date) : date

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(dateObj)
}

/**
 * Obtiene el ID de la sucursal actual desde localStorage o contexto
 * @returns El ID de la sucursal actual o null si no está disponible
 */
export function getCurrentBranchId(): string | null {
  if (typeof window === "undefined") return null

  try {
    const branchId = localStorage.getItem("currentBranchId")
    return branchId
  } catch (error) {
    console.error("Error getting current branch ID:", error)
    return null
  }
}

/**
 * Establece el ID de la sucursal actual en localStorage
 * @param branchId - El ID de la sucursal a establecer
 */
export function setCurrentBranchId(branchId: string): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem("currentBranchId", branchId)
  } catch (error) {
    console.error("Error setting current branch ID:", error)
  }
}
