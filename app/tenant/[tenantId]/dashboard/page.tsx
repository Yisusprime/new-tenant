import { redirect } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

export default async function TenantDashboard({ params }: { params: { tenantId: string } }) {
  const tenantId = params.tenantId

  if (!tenantId) {
    redirect("/")
  }

  // Intentar obtener datos del tenant para mostrar
  let tenantData = null
  try {
    const tenantDoc = await getDoc(doc(db, "tenants", tenantId))
    if (tenantDoc.exists()) {
      tenantData = tenantDoc.data()
    }
  } catch (error) {
    console.error("Error fetching tenant data:", error)
  }

  return (
    <DashboardLayout>
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">Dashboard de {tenantData?.name || tenantId}</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">Bienvenido a tu dashboard</h2>
            <p className="text-muted-foreground">Este es el dashboard personalizado para el tenant {tenantId}.</p>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">Información del tenant</h2>
            <p className="text-muted-foreground">Tenant ID: {tenantId}</p>
            <p className="text-muted-foreground mt-2">Dominio: {tenantId}.gastroo.online</p>
            {tenantData && (
              <>
                <p className="text-muted-foreground mt-2">Nombre: {tenantData.name}</p>
                <p className="text-muted-foreground mt-2">
                  Creado: {new Date(tenantData.createdAt).toLocaleDateString()}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
