import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/toaster"
import { AuthProvider } from "@/lib/auth-context"
import { Navigation } from "@/components/navigation"
import { CartProvider } from "@/components/cart/cart-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Gastroo - Sistema de Gestión para Restaurantes",
  description: "Sistema de gestión para restaurantes con múltiples inquilinos",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <Navigation />
            {children}
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
