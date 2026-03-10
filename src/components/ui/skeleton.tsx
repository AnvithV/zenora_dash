import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-md bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] dark:from-slate-800 dark:via-slate-700 dark:to-slate-800",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
