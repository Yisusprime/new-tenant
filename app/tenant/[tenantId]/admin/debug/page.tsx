"use client"

import { useBranch } from "@/lib/context/branch-context"
import { useAuth } from "@/lib/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DebugPage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  const { branches, currentBranch, loading, error } = useBranch()
  const { user, loading: authLoading } = useAuth()

  const handleCreateTestBranch = async () => {
    try {
      // Crear una sucursal de prueba directamente en Firestore
      const branchId = `test-${Date.now()}`
      const db = (await import("@/lib/firebase/client")).db
      const { doc, setDoc } = await import("firebase/firestore")

      await setDoc(doc(db, `tenants/${tenantId}/branches`, branchId), {
        id: branchId,
        name: "Sucursal de Prueba",
        address: "Dirección de prueba",
        phone: "123456789",
        email: "test@example.com",
        isActive: true,
        createdAt: new Date().toISOString(),
        tenantId: tenantId,
      })

      alert("Sucursal de prueba creada. Refresca la página.")
    } catch (error) {
      console.error("Error al crear sucursal de prueba:", error)
      alert(`Error: ${error}`)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Página de Depuración</h1>

      <Card>
        <CardHeader>
          <CardTitle>Estado del Contexto de Sucursales</CardTitle>
          <CardDescription>Información para depuración</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Estado de carga:</h3>
              <p>{loading ? "Cargando..." : "Completado"}</p>
            </div>

            <div>
              <h3 className="font-semibold">Error:</h3>
              <p>{error || "Ninguno"}</p>
            </div>

            <div>
              <h3 className="font-semibold">Tenant ID:</h3>
              <p>{tenantId}</p>
            </div>

            <div>
              <h3 className="font-semibold">Usuario:</h3>
              <p>{authLoading ? "Cargando usuario..." : user ? user.email : "No autenticado"}</p>
            </div>

            <div>
              <h3 className="font-semibold">ID de Usuario:</h3>
              <p>{authLoading ? "Cargando..." : user ? user.uid : "No disponible"}</p>
            </div>

            <div>
              <h3 className="font-semibold">Estado de autenticación:</h3>
              <p>{authLoading ? "Verificando..." : user ? "Autenticado" : "No autenticado"}</p>
            </div>

            <div>
              <h3 className="font-semibold">Número de sucursales:</h3>
              <p>{branches ? branches.length : "No disponible"}</p>
            </div>

            <div>
              <h3 className="font-semibold">Sucursal actual:</h3>
              <pre className="bg-gray-100 p-2 rounded-md overflow-auto">
                {currentBranch ? JSON.stringify(currentBranch, null, 2) : "Ninguna seleccionada"}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold">Todas las sucursales:</h3>
              <pre className="bg-gray-100 p-2 rounded-md overflow-auto">
                {branches ? JSON.stringify(branches, null, 2) : "No disponible"}
              </pre>
            </div>

            <div className="pt-4">
              <Button onClick={handleCreateTestBranch}>Crear Sucursal de Prueba</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
