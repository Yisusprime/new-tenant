import Link from "next/link"
import { Button } from "@/components/ui/button"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import TenantPublicNavbar from "@/components/tenant-public-navbar"
import { ArrowRight } from "lucide-react"

// Función para obtener los datos del tenant
async function getTenantData(tenantId: string) {
  try {
    const tenantDoc = await getDoc(doc(db, "tenants", tenantId))
    if (tenantDoc.exists()) {
      return {
        id: tenantDoc.id,
        ...tenantDoc.data(),
      }
    }
    return null
  } catch (error) {
    console.error("Error fetching tenant data:", error)
    return null
  }
}

export default async function TenantHomePage({ params }: { params: { tenantId: string } }) {
  const tenantId = params.tenantId
  const tenantData = await getTenantData(tenantId)

  if (!tenantData) {
    return (
      <div className="flex flex-col min-h-screen">
        <TenantPublicNavbar tenantId={tenantId} tenantName="Restaurante" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Restaurante no encontrado</h1>
            <p className="mt-2 text-muted-foreground">No pudimos encontrar información para este restaurante.</p>
          </div>
        </main>
      </div>
    )
  }

  const tenantName = tenantData.name || "Restaurante"
  const description = tenantData.description || "Bienvenido a nuestro restaurante online."
  const logoUrl = tenantData.logoUrl || "/restaurant-logo.png"

  return (
    <div className="flex flex-col min-h-screen">
      <TenantPublicNavbar tenantId={tenantId} tenantName={tenantName} logoUrl={logoUrl} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 flex flex-col items-center text-center">
            <div className="mb-8">
              <img
                src={logoUrl || "/placeholder.svg"}
                alt={`${tenantName} logo`}
                className="h-24 w-24 object-contain mx-auto"
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">{tenantName}</h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-3xl">{description}</p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href={`/tenant/${tenantId}/login`}>
                <Button size="lg" className="gap-2">
                  Iniciar sesión <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={`/tenant/${tenantId}/menu`}>
                <Button variant="outline" size="lg">
                  Ver Menú
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Nuestros Servicios</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-3">Pedidos Online</h3>
                <p className="text-muted-foreground">Realiza tus pedidos fácilmente desde nuestra plataforma online.</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-3">Entrega a Domicilio</h3>
                <p className="text-muted-foreground">Recibe tus pedidos directamente en la puerta de tu casa.</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-3">Reservas</h3>
                <p className="text-muted-foreground">Reserva una mesa en nuestro restaurante con anticipación.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2024 {tenantName}. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <Link href={`/tenant/${tenantId}/terms`} className="text-sm text-muted-foreground hover:underline">
              Términos
            </Link>
            <Link href={`/tenant/${tenantId}/privacy`} className="text-sm text-muted-foreground hover:underline">
              Privacidad
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
