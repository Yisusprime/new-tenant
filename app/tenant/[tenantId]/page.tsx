import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import { Button } from "@/components/ui/button"

// Función para obtener datos del tenant
async function getTenantData(tenantId: string) {
  try {
    const docRef = doc(db, "tenants", tenantId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return docSnap.data()
    } else {
      console.log("No such tenant!")
      return null
    }
  } catch (error) {
    console.error("Error getting tenant data:", error)
    return null
  }
}

export default async function TenantHomePage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params

  // Intentar obtener datos del tenant
  let tenantData
  try {
    tenantData = await getTenantData(tenantId)
  } catch (error) {
    console.error("Error loading tenant data:", error)
  }

  const tenantName = tenantData?.name || tenantId

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{tenantName}</h1>
        <p className="text-xl text-gray-600 mb-8">Bienvenido a nuestra plataforma de pedidos en línea</p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <a href="/menu">Ver Menú</a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="/login">Iniciar Sesión</a>
          </Button>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-gray-100 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Nuestro Menú</h2>
          <p className="mb-4">Explora nuestra variedad de platos preparados con los mejores ingredientes.</p>
          <Button asChild variant="outline">
            <a href="/menu">Ver Menú Completo</a>
          </Button>
        </div>
        <div className="bg-gray-100 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Realiza tu Pedido</h2>
          <p className="mb-4">Ordena en línea y recibe tu comida en la comodidad de tu hogar.</p>
          <Button asChild variant="outline">
            <a href="/order">Ordenar Ahora</a>
          </Button>
        </div>
      </section>
    </div>
  )
}
