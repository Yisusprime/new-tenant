"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function useSafeRouter() {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Devuelve un objeto con los mismos métodos que router, pero seguros
  return {
    push: (...args: Parameters<typeof router.push>) => {
      if (isMounted) router.push(...args)
    },
    replace: (...args: Parameters<typeof router.replace>) => {
      if (isMounted) router.replace(...args)
    },
    back: () => {
      if (isMounted) router.back()
    },
    forward: () => {
      if (isMounted) router.forward()
    },
    refresh: () => {
      if (isMounted) router.refresh()
    },
    prefetch: (...args: Parameters<typeof router.prefetch>) => {
      if (isMounted) router.prefetch(...args)
    },
    isMounted,
  }
}
