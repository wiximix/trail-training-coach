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
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          "w-full rounded-md border px-4 py-2 text-sm",
          "border-gray-300 text-gray-900",
          "focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
          "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500",
          error && "border-red-300 focus:border-red-500 focus:ring-red-500",
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
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}
