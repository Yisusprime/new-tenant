"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useBranch } from "@/lib/context/branch-context"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"
import { CashRegisterProvider } from "@/lib/context/cash-register-context"
import { CashRegisterStatus } from "@/components/cash-register-status"
import { OpenCashRegisterDialog } from "@/components/open-cash-register-dialog"
import { CloseCashRegisterDialog } from "@/components/close-cash-register-dialog"
import { CashRegisterHistory } from "@/components/cash-register-history"
import { CashRegisterSummary } from "@/components/cash-register-summary"

export default function CashRegisterPage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params
  const { currentBranch } = useBranch()
  const [openDialogOpen, setOpenDialogOpen] = useState(false)
  const [closeDialogOpen, setCloseDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Caja</h1>
      </div>

      <NoBranchSelectedAlert />

      {currentBranch && (
        <CashRegisterProvider tenantId={tenantId} branchId={currentBranch.id}>
          <div className="flex justify-between items-center mb-6">
            <CashRegisterStatus tenantId={tenantId} branchId={currentBranch.id} />
            <div className="flex gap-2">
              <OpenCashRegisterDialog
                tenantId={tenantId}
                branchId={currentBranch.id}
                open={openDialogOpen}
                onOpenChange={setOpenDialogOpen}
              />
              <CloseCashRegisterDialog
                tenantId={tenantId}
                branchId={currentBranch.id}
                open={closeDialogOpen}
                onOpenChange={setCloseDialogOpen}
              />
            </div>
          </div>

          <Tabs defaultValue="summary" className="space-y-4">
            <TabsList>
              <TabsTrigger value="summary">Resumen</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4">
              <CashRegisterSummary tenantId={tenantId} branchId={currentBranch.id} />
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <CashRegisterHistory tenantId={tenantId} branchId={currentBranch.id} />
            </TabsContent>
          </Tabs>
        </CashRegisterProvider>
      )}
    </div>
  )
}
