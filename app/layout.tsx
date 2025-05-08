import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { TenantProvider } from "@/contexts/tenant-context"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Gastroo - Sistema Multi-Tenant",
  description: "Plataforma para restaurantes y servicios gastronómicos",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TenantProvider>{children}</TenantProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
