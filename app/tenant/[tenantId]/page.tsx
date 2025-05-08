import { getTenantById } from "@/services/tenant-service"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function TenantHomePage({ params }: { params: { tenantId: string } }) {
  const tenant = await getTenantById(params.tenantId)

  if (!tenant) {
    return null // Esto será manejado por el layout
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">{tenant.name}</h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Bienvenido a nuestro restaurante. Descubre nuestro delicioso menú y disfruta de una experiencia gastronómica
          única.
        </p>
        <Link href="/menu">
          <Button size="lg">Ver Menú</Button>
        </Link>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Sobre nosotros</h2>
        <div className="bg-card p-8 rounded-lg shadow-sm">
          <p className="mb-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed
            erat molestie vehicula.
          </p>
          <p>
            Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. Ut in nulla enim. Phasellus molestie magna
            non est bibendum non venenatis nisl tempor.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6 text-center">Ubicación</h2>
        <div className="bg-card p-8 rounded-lg shadow-sm">
          <p className="mb-4 text-center">Estamos ubicados en Calle Ejemplo #123, Ciudad, País</p>
          <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
            <p className="text-muted-foreground">Mapa de ubicación</p>
          </div>
        </div>
      </section>
    </div>
  )
}
