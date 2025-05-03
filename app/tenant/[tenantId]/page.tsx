import { notFound } from "next/navigation"
import { adminDb } from "@/lib/firebase/admin"
import TenantPublicNavbar from "@/components/tenant-public-navbar"
import Link from "next/link"

// Esta función se ejecuta en el servidor
async function getTenantData(tenantId: string) {
  try {
    // Verificar si estamos en tiempo de construcción
    if (process.env.NODE_ENV === "production" && typeof window === "undefined" && !process.env.FIREBASE_PROJECT_ID) {
      console.warn("Ejecutando getTenantData en tiempo de construcción. Devolviendo datos simulados.")
      return {
        id: tenantId,
        name: tenantId,
        status: "active",
      }
    }

    const tenantDoc = await adminDb.collection("tenants").doc(tenantId).get()

    if (!tenantDoc.exists) {
      return null
    }

    return {
      id: tenantDoc.id,
      ...tenantDoc.data(),
    }
  } catch (error) {
    console.error("Error al obtener datos del tenant:", error)
    // En caso de error, devolver datos básicos para permitir la construcción
    return {
      id: tenantId,
      name: tenantId,
      status: "error",
    }
  }
}

export default async function TenantHomePage({ params }: { params: { tenantId: string } }) {
  const tenantData = await getTenantData(params.tenantId)

  if (!tenantData) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TenantPublicNavbar tenantId={params.tenantId} tenantName={tenantData.name || params.tenantId} />

      <main className="flex-1">
        <section className="py-20 text-center">
          <div className="container mx-auto px-4">
            <h1 className="mb-6 text-4xl font-bold md:text-5xl">Bienvenido a {tenantData.name || params.tenantId}</h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
              Explora nuestro menú y realiza pedidos en línea.
            </p>
            <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <Link
                href={`/tenant/${params.tenantId}/menu`}
                className="rounded bg-black px-6 py-3 text-white hover:bg-gray-800"
              >
                Ver Menú
              </Link>
              <Link
                href={`/tenant/${params.tenantId}/login`}
                className="rounded border border-gray-300 px-6 py-3 hover:bg-gray-50"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">Nuestros Servicios</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-3 text-xl font-semibold">Menú Digital</h3>
                <p className="text-gray-600">Explora nuestro menú completo con fotos y descripciones detalladas.</p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-3 text-xl font-semibold">Pedidos Online</h3>
                <p className="text-gray-600">Realiza pedidos fácilmente desde cualquier dispositivo.</p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-3 text-xl font-semibold">Reservas</h3>
                <p className="text-gray-600">Reserva una mesa para tu próxima visita.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2023 {tenantData.name || params.tenantId}. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
