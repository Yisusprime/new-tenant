import type React from "react"
import { cn } from "@/lib/utils"

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  variant?: "default" | "wide"
}

export function PageContainer({ children, className, variant = "default" }: PageContainerProps) {
  return (
    <div className={cn("w-full mx-auto px-4", variant === "default" ? "container" : "max-w-7xl", className)}>
      {children}
    </div>
  )
}
