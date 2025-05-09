import type { ReactNode } from "react"

export default function MenuLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Contenido principal */}
      <main className="flex-1">{children}</main>
    </div>
  )
}
