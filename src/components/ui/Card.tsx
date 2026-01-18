/**
 * 通用卡片组件
 */

import { cn } from "@/lib/utils"

export interface CardProps {
  children: React.ReactNode
  className?: string
  noPadding?: boolean
}

export function Card({ children, className, noPadding = false }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg shadow-md border",
        "bg-white dark:bg-gray-800",
        "border-gray-200 dark:border-gray-700",
        noPadding ? "" : "p-6",
        className
      )}
    >
      {children}
    </div>
  )
}
