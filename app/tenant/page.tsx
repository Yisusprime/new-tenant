import { headers } from "next/headers"
import { getDomainFromRequest } from "@/lib/domains"
import { getAdminDb } from "@/lib/firebase-admin"

async function getTenantData(tenantId: string) {
  try {
    const adminDb = await getAdminDb()
    const tenantDoc = await adminDb.collection("tenants").doc(tenantId).get()
    if (tenantDoc.exists) {
      return tenantDoc.data()
    }
    return null
  } catch (error) {
    console.error("Error getting tenant data:", error)
    return null
  }
}

export default async function TenantHome() {
  const headersList = headers()
  const host = headersList.get("host") || ""

  const domainInfo = await getDomainFromRequest(host)
  const tenantId = domainInfo.tenantId

  if (!tenantId) {
    return <div>Tenant no encontrado</div>
  }

  const tenantData = await getTenantData(tenantId)

  if (!tenantData) {
    return <div>Datos del tenant no encontrados</div>
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-6">Bienvenido a {tenantData.name}</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-4">Información del sitio</h2>
          <div className="space-y-2">
            <p>
              <strong>Nombre:</strong> {tenantData.name}
            </p>
            <p>
              <strong>Subdominio:</strong> {tenantData.subdomain}.gastroo.online
            </p>
            {tenantData.customDomain && (
              <p>
                <strong>Dominio personalizado:</strong> {tenantData.customDomain}
              </p>
            )}
            <p>
              <strong>Creado:</strong> {new Date(tenantData.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-4">Contenido personalizado</h2>
          <p className="text-muted-foreground">
            Este es un ejemplo de contenido personalizado para el tenant {tenantData.name}. Aquí puedes mostrar
            información específica para este cliente.
          </p>
        </div>
      </div>
    </div>
  )
}
