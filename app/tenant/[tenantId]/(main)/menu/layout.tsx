import type { ReactNode } from "react"
import { MobileNavigation } from "./components/mobile-navigation"
import { DesktopNavigation } from "./components/desktop-navigation"

export default function MenuLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navegación de escritorio - solo visible en pantallas medianas y grandes */}
      <div className="hidden md:block">
        <DesktopNavigation />
      </div>

      {/* Contenido principal */}
      <main className="flex-1">{children}</main>

      {/* Navegación móvil - solo visible en pantallas pequeñas */}
      <div className="block md:hidden">
        <MobileNavigation />
      </div>
    </div>
  )
}
