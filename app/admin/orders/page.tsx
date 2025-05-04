"use client"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

// Versión extremadamente simplificada sin contextos ni providers
export default function OrdersPage() {
  const { user } = useAuth()
  const params = useParams()
  const tenantId = user?.tenantId || (params.tenantId as string)
  const router = useRouter()

  console.log("OrdersPage - Using tenant ID:", tenantId)

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-background border-b h-16 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/admin/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Gestión de Pedidos</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={() => router.push("/admin/cashier")}>
              <Clock className="mr-2 h-4 w-4" />
              Ir a Caja
            </Button>
          </div>
        </header>

        {/* Contenido */}
        <div className="flex-1 overflow-auto p-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
            <h2 className="text-lg font-semibold mb-2">Página en mantenimiento</h2>
            <p className="mb-4">
              Estamos trabajando para resolver un problema técnico con esta página. Por favor, utiliza las siguientes
              opciones mientras tanto:
            </p>
            <div className="flex flex-col gap-2">
              <Link href="/admin/dashboard" className="text-blue-600 hover:underline">
                Volver al Dashboard
              </Link>
              <Link href="/admin/cashier" className="text-blue-600 hover:underline">
                Ir a Gestión de Caja
              </Link>
              <Link href="/admin/menu" className="text-blue-600 hover:underline">
                Gestionar Menú
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
