"use client"

import { useBranch } from "@/lib/context/branch-context"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"
import { ProductExtraForm } from "../../components/product-extra-form"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function CreateExtraPage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { currentBranch } = useBranch()
  const router = useRouter()

  return (
    <div>
      <div className="mb-6 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="mr-2"
          onClick={() => router.push(`/tenant/${params.tenantId}/admin/products`)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Crear Nuevo Extra</h1>
      </div>

      {!currentBranch ? (
        <NoBranchSelectedAlert />
      ) : (
        <ProductExtraForm tenantId={params.tenantId} branchId={currentBranch.id} />
      )}
    </div>
  )
}
