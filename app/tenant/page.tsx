import { redirect } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { firestore } from "@/lib/firebase/admin"
import { headers } from "next/headers"
import { Button } from "@/components/ui/button"

async function getTenantInfo(tenantId: string) {
  try {
    const tenantDoc = await firestore.collection("tenants").doc(tenantId).get()

    if (!tenantDoc.exists) {
      return null
    }

    return {
      id: tenantDoc.id,
      ...tenantDoc.data(),
    }
  } catch (error) {
    console.error("Error al obtener información del tenant:", error)
    return null
  }
}

export default async function TenantHomePage({ params }: { params: { tenant: string } }) {
  // Obtener el tenant del hostname en el middleware
  const host = headers().get("host") || ""
  const subdomain = host.split(".")[0]

  if (!subdomain || subdomain === "www" || subdomain === "gastroo") {
    redirect("/")
  }

  const tenantInfo = await getTenantInfo(subdomain)

  if (!tenantInfo) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar isTenant tenantName={subdomain} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Restaurante no encontrado</h1>
            <p className="text-gray-600">El restaurante que estás buscando no existe o ha sido desactivado.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isTenant tenantName={tenantInfo.name} />
      <main className="flex-1">
        <section className="py-20 bg-gradient-to-b from-white to-gray-100">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{tenantInfo.name}</h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Bienvenido a nuestro restaurante. Descubre nuestro delicioso menú.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/menu">
                <Button size="lg" className="px-8">
                  Ver Menú
                </Button>
              </a>
              <a href="/contact">
                <Button size="lg" variant="outline" className="px-8">
                  Contacto
                </Button>
              </a>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Nuestras Especialidades</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Plato 1</h3>
                <p className="text-gray-600">Descripción del plato 1.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Plato 2</h3>
                <p className="text-gray-600">Descripción del plato 2.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Plato 3</h3>
                <p className="text-gray-600">Descripción del plato 3.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-xl font-bold">{tenantInfo.name}</h3>
          <p className="text-gray-400 mt-2">© {new Date().getFullYear()} Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
