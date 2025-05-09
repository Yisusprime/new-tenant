import type { ReactNode } from "react"
import { DesktopNavigation } from "./components/desktop-navigation"
import { MobileNavigation } from "./components/mobile-navigation"
import "./styles.css"

export default function MenuLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navegación de escritorio - solo visible en pantallas medianas y grandes */}
      <div className="hidden md:block sticky top-0 z-50">
        <DesktopNavigation />
      </div>

      {/* Contenido principal */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 pb-20 md:pb-10">{children}</main>

      {/* Navegación móvil - solo visible en móviles */}
      <div className="md:hidden">
        <MobileNavigation />
      </div>
    </div>
  )
}
