import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { VariantProps } from "class-variance-authority"

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof Button> {
  icon: React.ReactNode
  label?: string
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, icon, label, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn("p-0 h-8 w-8", className)}
        {...props}
        aria-label={label || "Button"}
      >
        {icon}
      </Button>
    )
  },
)

IconButton.displayName = "IconButton"
