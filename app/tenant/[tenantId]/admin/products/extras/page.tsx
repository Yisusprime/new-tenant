// Añadir este archivo para la página de extras globales con un botón de creación explícito

import { ProductExtrasList } from "../components/product-extras-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

interface PageProps {
  params: {
    tenantId: string
  }
}

export default function ProductExtrasPage({ params }: PageProps) {
  const { tenantId } = params

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Extras Globales</h1>
        <Link href={`/tenant/${tenantId}/admin/products/extras/create`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Crear Nuevo Extra
          </Button>
        </Link>
      </div>
      <ProductExtrasList tenantId={tenantId} branchId="global" />
    </div>
  )
}
