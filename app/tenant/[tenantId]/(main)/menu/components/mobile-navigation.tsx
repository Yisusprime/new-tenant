"use client"
import { HomeIcon, SearchIcon, PlusCircleIcon, HeartIcon, UserIcon } from "@heroicons/react/24/outline"
import { useRouter } from "next/navigation"

export function MobileNavigation() {
  const router = useRouter()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 z-50 shadow-lg">
      <div className="flex items-center justify-around h-16">
        <button onClick={() => router.push("/")} aria-label="Home">
          <HomeIcon className="h-6 w-6" />
        </button>
        <button onClick={() => router.push("/search")} aria-label="Search">
          <SearchIcon className="h-6 w-6" />
        </button>
        <button onClick={() => router.push("/create")} aria-label="Create">
          <PlusCircleIcon className="h-6 w-6" />
        </button>
        <button onClick={() => router.push("/favorites")} aria-label="Favorites">
          <HeartIcon className="h-6 w-6" />
        </button>
        <button onClick={() => router.push("/profile")} aria-label="Profile">
          <UserIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}
