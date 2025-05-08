"use client"

import type React from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function SettingsLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { tenantId: string }
}) {
  const pathname = usePathname()

  // Get the current tab from the pathname
  const getCurrentTab = () => {
    if (pathname.includes("/profile")) return "profile"
    // Add more tabs as needed
    return "profile"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-gray-500">Administra la configuración de tu cuenta y aplicación</p>
      </div>

      <Tabs defaultValue={getCurrentTab()} className="w-full">
        <TabsList className="mb-4">
          <Link href={`/admin/settings/profile`} passHref>
            <TabsTrigger value="profile" className="cursor-pointer">
              Perfil
            </TabsTrigger>
          </Link>
          {/* Add more tabs as needed */}
        </TabsList>
      </Tabs>

      {children}
    </div>
  )
}
