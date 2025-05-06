import type React from "react"
import { TenantAdminSidebar } from "@/components/tenant-admin-sidebar"

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <TenantAdminSidebar />
      <div className="flex-1">
        <div className="container mx-auto p-4">{children}</div>
      </div>
    </div>
  )
}
