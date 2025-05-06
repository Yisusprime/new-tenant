import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { HeroAnimation, FeaturesAnimation, TestimonialAnimation } from "@/components/gsap-animations"
import {
  ArrowRight,
  Utensils,
  Calendar,
  CreditCard,
  BarChart,
  Settings,
  Users,
  Star,
  ChefHat,
  Clock,
} from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full overflow-hidden">
      <header className="border-b w-full bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600"
            >
              GastroManager
            </Link>
            <nav className="hidden md:flex gap-8">
              <Link href="/caracteristicas" className="text-sm font-medium hover:text-purple-600 transition-colors">
                Características
              </Link>
              <Link href="/precios" className="text-sm font-medium hover:text-purple-600 transition-colors">
                Precios
              </Link>
              <Link href="/tenants" className="text-sm font-medium hover:text-purple-600 transition-colors">
                Clientes
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="hover:text-purple-600 transition-colors">
                Iniciar sesión
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-none shadow-md hover:shadow-lg transition-all">
                Registrarse
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full">
        <HeroSection />
        <FeaturesSection />
        <StatsSection />
        <TestimonialSection />
        <CtaSection />
      </main>
      <footer className="border-t py-12 w-full bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                GastroManager
              </h3>
              <p className="text-gray-600 mb-4">
                La solución completa para la gestión de restaurantes y locales de comida.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-purple-600">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-purple-600">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-purple-600">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Producto</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-600 hover:text-purple-600">
                    Características
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-purple-600">
                    Precios
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-purple-600">
                    Clientes
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-purple-600">
                    Integraciones
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Recursos</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-600 hover:text-purple-600">
                    Documentación
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-purple-600">
                    Guías
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-purple-600">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-purple-600">
                    Soporte
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Empresa</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-600 hover:text-purple-600">
                    Sobre nosotros
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-purple-600">
                    Contacto
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-purple-600">
                    Términos
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-purple-600">
                    Privacidad
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} GastroManager. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}

function HeroSection() {
  const { heroRef, headingRef, textRef, buttonsRef, decorationRef, bgShapeRef } = HeroAnimation()

  return (
    <section ref={heroRef} className="w-full py-20 md:py-28 lg:py-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-purple-50 to-indigo-50 opacity-70"></div>

      {/* Background shape */}
      <div ref={bgShapeRef} className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-purple-200/30 to-indigo-200/30 blur-3xl"></div>
        <div className="absolute -bottom-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-tr from-indigo-200/30 to-purple-200/30 blur-3xl"></div>
      </div>

      {/* Decorative elements */}
      <div ref={decorationRef} className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 opacity-20"></div>
        <div className="absolute top-[20%] right-[10%] w-24 h-24 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 opacity-20"></div>
        <div className="absolute bottom-[15%] left-[15%] w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 opacity-20"></div>
        <div className="absolute bottom-[10%] right-[5%] w-20 h-20 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 opacity-20"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <h1
            ref={headingRef}
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600"
          >
            Revoluciona la Gestión de tu Restaurante
          </h1>
          <p ref={textRef} className="text-xl md:text-2xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed">
            La plataforma todo-en-uno que transforma la administración de locales de comida con herramientas potentes y
            fáciles de usar.
          </p>
          <div ref={buttonsRef} className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Link href="/register">
              <Button
                size="lg"
                className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-none shadow-lg hover:shadow-xl transition-all"
              >
                Comenzar ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/caracteristicas">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 transition-all"
              >
                Ver demostración
              </Button>
            </Link>
          </div>

          {/* Floating dashboard preview */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white z-10 h-20 bottom-0"></div>
            <div className="relative mx-auto max-w-5xl shadow-2xl shadow-purple-900/20 rounded-t-xl overflow-hidden border border-gray-200">
              <Image
                src="/modern-restaurant-interior.png"
                alt="GastroManager Dashboard"
                width={1200}
                height={675}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  const { featuresRef, addToRefs, featureTitleRef, featureDescRef } = FeaturesAnimation()

  const features = [
    {
      icon: Utensils,
      title: "Gestión de Menú Avanzada",
      description:
        "Crea y actualiza fácilmente tu menú con categorías, subcategorías, productos y extras personalizables. Incluye imágenes, descripciones y precios variables.",
      color: "from-purple-500 to-indigo-500",
    },
    {
      icon: Calendar,
      title: "Sistema de Pedidos Inteligente",
      description:
        "Gestiona pedidos para mesas, delivery y para llevar con un sistema intuitivo y en tiempo real. Notificaciones automáticas y seguimiento de estado.",
      color: "from-indigo-500 to-blue-500",
    },
    {
      icon: CreditCard,
      title: "Punto de Venta Completo",
      description:
        "Procesa pagos con múltiples métodos, gestiona turnos de caja y genera informes detallados de ventas diarias. Compatible con impresoras térmicas.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: BarChart,
      title: "Análisis y Reportes Detallados",
      description:
        "Visualiza el rendimiento de tu negocio con gráficos y reportes detallados de ventas, productos más vendidos, horas pico y más.",
      color: "from-cyan-500 to-teal-500",
    },
    {
      icon: Settings,
      title: "Personalización Total",
      description:
        "Adapta la plataforma a tu marca con opciones de personalización de colores, logos, imágenes y diseño de menú digital para tus clientes.",
      color: "from-teal-500 to-green-500",
    },
    {
      icon: Users,
      title: "Gestión de Personal",
      description:
        "Administra usuarios, permisos y turnos de trabajo para todo tu equipo. Control de acceso por roles y seguimiento de productividad.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: ChefHat,
      title: "Gestión de Cocina",
      description:
        "Optimiza las operaciones de cocina con pantallas de preparación, tiempos estimados y notificaciones para el personal de cocina.",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: Clock,
      title: "Reservas y Espera",
      description:
        "Sistema de reservas online integrado con gestión de mesas y lista de espera digital para optimizar la ocupación del local.",
      color: "from-teal-500 to-cyan-500",
    },
    {
      icon: Star,
      title: "Fidelización de Clientes",
      description:
        "Programas de lealtad, cupones de descuento y tarjetas de regalo para aumentar la retención y satisfacción de tus clientes.",
      color: "from-cyan-500 to-blue-500",
    },
  ]

  return (
    <section ref={featuresRef} className="w-full py-20 md:py-28 bg-white relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, purple 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <h2
            ref={featureTitleRef}
            className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600"
          >
            Funcionalidades de Clase Mundial
          </h2>
          <p ref={featureDescRef} className="text-xl text-gray-600 max-w-3xl mx-auto">
            Todo lo que necesitas para administrar tu restaurante en una sola plataforma potente e intuitiva
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {features.map((feature, index) => (
            <div
              key={index}
              ref={addToRefs}
              className="bg-white rounded-xl p-8 border border-gray-100 shadow-lg shadow-purple-900/5 hover:shadow-xl hover:shadow-purple-900/10 transition-all duration-300"
            >
              <div
                className={`h-14 w-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 feature-icon`}
              >
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function StatsSection() {
  return (
    <section className="w-full py-16 bg-gradient-to-r from-purple-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="p-6">
            <div className="text-4xl md:text-5xl font-bold mb-2">2,500+</div>
            <div className="text-purple-200">Restaurantes</div>
          </div>
          <div className="p-6">
            <div className="text-4xl md:text-5xl font-bold mb-2">15M+</div>
            <div className="text-purple-200">Pedidos Procesados</div>
          </div>
          <div className="p-6">
            <div className="text-4xl md:text-5xl font-bold mb-2">98%</div>
            <div className="text-purple-200">Satisfacción</div>
          </div>
          <div className="p-6">
            <div className="text-4xl md:text-5xl font-bold mb-2">24/7</div>
            <div className="text-purple-200">Soporte Técnico</div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TestimonialSection() {
  const { testimonialRef, addToTestimonialRefs, testimonialTitleRef, testimonialDescRef } = TestimonialAnimation()

  return (
    <section ref={testimonialRef} className="w-full py-20 md:py-28 bg-gray-50 relative">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-white to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-white to-transparent"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <h2
            ref={testimonialTitleRef}
            className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600"
          >
            Lo que dicen nuestros clientes
          </h2>
          <p ref={testimonialDescRef} className="text-xl text-gray-600 max-w-3xl mx-auto">
            Restaurantes que han transformado su gestión con nuestra plataforma
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          <div
            ref={addToTestimonialRefs}
            className="bg-white rounded-xl shadow-xl p-8 border border-purple-100 relative"
          >
            <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>
            <div className="mb-4 flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="italic mb-6 text-gray-700">
              "Desde que implementamos GastroManager, nuestras operaciones diarias son mucho más eficientes. El sistema
              de pedidos y el punto de venta son excelentes. Hemos aumentado nuestras ventas en un 30%."
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                <span className="text-purple-700 font-bold">MG</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900">María González</div>
                <div className="text-sm text-gray-600">Restaurante El Sabor</div>
              </div>
            </div>
          </div>

          <div
            ref={addToTestimonialRefs}
            className="bg-white rounded-xl shadow-xl p-8 border border-indigo-100 relative"
          >
            <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>
            <div className="mb-4 flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="italic mb-6 text-gray-700">
              "La facilidad para gestionar el menú y las categorías nos ha permitido actualizar nuestra oferta
              constantemente. Los clientes lo notan y lo aprecian. El soporte técnico es excepcional."
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                <span className="text-indigo-700 font-bold">CR</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Carlos Rodríguez</div>
                <div className="text-sm text-gray-600">Café Aroma</div>
              </div>
            </div>
          </div>

          <div ref={addToTestimonialRefs} className="bg-white rounded-xl shadow-xl p-8 border border-blue-100 relative">
            <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>
            <div className="mb-4 flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="italic mb-6 text-gray-700">
              "Los informes de ventas y el análisis de datos nos han ayudado a tomar mejores decisiones de negocio.
              Recomiendo GastroManager sin dudarlo. Ha revolucionado la forma en que gestionamos nuestro restaurante."
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <span className="text-blue-700 font-bold">LM</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Laura Martínez</div>
                <div className="text-sm text-gray-600">Bistró Moderno</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CtaSection() {
  return (
    <section className="w-full py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600"></div>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M 8 0 L 0 0 0 8" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Lleva tu Restaurante al Siguiente Nivel</h2>
          <p className="text-xl text-purple-100 mb-10 max-w-3xl mx-auto">
            Únete a miles de restaurantes que ya están optimizando su gestión con GastroManager. Prueba gratis por 14
            días, sin compromiso.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register">
              <Button
                size="lg"
                className="px-8 py-6 text-lg font-semibold bg-white text-purple-700 hover:bg-purple-50 border-none shadow-lg hover:shadow-xl transition-all"
              >
                Comenzar prueba gratuita
              </Button>
            </Link>
            <Link href="/contacto">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg border-white text-white hover:bg-white/10 transition-all"
              >
                Contactar con ventas
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
