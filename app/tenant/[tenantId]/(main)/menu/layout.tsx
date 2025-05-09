import type { ReactNode } from "react"
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
    </div>
  )
}
