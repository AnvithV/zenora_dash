"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-violet-600 text-white shadow-sm hover:bg-violet-700 hover:shadow-md dark:bg-violet-500 dark:text-white dark:hover:bg-violet-400",
        destructive: "bg-red-500 text-white shadow-sm hover:bg-red-500/90 hover:shadow-md dark:bg-red-900 dark:text-white dark:hover:bg-red-900/90",
        outline: "border border-slate-200 bg-white shadow-sm hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:hover:text-violet-300",
        secondary: "bg-violet-100 text-violet-900 hover:bg-violet-100/80 dark:bg-violet-900/30 dark:text-violet-200 dark:hover:bg-violet-900/50",
        ghost: "hover:bg-violet-50 hover:text-violet-700 dark:hover:bg-slate-800 dark:hover:text-violet-300",
        link: "text-violet-700 underline-offset-4 hover:underline dark:text-violet-400",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
