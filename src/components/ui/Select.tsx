/**
 * 通用选择框组件
 */

import { cn } from "@/lib/utils"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options: {
    value: string | number
    label: string
  }[]
}

export function Select({
  className,
  label,
  error,
  helperText,
  id,
  options,
  ...props
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          "w-full rounded-md border px-4 py-2 text-sm",
          "border-gray-300 dark:border-gray-600",
          "text-gray-900 dark:text-white",
          "bg-white dark:bg-gray-700",
          "focus:border-blue-500 dark:focus:border-blue-400",
          "focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400",
          "disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800",
          "disabled:text-gray-500 dark:disabled:text-gray-400",
          error && "border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}
