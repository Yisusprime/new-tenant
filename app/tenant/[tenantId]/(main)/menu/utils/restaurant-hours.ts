interface DaySchedule {
  day: string
  isOpen: boolean
  openTime: string
  closeTime: string
}

// Función para verificar si el restaurante está abierto actualmente
export function isRestaurantOpen(schedule: DaySchedule[]): boolean {
  if (!schedule || schedule.length === 0) {
    console.log("No hay horarios configurados")
    return false
  }

  const now = new Date()
  const currentDay = getDayName(now.getDay())
  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

  console.log("Verificando horarios:", {
    currentDay,
    currentTime,
    schedule: schedule.map((s) => ({ day: s.day, isOpen: s.isOpen, openTime: s.openTime, closeTime: s.closeTime })),
  })

  const todaySchedule = schedule.find((day) => day.day === currentDay)

  if (!todaySchedule) {
    console.log(`No se encontró horario para ${currentDay}`)
    return false
  }

  console.log("Horario de hoy:", todaySchedule)

  if (!todaySchedule.isOpen) {
    console.log(`Restaurante cerrado hoy (${currentDay})`)
    return false
  }

  const isInRange = isTimeInRange(currentTime, todaySchedule.openTime, todaySchedule.closeTime)
  console.log(
    `¿Está en rango? ${isInRange} (${currentTime} entre ${todaySchedule.openTime} y ${todaySchedule.closeTime})`,
  )

  return isInRange
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
  console.log(`Verificando si ${time} está entre ${start} y ${end}`)

  // Convertir a minutos para facilitar la comparación
  const timeMinutes = convertTimeToMinutes(time)
  const startMinutes = convertTimeToMinutes(start)
  const endMinutes = convertTimeToMinutes(end)

  console.log(`En minutos: ${timeMinutes} entre ${startMinutes} y ${endMinutes}`)

  // Si el horario cruza la medianoche (ej: 22:00 - 02:00)
  if (startMinutes > endMinutes) {
    const result = timeMinutes >= startMinutes || timeMinutes <= endMinutes
    console.log(`Horario cruza medianoche: ${result}`)
    return result
  }

  // Horario normal
  const result = timeMinutes >= startMinutes && timeMinutes <= endMinutes
  console.log(`Horario normal: ${result}`)
  return result
}

// Función auxiliar para convertir hora (HH:MM) a minutos
function convertTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number)
  const totalMinutes = hours * 60 + minutes
  console.log(`${time} = ${totalMinutes} minutos`)
  return totalMinutes
}

// Función para obtener información detallada del estado actual
export function getRestaurantStatusInfo(schedule: DaySchedule[]) {
  if (!schedule || schedule.length === 0) {
    return {
      isOpen: false,
      currentDay: getDayName(new Date().getDay()),
      currentTime: `${new Date().getHours().toString().padStart(2, "0")}:${new Date().getMinutes().toString().padStart(2, "0")}`,
      todaySchedule: null,
      reason: "No hay horarios configurados",
    }
  }

  const now = new Date()
  const currentDay = getDayName(now.getDay())
  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
  const todaySchedule = schedule.find((day) => day.day === currentDay)

  let reason = ""
  let isOpen = false

  if (!todaySchedule) {
    reason = `No se encontró horario para ${currentDay}`
  } else if (!todaySchedule.isOpen) {
    reason = `Cerrado los ${currentDay}s`
  } else {
    isOpen = isTimeInRange(currentTime, todaySchedule.openTime, todaySchedule.closeTime)
    if (!isOpen) {
      reason = `Fuera del horario (${todaySchedule.openTime} - ${todaySchedule.closeTime})`
    } else {
      reason = "Abierto"
    }
  }

  return {
    isOpen,
    currentDay,
    currentTime,
    todaySchedule,
    reason,
    schedule,
  }
}
