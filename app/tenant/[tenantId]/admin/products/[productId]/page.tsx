"use client"
import { useBranch } from "@/lib/context/branch-context"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"
import { ProductForm } from "../components/product-form"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function EditProductPage({
  params,
}: {
  params: { tenantId: string; productId: string }
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
        <h1 className="text-2xl font-bold">Editar Producto</h1>
      </div>

      {!currentBranch ? (
        <NoBranchSelectedAlert />
      ) : (
        <ProductForm tenantId={params.tenantId} branchId={currentBranch.id} productId={params.productId} />
      )}
    </div>
  )
}
