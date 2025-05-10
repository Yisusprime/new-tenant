"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function ProfileAddresses({ tenantId, userId }: { tenantId: string; userId: string }) {
  const [addresses, setAddresses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentAddress, setCurrentAddress] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    street: "",
    number: "",
    city: "",
    state: "",
    zipCode: "",
    instructions: "",
  })

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const addressesRef = collection(db, `tenants/${tenantId}/users/${userId}/addresses`)
        const querySnapshot = await getDocs(addressesRef)
        const addressesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setAddresses(addressesData)
      } catch (error) {
        console.error("Error al obtener las direcciones:", error)
      } finally {
        setLoading(false)
      }
    }

    if (tenantId && userId) {
      fetchAddresses()
    }
  }, [tenantId, userId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const resetForm = () => {
    setFormData({
      name: "",
      street: "",
      number: "",
      city: "",
      state: "",
      zipCode: "",
      instructions: "",
    })
  }

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const addressesRef = collection(db, `tenants/${tenantId}/users/${userId}/addresses`)
      const docRef = await addDoc(addressesRef, {
        ...formData,
        createdAt: new Date().toISOString(),
      })

      setAddresses([...addresses, { id: docRef.id, ...formData }])
      setIsAddDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error al agregar dirección:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (address: any) => {
    setCurrentAddress(address)
    setFormData({
      name: address.name || "",
      street: address.street || "",
      number: address.number || "",
      city: address.city || "",
      state: address.state || "",
      zipCode: address.zipCode || "",
      instructions: address.instructions || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentAddress) return

    setLoading(true)

    try {
      const addressRef = doc(db, `tenants/${tenantId}/users/${userId}/addresses/${currentAddress.id}`)
      await updateDoc(addressRef, {
        ...formData,
        updatedAt: new Date().toISOString(),
      })

      setAddresses(
        addresses.map((addr) => (addr.id === currentAddress.id ? { id: currentAddress.id, ...formData } : addr)),
      )
      setIsEditDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error al actualizar dirección:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    setLoading(true)

    try {
      const addressRef = doc(db, `tenants/${tenantId}/users/${userId}/addresses/${addressId}`)
      await deleteDoc(addressRef)

      setAddresses(addresses.filter((addr) => addr.id !== addressId))
    } catch (error) {
      console.error("Error al eliminar dirección:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading && addresses.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Mis Direcciones</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Agregar Dirección
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nueva Dirección</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddAddress} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la dirección</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Casa, Trabajo, etc."
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Calle</Label>
                  <Input id="street" name="street" value={formData.street} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input id="number" name="number" value={formData.number} onChange={handleChange} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input id="city" name="city" value={formData.city} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input id="state" name="state" value={formData.state} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">Código Postal</Label>
                  <Input id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleChange} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instrucciones de entrega</Label>
                <Input
                  id="instructions"
                  name="instructions"
                  placeholder="Opcional"
                  value={formData.instructions}
                  onChange={handleChange}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No tienes direcciones guardadas</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <Card key={address.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>{address.name}</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(address)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente tu dirección.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteAddress(address.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  {address.street} {address.number}
                </p>
                <p>
                  {address.city}, {address.state} {address.zipCode}
                </p>
                {address.instructions && <p className="text-sm text-gray-500 mt-2">{address.instructions}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog para editar dirección */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Dirección</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateAddress} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre de la dirección</Label>
              <Input
                id="edit-name"
                name="name"
                placeholder="Casa, Trabajo, etc."
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-street">Calle</Label>
                <Input id="edit-street" name="street" value={formData.street} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-number">Número</Label>
                <Input id="edit-number" name="number" value={formData.number} onChange={handleChange} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-city">Ciudad</Label>
                <Input id="edit-city" name="city" value={formData.city} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-state">Estado</Label>
                <Input id="edit-state" name="state" value={formData.state} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-zipCode">Código Postal</Label>
                <Input id="edit-zipCode" name="zipCode" value={formData.zipCode} onChange={handleChange} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-instructions">Instrucciones de entrega</Label>
              <Input
                id="edit-instructions"
                name="instructions"
                placeholder="Opcional"
                value={formData.instructions}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Actualizar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
