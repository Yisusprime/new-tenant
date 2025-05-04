"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCashier } from "./cashier-context"
import { formatCurrency } from "@/lib/utils"

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

export function SalesChart() {
  const { getSalesData } = useCashier()
  const [period, setPeriod] = useState<ChartPeriod>("week")
  const [chartType, setChartType] = useState<ChartType>("bar")
  const [salesData, setSalesData] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      const data = await getSalesData(period)
      setSalesData(data)
    }

    fetchData()
  }, [period, getSalesData])

  if (!salesData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Cargando datos...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  // Preparar datos para gráficos
  const labels = salesData.map((item: any) => item.label)
  const totalSales = salesData.map((item: any) => item.totalSales)
  const cashSales = salesData.map((item: any) => item.cashSales)
  const cardSales = salesData.map((item: any) => item.cardSales)

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
  const totalCash = cashSales.reduce((sum: number, val: number) => sum + val, 0)
  const totalCard = cardSales.reduce((sum: number, val: number) => sum + val, 0)

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
  const totalSalesSum = totalSales.reduce((sum: number, val: number) => sum + val, 0)
  const totalCashSum = cashSales.reduce((sum: number, val: number) => sum + val, 0)
  const totalCardSum = cardSales.reduce((sum: number, val: number) => sum + val, 0)

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
            <div className="text-xs text-green-600">{Math.round((totalCashSum / totalSalesSum) * 100)}% del total</div>
          </div>

          <div className="bg-orange-50 p-4 rounded-md">
            <div className="text-sm text-orange-600">Tarjeta</div>
            <div className="text-2xl font-bold">{formatCurrency(totalCardSum)}</div>
            <div className="text-xs text-orange-600">{Math.round((totalCardSum / totalSalesSum) * 100)}% del total</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
