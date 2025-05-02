import type React from "react"
import { redirect } from "next/navigation"
import { getDomainFromRequest } from "@/lib/domains"
import { headers } from "next/headers"
import TenantNavbar from "@/components/tenant-navbar"

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = headers()
  const host = headersList.get("host") || ""

  // Get domain information
  const domainInfo = await getDomainFromRequest(host)

  // If not a tenant domain, redirect to home
  if (!domainInfo.tenantId) {
    redirect("/")
  }

  return (
    <div className="flex flex-col min-h-screen">
      <TenantNavbar tenantId={domainInfo.tenantId} />
      <main className="flex-1">{children}</main>
    </div>
  )
}
