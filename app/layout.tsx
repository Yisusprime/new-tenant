import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import FirebaseProvider from "@/components/firebase-provider"
import { AuthProvider } from "@/lib/auth-context"
import ErrorBoundary from "@/components/error-boundary"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Multi-Cliente SaaS",
  description: "Plataforma multi-tenant con subdominios personalizados",
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
        <ErrorBoundary>
          <FirebaseProvider>
            <AuthProvider>{children}</AuthProvider>
          </FirebaseProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
