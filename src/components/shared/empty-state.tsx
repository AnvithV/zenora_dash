import type { LucideIcon } from "lucide-react"
import { Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center animate-fade-in dark:border-slate-800 dark:bg-slate-900/30">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-50 ring-1 ring-violet-100 dark:bg-violet-900/20 dark:ring-violet-800">
        <Icon className="h-7 w-7 text-violet-400 dark:text-violet-400" />
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} size="sm" className="mt-5">
          {action.label}
        </Button>
      )}
    </div>
  )
}
