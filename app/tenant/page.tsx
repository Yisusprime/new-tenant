import { headers } from "next/headers"
import { getDomainFromRequest } from "@/lib/domains"

async function getTenantData(tenantId: string) {
  try {
    // Llamar a la API route para obtener los datos del tenant
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "")
    const response = await fetch(`${baseUrl}/api/tenants/${tenantId}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Error fetching tenant data: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error in getTenantData:", error)
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
