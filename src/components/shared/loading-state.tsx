import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingStateProps {
  message?: string
  className?: string
}

export function LoadingState({ message, className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[200px] flex-col items-center justify-center p-8",
        className
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-zinc-400 dark:text-zinc-500" />
      {message && (
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
          {message}
        </p>
      )}
    </div>
  )
}
