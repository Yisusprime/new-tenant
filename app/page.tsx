import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Check, ChefHat, CreditCard, Layers, ShoppingCart, Smartphone, Star, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container px-4 py-16 mx-auto sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <Badge className="px-3 py-1 text-sm font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
                All-in-one Restaurant Solution
              </Badge>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Manage Your Restaurant <span className="text-orange-600 dark:text-orange-400">Effortlessly</span>
              </h1>
              <p className="max-w-xl text-lg text-gray-600 dark:text-gray-300">
                A complete multi-tenant platform designed specifically for restaurants. Manage menus, orders, tables,
                and more with our intuitive dashboard.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/register" passHref>
                  <Button size="lg" className="gap-2 bg-orange-600 hover:bg-orange-700">
                    Get Started <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/login" passHref>
                  <Button size="lg" variant="outline">
                    Log In
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/modern-restaurant-interior.png"
                  alt="Modern restaurant interior"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 rounded-xl overflow-hidden shadow-xl border-4 border-white dark:border-gray-800">
                <Image src="/restaurant-logo.png" alt="Restaurant logo" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything You Need to Run Your Restaurant
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Our platform combines all essential tools in one place, making restaurant management simpler than ever.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 transition-all duration-200 bg-gray-50 rounded-xl hover:shadow-md dark:bg-gray-800"
              >
                <div className="flex items-center justify-center w-12 h-12 mb-4 text-white bg-orange-600 rounded-lg dark:bg-orange-700">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Showcase */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Delicious Menu Management</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Showcase your culinary creations with our beautiful menu system
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {products.map((product, index) => (
              <div
                key={index}
                className="overflow-hidden transition-all duration-200 bg-white rounded-xl hover:shadow-lg dark:bg-gray-700"
              >
                <div className="relative h-48">
                  <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{product.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-bold text-orange-600 dark:text-orange-400">${product.price}</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                      <span className="ml-1 text-sm">{product.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Why Choose Our Platform?</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Our multi-tenant restaurant management system offers unique advantages that set it apart from the
                competition.
              </p>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex">
                    <div className="flex-shrink-0">
                      <Check className="w-6 h-6 text-green-500" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium">{benefit.title}</h3>
                      <p className="mt-1 text-gray-600 dark:text-gray-400">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-xl">
                <Image src="/abstract-geometric-shapes.png" alt="Platform dashboard" fill className="object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-64 p-6 bg-white rounded-xl shadow-lg dark:bg-gray-800">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-green-100 rounded-full dark:bg-green-900">
                    <CreditCard className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Revenue</p>
                    <p className="text-2xl font-bold">$24,389</p>
                  </div>
                </div>
                <div className="w-full h-2 mt-4 bg-gray-200 rounded-full dark:bg-gray-700">
                  <div className="h-2 bg-green-500 rounded-full" style={{ width: "78%" }}></div>
                </div>
                <p className="mt-1 text-xs text-right text-gray-500 dark:text-gray-400">+18% from last month</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Trusted by Restaurant Owners</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              See what our customers have to say about our platform
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="p-6 bg-white rounded-xl shadow-sm dark:bg-gray-700">
                <div className="flex items-center mb-4 space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{testimonial.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300">"{testimonial.quote}"</p>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-orange-600 dark:bg-orange-800">
        <div className="container px-4 mx-auto text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Transform Your Restaurant?
          </h2>
          <p className="max-w-2xl mx-auto mt-4 text-lg text-orange-100">
            Join thousands of restaurant owners who have streamlined their operations with our platform.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link href="/register" passHref>
              <Button size="lg" className="gap-2 bg-white text-orange-600 hover:bg-orange-50">
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login" passHref>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-orange-700">
                Schedule Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-300">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Restaurant OS</h3>
              <p className="text-sm">
                The complete restaurant management platform designed to streamline operations and boost your business.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Features</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-white">
                    Menu Management
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Order Processing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Table Management
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Cashier System
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-white">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Contact</h3>
              <ul className="space-y-2 text-sm">
                <li>contact@restaurantos.com</li>
                <li>+1 (555) 123-4567</li>
                <li>123 Main Street, City</li>
              </ul>
            </div>
          </div>
          <Separator className="my-8 bg-gray-800" />
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <p className="text-sm">© {new Date().getFullYear()} Restaurant OS. All rights reserved.</p>
            <div className="flex space-x-4">
              <Link href="#" className="hover:text-white">
                Terms
              </Link>
              <Link href="#" className="hover:text-white">
                Privacy
              </Link>
              <Link href="#" className="hover:text-white">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Data for the page
const features = [
  {
    icon: <ChefHat className="w-6 h-6" />,
    title: "Menu Management",
    description: "Create and manage your menu items, categories, and pricing with our intuitive interface.",
  },
  {
    icon: <ShoppingCart className="w-6 h-6" />,
    title: "Order Processing",
    description: "Take orders efficiently, manage delivery, and track order status in real-time.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Table Management",
    description: "Optimize your dining space with visual table management and reservation system.",
  },
  {
    icon: <CreditCard className="w-6 h-6" />,
    title: "Cashier System",
    description: "Process payments, track sales, and manage your cash flow with our integrated POS.",
  },
  {
    icon: <Layers className="w-6 h-6" />,
    title: "Multi-tenant Architecture",
    description: "Manage multiple restaurant locations from a single dashboard with separate data.",
  },
  {
    icon: <Smartphone className="w-6 h-6" />,
    title: "Mobile Responsive",
    description: "Access your restaurant management system from any device, anywhere, anytime.",
  },
]

const products = [
  {
    name: "Pizza Margherita",
    description: "Classic Italian pizza with tomato sauce, mozzarella, and basil",
    price: "12.99",
    rating: "4.8",
    image: "/pizza-margherita.png",
  },
  {
    name: "Pasta Carbonara",
    description: "Creamy pasta with pancetta, eggs, and parmesan cheese",
    price: "14.99",
    rating: "4.7",
    image: "/pasta-carbonara.png",
  },
  {
    name: "Tacos al Pastor",
    description: "Traditional Mexican tacos with marinated pork and pineapple",
    price: "10.99",
    rating: "4.9",
    image: "/tacos-al-pastor.png",
  },
  {
    name: "Fresh Salad Bowl",
    description: "Healthy mix of fresh vegetables with house dressing",
    price: "8.99",
    rating: "4.6",
    image: "/vibrant-salad-bowl.png",
  },
]

const benefits = [
  {
    title: "Increase Operational Efficiency",
    description: "Reduce manual work and streamline processes to save time and reduce errors.",
  },
  {
    title: "Boost Revenue",
    description: "Optimize your menu, pricing, and table turnover to maximize profits.",
  },
  {
    title: "Enhance Customer Experience",
    description: "Provide faster service and personalized experiences to keep customers coming back.",
  },
  {
    title: "Real-time Analytics",
    description: "Make data-driven decisions with comprehensive reports and dashboards.",
  },
  {
    title: "Secure and Reliable",
    description: "Your data is protected with enterprise-grade security and regular backups.",
  },
]

const testimonials = [
  {
    name: "Maria Rodriguez",
    role: "Owner, La Trattoria",
    quote:
      "This platform has completely transformed how we run our restaurant. Orders are processed faster, and our staff loves how easy it is to use.",
  },
  {
    name: "James Chen",
    role: "Manager, Fusion Kitchen",
    quote:
      "The multi-tenant feature allows me to manage our three locations seamlessly. The analytics help us make better business decisions every day.",
  },
  {
    name: "Sarah Johnson",
    role: "Owner, Café Delight",
    quote:
      "Customer satisfaction has increased dramatically since we started using this system. The table management feature alone has been worth the investment.",
  },
]
