import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#050E2F] text-white">
      <header className="py-6 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="bg-[#0A1642]/80 backdrop-blur-md rounded-full py-3 px-6 flex justify-between items-center">
            <div className="text-2xl font-bold">Gastroo</div>
            <nav className="hidden md:flex gap-6">
              <Link href="#features" className="text-gray-300 hover:text-white transition">
                Características
              </Link>
              <Link href="#how-it-works" className="text-gray-300 hover:text-white transition">
                Cómo funciona
              </Link>
              <Link href="#pricing" className="text-gray-300 hover:text-white transition">
                Precios
              </Link>
              <Link href="#testimonials" className="text-gray-300 hover:text-white transition">
                Testimonios
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <Button
                asChild
                variant="ghost"
                className="hidden md:inline-flex text-gray-300 hover:text-white hover:bg-[#1A2A5E]"
              >
                <Link href="/login">Iniciar sesión</Link>
              </Button>
              <Button asChild className="bg-white text-[#050E2F] hover:bg-gray-200 rounded-full">
                <Link href="/register">Registrarse</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('/grid-pattern.png')] bg-repeat opacity-10"></div>
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Gestiona tu restaurante de forma digital
            </h1>
            <p className="text-xl mb-10 text-gray-300 max-w-2xl mx-auto">
              Recibe y gestiona todos los pedidos de tu negocio con tu propio subdominio personalizado.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-white text-[#050E2F] hover:bg-gray-200 rounded-full px-8 py-6 text-lg"
            >
              <Link href="/register">Habla con ventas</Link>
            </Button>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="py-16 bg-white text-[#050E2F]">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-600 mb-10 uppercase tracking-wider text-sm font-medium">
              +500 restaurantes confían en nosotros
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition duration-300"
                >
                  <Image
                    src={`/restaurant-logo.png?height=40&width=120&query=restaurant logo ${i}`}
                    alt={`Logo partner ${i}`}
                    width={120}
                    height={40}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-[#0A1642]">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">Todo lo que necesitas para tu restaurante digital</h2>
              <p className="text-xl text-gray-300">
                Una plataforma completa diseñada específicamente para las necesidades de tu restaurante
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="p-6 rounded-xl bg-[#162252] hover:bg-[#1D2B63] transition duration-300">
                  <div className="w-12 h-12 bg-[#2A3A7B] rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 bg-[#050E2F]">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">Cómo funciona</h2>
              <p className="text-xl text-gray-300">Comienza a usar Gastroo en tres simples pasos</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-16 left-[calc(100%_-_16px)] w-16 border-t-2 border-dashed border-[#2A3A7B]"></div>
                  )}
                  <div className="bg-[#162252] rounded-xl p-8 h-full flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-white text-[#050E2F] flex items-center justify-center font-bold text-xl mb-6">
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-gray-300">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-24 bg-[#0A1642]">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">Lo que dicen nuestros clientes</h2>
              <p className="text-xl text-gray-300">Restaurantes que han transformado su negocio con Gastroo</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-[#162252] p-6 rounded-xl">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <Image
                        src={`/diverse-group.png?height=48&width=48&query=person ${index + 1}`}
                        alt={testimonial.name}
                        width={48}
                        height={48}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-gray-300">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-300">{testimonial.quote}</p>
                  <div className="mt-4 flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24 bg-[#050E2F]">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">Planes simples y transparentes</h2>
              <p className="text-xl text-gray-300">
                Elige el plan que mejor se adapte a las necesidades de tu restaurante
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <div
                  key={index}
                  className={`rounded-xl overflow-hidden ${
                    plan.popular ? "border-2 border-white relative shadow-xl" : "border border-[#2A3A7B] shadow-sm"
                  }`}
                >
                  {plan.popular && (
                    <div className="bg-white text-[#050E2F] text-center py-1 text-sm font-medium">Más popular</div>
                  )}
                  <div className="p-6 bg-[#162252]">
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-gray-300 mb-4">{plan.description}</p>
                    <div className="mb-4">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-gray-300">/mes</span>
                    </div>
                    <Button
                      asChild
                      className={`w-full rounded-full ${
                        plan.popular ? "bg-white text-[#050E2F] hover:bg-gray-200" : "bg-[#2A3A7B] hover:bg-[#354990]"
                      }`}
                    >
                      <Link href="/register">Comenzar</Link>
                    </Button>
                    <ul className="mt-6 space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-[#0A1642]">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">¿Listo para transformar tu restaurante?</h2>
              <p className="text-xl mb-8 text-gray-300">
                Únete a cientos de restaurantes que ya están creciendo con Gastroo
              </p>
              <Button
                asChild
                size="lg"
                className="bg-white text-[#050E2F] hover:bg-gray-200 rounded-full px-8 py-6 text-lg"
              >
                <Link href="/register">Habla con ventas</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#0A1642] py-16 border-t border-[#2A3A7B]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            <div className="col-span-2">
              <div className="text-2xl font-bold mb-4">Gastroo</div>
              <p className="text-gray-300 mb-4">La plataforma completa para gestionar tu restaurante en línea.</p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-300 hover:text-white transition">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
              <h3 className="text-lg font-semibold mb-4">Producto</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-gray-300 hover:text-white transition">
                    Características
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-gray-300 hover:text-white transition">
                    Precios
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white transition">
                    Integraciones
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white transition">
                    Actualizaciones
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white transition">
                    Documentación
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white transition">
                    Guías
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white transition">
                    Centro de ayuda
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white transition">
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white transition">
                    Acerca de
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white transition">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white transition">
                    Carreras
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white transition">
                    Prensa
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-[#2A3A7B] text-center text-gray-300">
            <p>&copy; {new Date().getFullYear()} Gastroo. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Data for features section
const features = [
  {
    title: "Tu Propio Subdominio",
    description: "Obtén un subdominio personalizado para tu restaurante (turestaurante.gastroo.online).",
    icon: (props) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    title: "Gestión de Menús",
    description:
      "Crea y actualiza fácilmente tus menús, categorías y productos con imágenes y descripciones detalladas.",
    icon: (props) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M3 3h18v18H3zM8 12h8" />
        <path d="M12 8v8" />
      </svg>
    ),
  },
  {
    title: "Pedidos en Línea",
    description:
      "Recibe pedidos en línea y gestiona todo el proceso desde un solo lugar con notificaciones en tiempo real.",
    icon: (props) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
  },
  {
    title: "Múltiples Sucursales",
    description: "Administra varias sucursales de tu restaurante desde una sola plataforma centralizada.",
    icon: (props) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    title: "Control de Caja",
    description: "Lleva un registro detallado de tus ingresos y gastos con nuestro sistema de control de caja.",
    icon: (props) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    title: "Analíticas Detalladas",
    description: "Obtén información valiosa sobre el rendimiento de tu restaurante con nuestras analíticas detalladas.",
    icon: (props) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
        <path d="M22 12A10 10 0 0 0 12 2v10z" />
      </svg>
    ),
  },
]

// Data for how it works section
const steps = [
  {
    title: "Regístrate",
    description: "Crea tu cuenta en minutos y configura tu subdominio personalizado.",
  },
  {
    title: "Configura tu Menú",
    description: "Añade tus categorías, productos y personaliza la apariencia de tu restaurante.",
  },
  {
    title: "Recibe Pedidos",
    description: "Comienza a recibir pedidos en línea y gestiona tu negocio de forma eficiente.",
  },
]

// Data for testimonials section
const testimonials = [
  {
    name: "María Rodríguez",
    role: "Dueña de La Trattoria",
    quote:
      "Desde que implementamos Gastroo, nuestras ventas en línea han aumentado un 40%. La plataforma es intuitiva y nuestros clientes la adoran.",
  },
  {
    name: "Carlos Mendoza",
    role: "Gerente de Sabor Mexicano",
    quote:
      "La gestión de múltiples sucursales era un dolor de cabeza hasta que encontramos Gastroo. Ahora todo está centralizado y es mucho más eficiente.",
  },
  {
    name: "Ana Martínez",
    role: "Chef de Delicias Caseras",
    quote:
      "El control de inventario y la gestión de pedidos de Gastroo nos ha permitido reducir desperdicios y mejorar nuestro servicio al cliente.",
  },
]

// Data for pricing section
const pricingPlans = [
  {
    name: "Básico",
    description: "Ideal para restaurantes pequeños",
    price: "29",
    features: ["1 sucursal", "Menú digital", "Pedidos en línea", "Subdominio personalizado", "Soporte por email"],
  },
  {
    name: "Profesional",
    description: "Para restaurantes en crecimiento",
    price: "79",
    popular: true,
    features: [
      "Hasta 3 sucursales",
      "Menú digital avanzado",
      "Pedidos en línea",
      "Control de caja",
      "Analíticas básicas",
      "Soporte prioritario",
    ],
  },
  {
    name: "Empresarial",
    description: "Para cadenas de restaurantes",
    price: "149",
    features: [
      "Sucursales ilimitadas",
      "Menú digital avanzado",
      "Pedidos en línea",
      "Control de caja avanzado",
      "Analíticas detalladas",
      "API personalizada",
      "Soporte 24/7",
    ],
  },
]
