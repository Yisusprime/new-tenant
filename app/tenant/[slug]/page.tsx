import { notFound } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { TenantProvider } from "@/contexts/tenant-context"
import TenantLayout from "@/components/tenant-layout"

// Esta función se ejecuta en el servidor
async function getTenant(slug: string) {
  try {
    const tenantRef = doc(db, "tenants", slug)
    const tenantSnap = await getDoc(tenantRef)

    if (!tenantSnap.exists()) {
      return null
    }

    return {
      id: tenantSnap.id,
      ...tenantSnap.data(),
    }
  } catch (error) {
    console.error("Error al obtener tenant:", error)
    return null
  }
}

export default async function TenantPage({ params }: { params: { slug: string } }) {
  const tenant = await getTenant(params.slug)

  if (!tenant) {
    notFound()
  }

  return (
    <TenantProvider tenant={tenant} isLoading={false}>
      <TenantLayout />
    </TenantProvider>
  )
}
