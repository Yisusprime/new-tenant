"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

export default function NewProductRedirect({
  params,
}: {
  params: { tenantId: string }
}) {
  const router = useRouter()

  useEffect(() => {
    // Redirigir a la página de edición con "new" como ID
    router.push(`/tenant/${params.tenantId}/admin/products/new-product`)
  }, [router, params.tenantId])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Redirigiendo...</h1>
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  )
}
