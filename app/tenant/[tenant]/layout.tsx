import type React from "react"
import { TenantProvider } from "@/lib/context/tenant-context"
import { notFound } from "next/navigation"

export default function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { tenant: string }
}) {
  const { tenant } = params

  if (!tenant) {
    notFound()
  }

  return <TenantProvider subdomain={tenant}>{children}</TenantProvider>
}
