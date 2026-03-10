"use client"

import type { LucideIcon } from "lucide-react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    direction: "up" | "down"
  }
  className?: string
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("group relative overflow-hidden", className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <CardContent className="relative p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>
          {Icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-50 ring-1 ring-violet-100 transition-colors group-hover:bg-violet-100 dark:bg-violet-900/20 dark:ring-violet-800 dark:group-hover:bg-violet-900/30">
              <Icon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
          )}
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{value}</p>
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
                trend.direction === "up"
                  ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              )}
            >
              {trend.direction === "up" ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend.value}%
            </span>
          )}
        </div>
        {description && (
          <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
