import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
// Importar los estilos de impresión
import "./print.css"

// Añadir este script para manejar la altura en dispositivos móviles
export const metadata: Metadata = {
  title: "Multi-tenant System",
  description: "A multi-tenant system for restaurants",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
