import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "../../lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const baseClass = 'btn'
    const variantClass = {
      default: 'btn-primary',
      outline: 'btn-outline',
      secondary: 'bg-orange-100 text-orange-900',
      ghost: 'bg-transparent hover:bg-orange-100',
      link: 'text-orange-900 underline-offset-4 hover:underline'
    }[variant]
    
    const sizeClass = {
      default: 'h-9 px-4 py-2',
      sm: 'h-8 px-3 text-sm',
      lg: 'h-10 px-8',
      icon: 'h-9 w-9'
    }[size]

    return (
      <Comp
        className={cn(baseClass, variantClass, sizeClass, className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }