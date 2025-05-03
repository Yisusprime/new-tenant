import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { FirebaseProvider } from "@/components/firebase-provider"
import { ErrorBoundary } from "@/components/error-boundary"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Gastroo - Plataforma Multi-Tenant",
  description: "Plataforma SaaS con subdominios personalizados para restaurantes",
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
        <ErrorBoundary fallback={<div>Ha ocurrido un error. Por favor, recarga la página.</div>}>
          <FirebaseProvider>{children}</FirebaseProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
