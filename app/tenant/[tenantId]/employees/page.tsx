"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth, type UserRole } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserPlus, Pencil, Trash2 } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"

export default function EmployeesPage() {
  const params = useParams()
  const tenantId = params?.tenantId as string
  const router = useRouter()
  const { user, userProfile, loading: authLoading, updateUserRole, signUpTenantUser } = useAuth()

  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Estado para el diálogo de nuevo empleado
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    password: "",
    role: "waiter" as UserRole,
  })

  // Estado para el diálogo de edición
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editEmployee, setEditEmployee] = useState<any>(null)

  useEffect(() => {
    // Verificar si el usuario está autenticado y es admin
    if (!authLoading && (!user || (userProfile?.role !== "admin" && userProfile?.tenantId !== tenantId))) {
      router.push(`/tenant/${tenantId}/login`)
      return
    }

    if (user && tenantId) {
      fetchEmployees()
    }
  }, [user, userProfile, authLoading, tenantId, router])

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      // Consultar todos los usuarios que pertenecen a este tenant
      const q = query(collection(db, "users"), where("tenantId", "==", tenantId))
      const querySnapshot = await getDocs(q)

      const employeesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      setEmployees(employeesList)
    } catch (error: any) {
      console.error("Error fetching employees:", error)
      setError(error.message || "Error al cargar los empleados")
    } finally {
      setLoading(false)
    }
  }

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      await signUpTenantUser(newEmployee.email, newEmployee.password, newEmployee.name, newEmployee.role, tenantId)

      setSuccess("Empleado agregado correctamente")
      setIsAddDialogOpen(false)
      setNewEmployee({
        name: "",
        email: "",
        password: "",
        role: "waiter",
      })

      // Recargar la lista de empleados
      fetchEmployees()
    } catch (error: any) {
      console.error("Error adding employee:", error)
      setError(error.message || "Error al agregar empleado")
    }
  }

  const handleEditEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!editEmployee) return

    try {
      await updateUserRole(editEmployee.id, editEmployee.role as UserRole)

      setSuccess("Rol de empleado actualizado correctamente")
      setIsEditDialogOpen(false)
      setEditEmployee(null)

      // Recargar la lista de empleados
      fetchEmployees()
    } catch (error: any) {
      console.error("Error updating employee:", error)
      setError(error.message || "Error al actualizar empleado")
    }
  }

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este empleado? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      // No eliminamos realmente el usuario, solo lo desactivamos
      await updateDoc(doc(db, "users", employeeId), {
        active: false,
        deactivatedAt: new Date().toISOString(),
      })

      setSuccess("Empleado desactivado correctamente")

      // Recargar la lista de empleados
      fetchEmployees()
    } catch (error: any) {
      console.error("Error deleting employee:", error)
      setError(error.message || "Error al eliminar empleado")
    }
  }

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="container py-12">
          <p>Cargando...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gestión de Empleados</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                <span>Agregar Empleado</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Empleado</DialogTitle>
                <DialogDescription>Completa el formulario para agregar un nuevo empleado al sistema.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddEmployee} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input
                    id="name"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newEmployee.password}
                    onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <Select
                    value={newEmployee.role}
                    onValueChange={(value) => setNewEmployee({ ...newEmployee, role: value as UserRole })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="waiter">Mesero</SelectItem>
                      <SelectItem value="delivery">Repartidor</SelectItem>
                      <SelectItem value="manager">Gerente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="submit">Agregar Empleado</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Empleados</CardTitle>
            <CardDescription>Lista de todos los empleados registrados en el sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            {employees.length === 0 ? (
              <p className="text-center py-4">No hay empleados registrados</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Fecha de Registro</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            employee.role === "admin"
                              ? "bg-blue-100 text-blue-800"
                              : employee.role === "manager"
                                ? "bg-purple-100 text-purple-800"
                                : employee.role === "waiter"
                                  ? "bg-green-100 text-green-800"
                                  : employee.role === "delivery"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {employee.role === "admin"
                            ? "Administrador"
                            : employee.role === "manager"
                              ? "Gerente"
                              : employee.role === "waiter"
                                ? "Mesero"
                                : employee.role === "delivery"
                                  ? "Repartidor"
                                  : employee.role === "client"
                                    ? "Cliente"
                                    : "Usuario"}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(employee.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog
                            open={isEditDialogOpen && editEmployee?.id === employee.id}
                            onOpenChange={(open) => {
                              setIsEditDialogOpen(open)
                              if (!open) setEditEmployee(null)
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={() => setEditEmployee(employee)}
                              >
                                <Pencil className="h-3 w-3" />
                                <span>Editar</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Editar Empleado</DialogTitle>
                                <DialogDescription>Actualiza el rol del empleado.</DialogDescription>
                              </DialogHeader>
                              {editEmployee && (
                                <form onSubmit={handleEditEmployee} className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-name">Nombre</Label>
                                    <Input id="edit-name" value={editEmployee.name} disabled />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-email">Correo</Label>
                                    <Input id="edit-email" value={editEmployee.email} disabled />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-role">Rol</Label>
                                    <Select
                                      value={editEmployee.role}
                                      onValueChange={(value) => setEditEmployee({ ...editEmployee, role: value })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un rol" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="admin">Administrador</SelectItem>
                                        <SelectItem value="manager">Gerente</SelectItem>
                                        <SelectItem value="waiter">Mesero</SelectItem>
                                        <SelectItem value="delivery">Repartidor</SelectItem>
                                        <SelectItem value="client">Cliente</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <DialogFooter>
                                    <Button type="submit">Guardar Cambios</Button>
                                  </DialogFooter>
                                </form>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => handleDeleteEmployee(employee.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Eliminar</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
