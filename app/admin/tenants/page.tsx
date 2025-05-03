"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { collection, getDocs, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Tenant } from "@/hooks/useTenant"

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [newTenant, setNewTenant] = useState({
    id: "",
    name: "",
    primaryColor: "#4f46e5",
    features: "",
  })

  useEffect(() => {
    async function fetchTenants() {
      try {
        const tenantsCollection = collection(db, "tenants")
        const tenantsSnapshot = await getDocs(tenantsCollection)
        const tenantsList = tenantsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Tenant[]

        setTenants(tenantsList)
      } catch (error) {
        console.error("Error al obtener tenants:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTenants()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewTenant((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Validar que el ID sea válido para un subdominio
      if (!/^[a-z0-9-]+$/.test(newTenant.id)) {
        alert("El ID solo puede contener letras minúsculas, números y guiones")
        return
      }

      const featuresArray = newTenant.features
        .split(",")
        .map((feature) => feature.trim())
        .filter((feature) => feature.length > 0)

      const tenantData = {
        name: newTenant.name,
        primaryColor: newTenant.primaryColor,
        features: featuresArray,
        isActive: true,
        createdAt: new Date(),
      }

      // Crear un nuevo documento con el ID especificado
      await addDoc(collection(db, "tenants"), {
        ...tenantData,
        id: newTenant.id,
      })

      // Actualizar la lista de tenants
      setTenants((prev) => [...prev, { id: newTenant.id, ...tenantData } as Tenant])

      // Limpiar el formulario
      setNewTenant({
        id: "",
        name: "",
        primaryColor: "#4f46e5",
        features: "",
      })

      alert(`Tenant creado correctamente. Ahora puedes acceder a ${newTenant.id}.gastroo.online`)
    } catch (error) {
      console.error("Error al crear tenant:", error)
      alert("Error al crear tenant")
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Administrar Tenants</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Crear nuevo Tenant</CardTitle>
            <CardDescription>Crea un nuevo subdominio para tu plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="id">ID del Tenant (subdominio)</Label>
                <Input
                  id="id"
                  name="id"
                  placeholder="mi-empresa"
                  value={newTenant.id}
                  onChange={handleInputChange}
                  required
                />
                <p className="text-sm text-gray-500">Este será el subdominio: {newTenant.id}.gastroo.online</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Tenant</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Mi Empresa"
                  value={newTenant.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryColor">Color primario</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    name="primaryColor"
                    type="color"
                    value={newTenant.primaryColor}
                    onChange={handleInputChange}
                    className="w-12 h-10"
                  />
                  <Input
                    value={newTenant.primaryColor}
                    onChange={handleInputChange}
                    name="primaryColor"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="features">Características (separadas por comas)</Label>
                <Textarea
                  id="features"
                  name="features"
                  placeholder="Característica 1, Característica 2, Característica 3"
                  value={newTenant.features}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full">
                Crear Tenant
              </Button>
            </form>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-xl font-bold mb-4">Tenants existentes</h2>
          {tenants.length === 0 ? (
            <p>No hay tenants creados</p>
          ) : (
            <div className="space-y-4">
              {tenants.map((tenant) => (
                <Card key={tenant.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {tenant.name}
                      <span
                        className="inline-block w-4 h-4 rounded-full"
                        style={{ backgroundColor: tenant.primaryColor || "#4f46e5" }}
                      />
                    </CardTitle>
                    <CardDescription>
                      <a
                        href={`https://${tenant.id}.gastroo.online`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {tenant.id}.gastroo.online
                      </a>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {tenant.features.map((feature, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 rounded-md text-sm">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm">
                      Eliminar
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
