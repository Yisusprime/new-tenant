"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { ref, get } from "firebase/database"
import { rtdb } from "@/lib/firebase-config"
import { useAuth } from "@/lib/auth-context"

// Importamos Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js"
import { Bar, Line, Pie } from "react-chartjs-2"

// Registramos los componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement)

type ChartPeriod = "day" | "week" | "month" | "year"
type ChartType = "bar" | "line" | "pie"

interface SalesDataPoint {
  label: string
  totalSales: number
  cashSales: number
  cardSales: number
  transferSales: number
  otherSales: number
  orders: number
}

export function SalesChart() {
  const { user } = useAuth()
  const [period, setPeriod] = useState<ChartPeriod>("week")
  const [chartType, setChartType] = useState<ChartType>("bar")
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSalesData = async () => {
      if (!user?.tenantId) {
        setLoading(false)
        setError("No se encontró ID de tenant")
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Obtener todas las órdenes
        const ordersRef = ref(rtdb, `tenants/${user.tenantId}/orders`)
        const ordersSnapshot = await get(ordersRef)

        if (!ordersSnapshot.exists()) {
          setSalesData([])
          setLoading(false)
          return
        }

        const ordersData = ordersSnapshot.val()
        const orders = Object.values(ordersData) as any[]

        // Filtrar solo órdenes completadas
        const completedOrders = orders.filter((order) => order.status === "completed")

        // Preparar datos según el período seleccionado
        let formattedData: SalesDataPoint[] = []

        const now = new Date()

        switch (period) {
          case "day":
            // Datos por hora para el día actual
            formattedData = getHourlyData(completedOrders, now)
            break
          case "week":
            // Datos por día para la semana actual
            formattedData = getDailyData(completedOrders, now, 7)
            break
          case "month":
            // Datos por semana para el mes actual
            formattedData = getWeeklyData(completedOrders, now)
            break
          case "year":
            // Datos por mes para el año actual
            formattedData = getMonthlyData(completedOrders, now)
            break
        }

        setSalesData(formattedData)
      } catch (err) {
        console.error("Error al obtener datos de ventas:", err)
        setError("Error al cargar los datos de ventas")
      } finally {
        setLoading(false)
      }
    }

    fetchSalesData()
  }, [period, user?.tenantId])

  // Función para obtener datos por hora
  const getHourlyData = (orders: any[], date: Date) => {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    // Crear array con 24 horas
    const hourlyData: SalesDataPoint[] = Array.from({ length: 24 }, (_, i) => ({
      label: `${i}:00`,
      totalSales: 0,
      cashSales: 0,
      cardSales: 0,
      transferSales: 0,
      otherSales: 0,
      orders: 0,
    }))

    // Filtrar órdenes del día actual
    const dayOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= startOfDay && orderDate <= endOfDay
    })

    // Agrupar por hora
    dayOrders.forEach((order) => {
      const orderDate = new Date(order.createdAt)
      const hour = orderDate.getHours()

      hourlyData[hour].totalSales += order.total || 0
      hourlyData[hour].orders += 1

      switch (order.paymentMethod) {
        case "cash":
          hourlyData[hour].cashSales += order.total || 0
          break
        case "card":
          hourlyData[hour].cardSales += order.total || 0
          break
        case "transfer":
          hourlyData[hour].transferSales += order.total || 0
          break
        default:
          hourlyData[hour].otherSales += order.total || 0
          break
      }
    })

    // Filtrar solo horas con actividad para un gráfico más limpio
    return hourlyData.filter((hour) => hour.orders > 0)
  }

  // Función para obtener datos por día
  const getDailyData = (orders: any[], endDate: Date, days: number) => {
    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
    const dailyData: SalesDataPoint[] = []

    // Crear array con los últimos 'days' días
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(endDate)
      date.setDate(date.getDate() - i)

      const dayOfWeek = date.getDay()
      const dayOfMonth = date.getDate()

      dailyData.push({
        label: `${dayNames[dayOfWeek]} ${dayOfMonth}`,
        totalSales: 0,
        cashSales: 0,
        cardSales: 0,
        transferSales: 0,
        otherSales: 0,
        orders: 0,
      })
    }

    // Filtrar órdenes de los últimos 'days' días
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - (days - 1))
    startDate.setHours(0, 0, 0, 0)

    const filteredOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= startDate && orderDate <= endDate
    })

    // Agrupar por día
    filteredOrders.forEach((order) => {
      const orderDate = new Date(order.createdAt)
      const dayDiff = Math.floor((endDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24))
      const index = days - 1 - dayDiff

      if (index >= 0 && index < days) {
        dailyData[index].totalSales += order.total || 0
        dailyData[index].orders += 1

        switch (order.paymentMethod) {
          case "cash":
            dailyData[index].cashSales += order.total || 0
            break
          case "card":
            dailyData[index].cardSales += order.total || 0
            break
          case "transfer":
            dailyData[index].transferSales += order.total || 0
            break
          default:
            dailyData[index].otherSales += order.total || 0
            break
        }
      }
    })

    return dailyData
  }

  // Función para obtener datos por semana
  const getWeeklyData = (orders: any[], date: Date) => {
    const now = new Date(date)
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    // Determinar el primer día del mes
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1)

    // Determinar el último día del mes
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)

    // Crear array con semanas del mes
    const weeklyData: SalesDataPoint[] = []
    const currentDate = new Date(firstDayOfMonth)

    let weekNumber = 1
    while (currentDate <= lastDayOfMonth) {
      weeklyData.push({
        label: `Semana ${weekNumber}`,
        totalSales: 0,
        cashSales: 0,
        cardSales: 0,
        transferSales: 0,
        otherSales: 0,
        orders: 0,
      })

      // Avanzar 7 días
      currentDate.setDate(currentDate.getDate() + 7)
      weekNumber++
    }

    // Filtrar órdenes del mes actual
    const monthOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt)
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear
    })

    // Agrupar por semana
    monthOrders.forEach((order) => {
      const orderDate = new Date(order.createdAt)
      const dayOfMonth = orderDate.getDate()

      // Determinar a qué semana pertenece
      const weekIndex = Math.floor((dayOfMonth - 1) / 7)

      if (weekIndex < weeklyData.length) {
        weeklyData[weekIndex].totalSales += order.total || 0
        weeklyData[weekIndex].orders += 1

        switch (order.paymentMethod) {
          case "cash":
            weeklyData[weekIndex].cashSales += order.total || 0
            break
          case "card":
            weeklyData[weekIndex].cardSales += order.total || 0
            break
          case "transfer":
            weeklyData[weekIndex].transferSales += order.total || 0
            break
          default:
            weeklyData[weekIndex].otherSales += order.total || 0
            break
        }
      }
    })

    return weeklyData
  }

  // Función para obtener datos por mes
  const getMonthlyData = (orders: any[], date: Date) => {
    const currentYear = date.getFullYear()
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

    // Crear array con los 12 meses
    const monthlyData: SalesDataPoint[] = monthNames.map((month) => ({
      label: month,
      totalSales: 0,
      cashSales: 0,
      cardSales: 0,
      transferSales: 0,
      otherSales: 0,
      orders: 0,
    }))

    // Filtrar órdenes del año actual
    const yearOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt)
      return orderDate.getFullYear() === currentYear
    })

    // Agrupar por mes
    yearOrders.forEach((order) => {
      const orderDate = new Date(order.createdAt)
      const month = orderDate.getMonth()

      monthlyData[month].totalSales += order.total || 0
      monthlyData[month].orders += 1

      switch (order.paymentMethod) {
        case "cash":
          monthlyData[month].cashSales += order.total || 0
          break
        case "card":
          monthlyData[month].cardSales += order.total || 0
          break
        case "transfer":
          monthlyData[month].transferSales += order.total || 0
          break
        default:
          monthlyData[month].otherSales += order.total || 0
          break
      }
    })

    return monthlyData
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Cargando datos...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (salesData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Informe de Ventas</CardTitle>
              <CardDescription>No hay datos disponibles para el período seleccionado</CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={period} onValueChange={(value) => setPeriod(value as ChartPeriod)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Hoy</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mes</SelectItem>
                  <SelectItem value="year">Este año</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">No hay ventas registradas en este período</div>
        </CardContent>
      </Card>
    )
  }

  // Preparar datos para gráficos
  const labels = salesData.map((item) => item.label)
  const totalSales = salesData.map((item) => item.totalSales)
  const cashSales = salesData.map((item) => item.cashSales)
  const cardSales = salesData.map((item) => item.cardSales)

  const barData = {
    labels,
    datasets: [
      {
        label: "Ventas Totales",
        data: totalSales,
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
      },
      {
        label: "Efectivo",
        data: cashSales,
        backgroundColor: "rgba(16, 185, 129, 0.5)",
        borderColor: "rgb(16, 185, 129)",
        borderWidth: 1,
      },
      {
        label: "Tarjeta",
        data: cardSales,
        backgroundColor: "rgba(249, 115, 22, 0.5)",
        borderColor: "rgb(249, 115, 22)",
        borderWidth: 1,
      },
    ],
  }

  const lineData = {
    labels,
    datasets: [
      {
        label: "Ventas Totales",
        data: totalSales,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        tension: 0.1,
      },
      {
        label: "Efectivo",
        data: cashSales,
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.5)",
        tension: 0.1,
      },
      {
        label: "Tarjeta",
        data: cardSales,
        borderColor: "rgb(249, 115, 22)",
        backgroundColor: "rgba(249, 115, 22, 0.5)",
        tension: 0.1,
      },
    ],
  }

  // Para el gráfico de pastel, usamos el total acumulado por tipo
  const totalCash = cashSales.reduce((sum, val) => sum + val, 0)
  const totalCard = cardSales.reduce((sum, val) => sum + val, 0)

  const pieData = {
    labels: ["Efectivo", "Tarjeta"],
    datasets: [
      {
        data: [totalCash, totalCard],
        backgroundColor: ["rgba(16, 185, 129, 0.5)", "rgba(249, 115, 22, 0.5)"],
        borderColor: ["rgb(16, 185, 129)", "rgb(249, 115, 22)"],
        borderWidth: 1,
      },
    ],
  }

  // Calcular totales para el resumen
  const totalSalesSum = totalSales.reduce((sum, val) => sum + val, 0)
  const totalCashSum = cashSales.reduce((sum, val) => sum + val, 0)
  const totalCardSum = cardSales.reduce((sum, val) => sum + val, 0)

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Informe de Ventas</CardTitle>
            <CardDescription>Visualización de ventas por período</CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={period} onValueChange={(value) => setPeriod(value as ChartPeriod)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Seleccionar período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Hoy</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
                <SelectItem value="year">Este año</SelectItem>
              </SelectContent>
            </Select>

            <Select value={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo de gráfico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Barras</SelectItem>
                <SelectItem value="line">Líneas</SelectItem>
                <SelectItem value="pie">Circular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-80">
          {chartType === "bar" && <Bar data={barData} options={{ maintainAspectRatio: false }} />}
          {chartType === "line" && <Line data={lineData} options={{ maintainAspectRatio: false }} />}
          {chartType === "pie" && <Pie data={pieData} options={{ maintainAspectRatio: false }} />}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-md">
            <div className="text-sm text-blue-600">Ventas Totales</div>
            <div className="text-2xl font-bold">{formatCurrency(totalSalesSum)}</div>
          </div>

          <div className="bg-green-50 p-4 rounded-md">
            <div className="text-sm text-green-600">Efectivo</div>
            <div className="text-2xl font-bold">{formatCurrency(totalCashSum)}</div>
            <div className="text-xs text-green-600">
              {totalSalesSum > 0 ? Math.round((totalCashSum / totalSalesSum) * 100) : 0}% del total
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-md">
            <div className="text-sm text-orange-600">Tarjeta</div>
            <div className="text-2xl font-bold">{formatCurrency(totalCardSum)}</div>
            <div className="text-xs text-orange-600">
              {totalSalesSum > 0 ? Math.round((totalCardSum / totalSalesSum) * 100) : 0}% del total
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
