"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useBranch } from "@/lib/context/branch-context"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"
import { ProductsList } from "./components/products-list"
import { ProductExtrasList } from "./components/product-extras-list"
import { PageContainer } from "@/components/page-container"

export default function ProductsPage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { currentBranch } = useBranch()
  const [activeTab, setActiveTab] = useState("products")

  return (
    <PageContainer variant="wide">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Productos</h1>
      </div>

      {!currentBranch ? (
        <NoBranchSelectedAlert />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <TabsList>
              <TabsTrigger value="products">Productos</TabsTrigger>
              <TabsTrigger value="extras">Extras Globales</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="products" className="mt-0">
            <ProductsList tenantId={params.tenantId} branchId={currentBranch.id} />
          </TabsContent>

          <TabsContent value="extras" className="mt-0">
            <ProductExtrasList tenantId={params.tenantId} branchId={currentBranch.id} />
          </TabsContent>
        </Tabs>
      )}
    </PageContainer>
  )
}
