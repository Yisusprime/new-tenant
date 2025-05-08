import { getTenant } from "@/lib/services/tenant-service"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function TenantHomePage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  const tenant = await getTenant(tenantId)

  if (!tenant) {
    return null // El layout ya maneja el caso de tenant no encontrado
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{tenant.name}</h1>
        <p className="text-xl text-gray-600 mb-8">Bienvenido a nuestra plataforma de pedidos en línea</p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href={`/tenant/${tenantId}/menu`}>Ver Menú</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={`/tenant/${tenantId}/login`}>Iniciar Sesión</Link>
          </Button>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-gray-100 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Nuestro Menú</h2>
          <p className="mb-4">Explora nuestra variedad de platos preparados con los mejores ingredientes.</p>
          <Button asChild variant="outline">
            <Link href={`/tenant/${tenantId}/menu`}>Ver Menú Completo</Link>
          </Button>
        </div>
        <div className="bg-gray-100 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Realiza tu Pedido</h2>
          <p className="mb-4">Ordena en línea y recibe tu comida en la comodidad de tu hogar.</p>
          <Button asChild variant="outline">
            <Link href={`/tenant/${tenantId}/order`}>Ordenar Ahora</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
