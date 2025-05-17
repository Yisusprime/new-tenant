import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
// Importar los estilos de impresión
import "./print.css"

// Configurar la fuente Inter
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Gastroo - Gestión de restaurantes",
  description: "Plataforma completa para administrar pedidos, menús y clientes de tu restaurante",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${inter.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
