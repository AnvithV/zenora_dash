import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold leading-5 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:focus:ring-violet-400",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-violet-600 text-white hover:bg-violet-600/80 dark:bg-violet-500 dark:text-white dark:hover:bg-violet-500/80",
        secondary:
          "border-transparent bg-violet-100 text-violet-900 hover:bg-violet-100/80 dark:bg-violet-900/30 dark:text-violet-200 dark:hover:bg-violet-900/50",
        destructive:
          "border-transparent bg-red-500 text-white hover:bg-red-500/80 dark:bg-red-900 dark:text-white dark:hover:bg-red-900/80",
        outline: "text-slate-900 dark:text-slate-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
