import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "../../lib/utils"
import "../../styles/button.css"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    const baseClass = "btn"
    const variantClass = {
      default: "btn-primary",
      outline: "btn-outline",
      secondary: "btn-secondary",
      ghost: "btn-ghost",
      link: "btn-link",
    }[variant]

    const sizeClass = {
      default: "btn-default",
      sm: "btn-sm",
      lg: "btn-lg",
      icon: "btn-icon",
    }[size]

    return <Comp className={cn(baseClass, variantClass, sizeClass, className || "")} ref={ref} {...props} />
  },
)
Button.displayName = "Button"

export { Button }

