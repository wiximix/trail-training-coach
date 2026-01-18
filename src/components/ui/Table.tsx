/**
 * 通用表格组件
 */

import { cn } from "@/lib/utils"

export interface TableProps {
  columns: {
    key: string
    label: string
    className?: string
  }[]
  data: any[]
  onRowClick?: (row: any, index: number) => void
  className?: string
  emptyMessage?: string
}

export function Table({
  columns,
  data,
  onRowClick,
  className,
  emptyMessage = "暂无数据",
}: TableProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider",
                  "text-gray-500 dark:text-gray-400",
                  column.className
                )}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={index}
                onClick={() => onRowClick?.(row, index)}
                className={cn(
                  "transition-colors",
                  onRowClick && "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "whitespace-nowrap px-4 py-3 text-sm",
                      "text-gray-900 dark:text-white",
                      column.className
                    )}
                  >
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
