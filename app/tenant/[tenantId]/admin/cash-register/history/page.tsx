"use client"

import { useState, useEffect } from "react"
// Actualizar la importación del hook useAuth si se está utilizando
import { useAuth } from "@/hooks/use-auth"
import { useBranch } from "@/lib/context/branch-context"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils"
import { getCashRegisters } from "@/lib/services/cash-register-service"
import type { CashRegister } from "@/lib/types/cash-register"
import { CashMovementsList } from "@/components/cash-movements-list"
import { CashRegisterSummary } from "@/components/cash-register-summary"
import { ArrowLeft, Calendar, RefreshCw, Search } from "lucide-react"
import Link from "next/link"

export default function CashRegisterHistoryPage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params
  const { currentBranch } = useBranch()
  const { user } = useAuth()
  const [registers, setRegisters] = useState<CashRegister[]>([])
  const [filteredRegisters, setFilteredRegisters] = useState<CashRegister[]>([])
  const [selectedRegister, setSelectedRegister] = useState<CashRegister | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Cargar datos
  const loadData = async () => {
    if (!currentBranch) return

    try {
      setLoading(true)
      const allRegisters = await getCashRegisters(tenantId, currentBranch.id)
      setRegisters(allRegisters)
      applyFilters(allRegisters, searchTerm, startDate, endDate)
    } catch (error) {
      console.error("Error al cargar datos:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentBranch) {
      loadData()
    }
  }, [tenantId, currentBranch])

  // Aplicar filtros
  const applyFilters = (regs: CashRegister[], search: string, start: string, end: string) => {
    let filtered = [...regs]

    // Filtrar por término de búsqueda
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (reg) =>
          reg.name.toLowerCase().includes(searchLower) ||
          (reg.description && reg.description.toLowerCase().includes(searchLower)),
      )
    }

    // Filtrar por fecha de inicio
    if (start) {
      const startDate = new Date(start)
      filtered = filtered.filter((reg) => new Date(reg.createdAt) >= startDate)
    }

    // Filtrar por fecha de fin
    if (end) {
      const endDate = new Date(end)
      endDate.setHours(23, 59, 59, 999) // Establecer al final del día
      filtered = filtered.filter((reg) => new Date(reg.createdAt) <= endDate)
    }

    setFilteredRegisters(filtered)
  }

  // Manejar cambios en los filtros
  useEffect(() => {
    applyFilters(registers, searchTerm, startDate, endDate)
  }, [registers, searchTerm, startDate, endDate])

  // Manejar la selección de una caja
  const handleSelectRegister = (register: CashRegister) => {
    setSelectedRegister(register)
  }

  // Obtener el color y texto según el estado de la caja
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      open: { color: "bg-green-100 text-green-800", text: "Abierta" },
      closed: { color: "bg-gray-100 text-gray-800", text: "Cerrada" },
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Pendiente" },
    }

    return statusMap[status] || { color: "bg-gray-100 text-gray-800", text: status }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href={`/tenant/${tenantId}/admin/cash-register`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Historial de Cajas</h1>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      <NoBranchSelectedAlert />

      {currentBranch && (
        <>
          {selectedRegister ? (
            // Vista de detalle de caja
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={() => setSelectedRegister(null)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al listado
                </Button>
                <div>
                  <Badge className={getStatusBadge(selectedRegister.status).color}>
                    {getStatusBadge(selectedRegister.status).text}
                  </Badge>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{selectedRegister.name}</CardTitle>
                  <CardDescription>{selectedRegister.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Fecha de Apertura</h3>
                      <p className="text-base">{formatDateTime(selectedRegister.openedAt)}</p>
                    </div>
                    {selectedRegister.closedAt && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Fecha de Cierre</h3>
                        <p className="text-base">{formatDateTime(selectedRegister.closedAt)}</p>
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Balance Inicial</h3>
                      <p className="text-base font-medium">{formatCurrency(selectedRegister.initialBalance)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Balance Final</h3>
                      <p className="text-base font-bold">{formatCurrency(selectedRegister.currentBalance)}</p>
                    </div>
                  </div>

                  {selectedRegister.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Notas</h3>
                      <p className="text-sm whitespace-pre-line">{selectedRegister.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <CashRegisterSummary
                    tenantId={tenantId}
                    branchId={currentBranch.id}
                    registerId={selectedRegister.id}
                  />
                </div>
                <div>
                  <CashMovementsList tenantId={tenantId} branchId={currentBranch.id} registerId={selectedRegister.id} />
                </div>
              </div>
            </div>
          ) : (
            // Vista de listado de cajas
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="col-span-1">
                  <Label htmlFor="search" className="mb-2 block">
                    Buscar
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      id="search"
                      type="search"
                      placeholder="Buscar por nombre..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="startDate" className="mb-2 block">
                    Fecha Inicio
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      id="startDate"
                      type="date"
                      className="pl-8"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="endDate" className="mb-2 block">
                    Fecha Fin
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      id="endDate"
                      type="date"
                      className="pl-8"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-48 w-full" />
                </div>
              ) : filteredRegisters.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-gray-500">No se encontraron cajas con los filtros aplicados</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRegisters.map((register) => {
                    const statusBadge = getStatusBadge(register.status)
                    return (
                      <Card
                        key={register.id}
                        className="cursor-pointer hover:border-primary transition-colors"
                        onClick={() => handleSelectRegister(register)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{register.name}</CardTitle>
                            <Badge className={statusBadge.color}>{statusBadge.text}</Badge>
                          </div>
                          <CardDescription>{formatDate(register.createdAt)}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">Balance Inicial:</span>
                              <span className="font-medium">{formatCurrency(register.initialBalance)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">
                                {register.status === "closed" ? "Balance Final:" : "Balance Actual:"}
                              </span>
                              <span className="font-bold text-lg">{formatCurrency(register.currentBalance)}</span>
                            </div>
                            {register.status === "closed" && register.expectedFinalBalance !== undefined && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Diferencia:</span>
                                <span
                                  className={`font-medium ${
                                    register.currentBalance !== register.expectedFinalBalance
                                      ? register.currentBalance > register.expectedFinalBalance
                                        ? "text-green-600"
                                        : "text-red-600"
                                      : ""
                                  }`}
                                >
                                  {formatCurrency(register.currentBalance - register.expectedFinalBalance)}
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
