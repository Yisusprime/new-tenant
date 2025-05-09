import type React from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/client"

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

export default async function TenantMainLayout({
  children,
  params,
}: {
  children: React.ReactNode
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
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">{children}</main>

      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          &copy; {new Date().getFullYear()} {tenantName} | Powered by Gastroo
        </div>
      </footer>
    </div>
  )
}
