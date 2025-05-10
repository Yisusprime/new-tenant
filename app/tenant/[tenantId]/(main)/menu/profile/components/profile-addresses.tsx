"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Plus, MapPin, Pencil, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"

interface ProfileAddressesProps {
  tenantId: string
  userId: string
}

export function ProfileAddresses({ tenantId, userId }: ProfileAddressesProps) {
  const [addresses, setAddresses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    instructions: "",
    isDefault: false,
  })

  useEffect(() => {
    fetchAddresses()
  }, [tenantId, userId])

  const fetchAddresses = async () => {
    try {
      setLoading(true)
      const addressesRef = collection(db, `tenants/${tenantId}/users/${userId}/addresses`)
      const querySnapshot = await getDocs(addressesRef)

      const addressesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      setAddresses(addressesData)
    } catch (error) {
      console.error("Error al cargar las direcciones:", error)
      toast.error("Error al cargar las direcciones")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const addressData = {
        ...formData,
        userId,
        createdAt: new Date(),
      }

      if (editingAddress) {
        // Actualizar dirección existente
        await setDoc(
          doc(db, `tenants/${tenantId}/users/${userId}/addresses`, editingAddress.id),
          {
            ...addressData,
            updatedAt: new Date(),
          },
          { merge: true },
        )
        toast.success("Dirección actualizada correctamente")
      } else {
        // Crear nueva dirección
        const newAddressRef = doc(collection(db, `tenants/${tenantId}/users/${userId}/addresses`))
        await setDoc(newAddressRef, {
          ...addressData,
          id: newAddressRef.id,
        })
        toast.success("Dirección agregada correctamente")
      }

      // Resetear formulario y cerrar diálogo
      resetForm()
      setIsAddDialogOpen(false)
      fetchAddresses()
    } catch (error) {
      console.error("Error al guardar la dirección:", error)
      toast.error("Error al guardar la dirección")
    }
  }

  const handleEdit = (address: any) => {
    setEditingAddress(address)
    setFormData({
      name: address.name || "",
      street: address.street || "",
      city: address.city || "",
      state: address.state || "",
      zipCode: address.zipCode || "",
      instructions: address.instructions || "",
      isDefault: address.isDefault || false,
    })
    setIsAddDialogOpen(true)
  }

  const handleDelete = async (addressId: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta dirección?")) {
      try {
        await deleteDoc(doc(db, `tenants/${tenantId}/users/${userId}/addresses`, addressId))
        toast.success("Dirección eliminada correctamente")
        fetchAddresses()
      } catch (error) {
        console.error("Error al eliminar la dirección:", error)
        toast.error("Error al eliminar la dirección")
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      instructions: "",
      isDefault: false,
    })
    setEditingAddress(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Mis direcciones</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Agregar dirección</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAddress ? "Editar dirección" : "Agregar nueva dirección"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la dirección</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej: Casa, Trabajo, etc."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">Calle y número</Label>
                <Input
                  id="street"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="Calle y número"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Ciudad"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado/Provincia</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Estado/Provincia"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">Código postal</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="Código postal"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instrucciones de entrega (opcional)</Label>
                <Textarea
                  id="instructions"
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  placeholder="Instrucciones para el repartidor"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isDefault">Establecer como dirección predeterminada</Label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm()
                    setIsAddDialogOpen(false)
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">{editingAddress ? "Actualizar" : "Guardar"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">No tienes direcciones guardadas</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>Agregar dirección</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <Card key={address.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {address.name}
                  {address.isDefault && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Predeterminada</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <p>{address.street}</p>
                <p>
                  {address.city}, {address.state} {address.zipCode}
                </p>
                {address.instructions && (
                  <p className="text-sm text-gray-500 mt-2">Instrucciones: {address.instructions}</p>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(address)}>
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Editar</span>
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => handleDelete(address.id)}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Eliminar</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
