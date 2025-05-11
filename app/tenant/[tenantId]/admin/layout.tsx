import type { Metadata } from "next"
import AdminLayoutClient from "./AdminLayoutClient"
import type React from "react"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin Dashboard",
}

interface AdminLayoutProps {
  children: React.ReactNode
  params: {
    tenantId: string
  }
}

export default function AdminLayout({ children, params }: AdminLayoutProps) {
  return <AdminLayoutClient children={children} params={params} />
}
