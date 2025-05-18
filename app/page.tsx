"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState, useEffect } from "react"

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detectar si es dispositivo móvil
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Cerrar menú al cambiar a desktop
  useEffect(() => {
    if (!isMobile) {
      setIsMenuOpen(false)
    }
  }, [isMobile])

  return (
    <div className="flex flex-col min-h-screen bg-[#000924]">
      {/* Header con borde redondeado */}
      <header className="fixed top-4 left-0 right-0 z-50 mx-auto max-w-[1200px] px-4">
        <div className="bg-black/40 backdrop-blur-md rounded-full border border-white/10 px-4 sm:px-6 py-3 flex justify-between items-center">
          <div className="text-2xl font-bold text-white flex items-center">
            <span className="mr-1">Gastroo</span>
          </div>

          {/* Menú para desktop */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-white hover:text-gray-300 text-sm bg-black/30 px-4 py-2 rounded-full">
              Iniciar sesión
            </Link>
            <Button asChild size="sm" className="bg-white text-black hover:bg-gray-200 rounded-full px-4">
              <Link href="/register">Registro</Link>
            </Button>
          </div>

          {/* Botón de hamburguesa para móvil */}
          <button
            className="md:hidden text-white p-1"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Menú móvil desplegable */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-black/90 backdrop-blur-md mt-2 rounded-xl p-4 border border-white/10 mx-4 flex flex-col gap-3">
            <Link
              href="/login"
              className="text-white hover:text-gray-300 text-sm py-2 px-4 rounded-lg hover:bg-white/10"
              onClick={() => setIsMenuOpen(false)}
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="text-white hover:text-gray-300 text-sm py-2 px-4 rounded-lg bg-white/10 hover:bg-white/20"
              onClick={() => setIsMenuOpen(false)}
            >
              Registro
            </Link>
          </div>
        )}
      </header>

      {/* Fondo con líneas verticales */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#000924]">
          {/* Líneas verticales generadas con CSS */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(to right, 
              rgba(0, 0, 255, 0.1) 0px, 
              rgba(0, 0, 255, 0.1) 1px, 
              transparent 1px, 
              transparent 40px)`,
              backgroundSize: "100% 100%",
              opacity: 0.5,
            }}
          ></div>
        </div>
      </div>

      <main className="flex-1 relative z-10 pt-24">
        <section className="py-12 md:py-20 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 md:mb-6">Tu restaurante online</h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              Sistema completo para gestionar pedidos, menús y clientes con tu propio subdominio personalizado
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-black hover:bg-gray-100 rounded-full px-6">
                <Link href="/register">Registro</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Curva blanca de separación */}
        <div className="relative h-16 md:h-24 mt-12 md:mt-20">
          <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24 bg-white rounded-t-[50%] transform translate-y-1/2"></div>
        </div>

        <section className="bg-white py-12 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-600 mb-8 md:mb-12">+850 empresas confían en nosotros</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-8 items-center justify-items-center">
              <div className="grayscale opacity-70 hover:opacity-100 transition-opacity">
                <img src="/abstract-logo.png" alt="Cliente 1" className="h-8 md:h-12" />
              </div>
              <div className="grayscale opacity-70 hover:opacity-100 transition-opacity">
                <img src="/abstract-logo.png" alt="Cliente 2" className="h-8 md:h-12" />
              </div>
              <div className="grayscale opacity-70 hover:opacity-100 transition-opacity">
                <img src="/abstract-logo.png" alt="Cliente 3" className="h-8 md:h-12" />
              </div>
              <div className="grayscale opacity-70 hover:opacity-100 transition-opacity">
                <img src="/abstract-logo.png" alt="Cliente 4" className="h-8 md:h-12" />
              </div>
              <div className="grayscale opacity-70 hover:opacity-100 transition-opacity">
                <img src="/abstract-logo.png" alt="Cliente 5" className="h-8 md:h-12" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#000924] text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <div className="text-xl font-bold mb-2">Gastroo</div>
              <p className="text-gray-400">La plataforma para tu restaurante</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-2">Producto</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#features" className="text-gray-400 hover:text-white">
                      Características
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white">
                      Precios
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Soporte</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white">
                      Documentación
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white">
                      Contacto
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Legal</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white">
                      Términos
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white">
                      Privacidad
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            &copy; {new Date().getFullYear()} Gastroo. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
