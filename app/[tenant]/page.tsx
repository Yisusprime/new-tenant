import Link from "next/link"
import { db } from "@/lib/firebase/client"
import { collection, getDocs, query, where } from "firebase/firestore"

// Esta función se ejecuta en el cliente
async function getTenantData(tenant: string) {
  try {
    // Verificar si el tenant existe
    const tenantsRef = collection(db, "tenants")
    const q = query(tenantsRef, where("subdomain", "==", tenant))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return null
    }

    const tenantDoc = querySnapshot.docs[0]
    return {
      id: tenantDoc.id,
      ...tenantDoc.data(),
    }
  } catch (error) {
    console.error("Error al obtener datos del tenant:", error)
    return null
  }
}

export default async function TenantHomePage({ params }: { params: { tenant: string } }) {
  const tenantData = await getTenantData(params.tenant)

  if (!tenantData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="mb-6 text-4xl font-bold">Tenant no encontrado</h1>
        <p className="mb-4">El tenant {params.tenant} no existe o no está disponible.</p>
        <Link href="/" className="text-blue-600 hover:underline">
          Volver al inicio
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b w-full bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href={`/${params.tenant}`} className="font-bold text-xl">
              {tenantData.name}
            </Link>
          </div>

          {/* Menú para pantallas medianas y grandes */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href={`/${params.tenant}`} className="text-sm font-medium hover:text-primary hover:underline">
              Inicio
            </Link>
            <Link href={`/${params.tenant}/menu`} className="text-sm font-medium hover:text-primary hover:underline">
              Menú
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href={`/${params.tenant}/login`}>
              <button className="text-sm font-medium hover:text-primary">Iniciar sesión</button>
            </Link>
            <Link href={`/${params.tenant}/registro`}>
              <button className="rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
                Registrarse
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 text-center">
          <div className="container mx-auto px-4">
            <h1 className="mb-6 text-4xl font-bold md:text-5xl">Bienvenido a {tenantData.name}</h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
              Descubre nuestra deliciosa selección de platos preparados con los mejores ingredientes.
            </p>
            <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <Link href={`/${params.tenant}/menu`} className="rounded bg-black px-6 py-3 text-white hover:bg-gray-800">
                Ver Menú →
              </Link>
              <Link
                href={`/${params.tenant}/login`}
                className="rounded border border-gray-300 px-6 py-3 hover:bg-gray-50"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">Nuestras Especialidades</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-3 text-xl font-semibold">Platos Gourmet</h3>
                <p className="text-gray-600">
                  Disfruta de nuestros platos gourmet preparados por chefs profesionales con ingredientes de primera
                  calidad.
                </p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-3 text-xl font-semibold">Servicio Rápido</h3>
                <p className="text-gray-600">
                  Entrega rápida y eficiente para que disfrutes de tu comida en el momento perfecto.
                </p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-3 text-xl font-semibold">Opciones Saludables</h3>
                <p className="text-gray-600">
                  Variedad de opciones saludables para todos los gustos y necesidades dietéticas.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2023 {tenantData.name}. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
