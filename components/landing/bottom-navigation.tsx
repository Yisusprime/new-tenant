"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Home, Search, Plus, ShoppingBag, User } from "lucide-react"
import Image from "next/image"
import type { Category } from "@/components/categories/category-context"

interface BottomNavigationProps {
  categories: Category[]
  itemCount: number
  buttonColor: string
  buttonTextColor: string
}

export function BottomNavigation({ categories, itemCount, buttonColor, buttonTextColor }: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
      <div className="flex justify-around items-center h-16 px-4">
        <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2">
          <Home size={20} />
          <span className="text-xs">Inicio</span>
        </Button>

        <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2">
          <Search size={20} />
          <span className="text-xs">Buscar</span>
        </Button>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              className="flex items-center justify-center rounded-full h-14 w-14 shadow-lg -mt-5"
              style={{
                backgroundColor: buttonColor,
                color: buttonTextColor,
              }}
            >
              <Plus size={24} />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
            <div className="pt-6">
              <h2 className="text-xl font-bold mb-6 text-center">Todas las categorías</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 sm:gap-6">
                {categories.map((category) => (
                  <Link
                    href={`/admin/menu?category=${category.id}`}
                    key={category.id}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white shadow-sm overflow-hidden">
                      <Image
                        src={category.imageUrl || "/placeholder.svg?height=80&width=80&query=categoria+comida"}
                        alt={category.name}
                        fill
                        className="object-cover p-2"
                      />
                    </div>
                    <span className="text-xs text-center font-medium">{category.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/cart">
          <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 relative">
            <ShoppingBag size={20} />
            <span className="text-xs">Carrito</span>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Button>
        </Link>

        <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2">
          <User size={20} />
          <span className="text-xs">Perfil</span>
        </Button>
      </div>
    </div>
  )
}
