import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
// Importar los estilos de impresión
import "./print.css"

export const metadata: Metadata = {
  title: "Gastroo",
  description: "Administrador de restaurantes",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
