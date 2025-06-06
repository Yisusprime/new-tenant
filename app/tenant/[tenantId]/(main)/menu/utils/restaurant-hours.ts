interface DaySchedule {
  day: string
  isOpen: boolean
  openTime: string
  closeTime: string
}

// Función para verificar si el restaurante está abierto actualmente
export function isRestaurantOpen(schedule: DaySchedule[]): boolean {
  if (!schedule || schedule.length === 0) return false

  const now = new Date()
  const currentDay = getDayName(now.getDay())
  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

  const todaySchedule = schedule.find((day) => day.day === currentDay)

  if (!todaySchedule || !todaySchedule.isOpen) return false

  return isTimeInRange(currentTime, todaySchedule.openTime, todaySchedule.closeTime)
}

// Función para formatear el horario de un día
export function formatSchedule(day: DaySchedule): string {
  if (!day.isOpen) return "Cerrado"
  return `${day.openTime} - ${day.closeTime}`
}

// Función auxiliar para obtener el nombre del día en español
function getDayName(dayIndex: number): string {
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
  return days[dayIndex]
}

// Función auxiliar para verificar si una hora está dentro de un rango
function isTimeInRange(time: string, start: string, end: string): boolean {
  // Convertir a minutos para facilitar la comparación
  const timeMinutes = convertTimeToMinutes(time)
  const startMinutes = convertTimeToMinutes(start)
  const endMinutes = convertTimeToMinutes(end)

  // Si el horario cruza la medianoche (ej: 22:00 - 02:00)
  if (startMinutes > endMinutes) {
    return timeMinutes >= startMinutes || timeMinutes <= endMinutes
  }

  // Horario normal
  return timeMinutes >= startMinutes && timeMinutes <= endMinutes
}

// Función auxiliar para convertir hora (HH:MM) a minutos
function convertTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}
