/**
 * 样式工具函数和常量
 * 提供常用的复用样式类，避免代码重复
 */

import { cn } from "@/lib/utils"

/**
 * 卡片样式
 * 用于统一卡片容器的外观
 */
export const cardStyles = cn(
  "rounded-lg p-6 shadow-md border",
  "bg-white dark:bg-gray-800",
  "border-gray-200 dark:border-gray-700"
)

/**
 * 表单容器样式
 * 用于表单项之间的间距
 */
export const formContainerStyles = "space-y-4"

/**
 * 表单区域标题样式
 * 用于分隔表单区域的标题
 */
export const sectionTitleStyles = cn(
  "mb-4 text-xl font-semibold",
  "text-gray-900 dark:text-white"
)

/**
 * 输入框标签容器样式
 */
export const inputLabelContainerStyles = "mb-2"

/**
 * 错误提示容器样式
 */
export const errorContainerStyles = cn(
  "rounded-lg p-4 text-sm",
  "bg-red-50 dark:bg-red-900/20",
  "text-red-600 dark:text-red-400",
  "border border-red-200 dark:border-red-800"
)

/**
 * 成功提示容器样式
 */
export const successContainerStyles = cn(
  "rounded-lg p-4 text-sm",
  "bg-green-50 dark:bg-green-900/20",
  "text-green-600 dark:text-green-400",
  "border border-green-200 dark:border-green-800"
)

/**
 * 警告提示容器样式
 */
export const warningContainerStyles = cn(
  "rounded-lg p-4 text-sm",
  "bg-yellow-50 dark:bg-yellow-900/20",
  "text-yellow-600 dark:text-yellow-400",
  "border border-yellow-200 dark:border-yellow-800"
)

/**
 * 信息提示容器样式
 */
export const infoContainerStyles = cn(
  "rounded-lg p-4 text-sm",
  "bg-blue-50 dark:bg-blue-900/20",
  "text-blue-600 dark:text-blue-400",
  "border border-blue-200 dark:border-blue-800"
)

/**
 * 状态颜色类映射
 * 根据状态返回对应的样式类
 */
export const statusColors = {
  success: cn(
    "text-green-600 dark:text-green-400",
    "bg-green-50 dark:bg-green-900/20",
    "border-green-200 dark:border-green-800"
  ),
  error: cn(
    "text-red-600 dark:text-red-400",
    "bg-red-50 dark:bg-red-900/20",
    "border-red-200 dark:border-red-800"
  ),
  warning: cn(
    "text-yellow-600 dark:text-yellow-400",
    "bg-yellow-50 dark:bg-yellow-900/20",
    "border-yellow-200 dark:border-yellow-800"
  ),
  info: cn(
    "text-blue-600 dark:text-blue-400",
    "bg-blue-50 dark:bg-blue-900/20",
    "border-blue-200 dark:border-blue-800"
  ),
} as const

/**
 * 导航按钮样式（激活状态）
 */
export const navButtonActiveStyles = cn(
  "bg-blue-50 dark:bg-blue-900/30",
  "text-blue-700 dark:text-blue-300"
)

/**
 * 导航按钮样式（未激活状态）
 */
export const navButtonInactiveStyles = cn(
  "text-gray-600 dark:text-gray-300",
  "hover:text-gray-900 dark:hover:text-white",
  "hover:bg-gray-50 dark:hover:bg-gray-700"
)

/**
 * 页面容器样式
 */
export const pageContainerStyles = cn(
  "min-h-screen",
  "bg-gray-50 dark:bg-gray-900"
)

/**
 * 内容区域样式
 */
export const contentAreaStyles = "p-6"

/**
 * 按钮组容器样式
 */
export const buttonGroupStyles = "flex items-center gap-2"

/**
 * 网格布局样式
 */
export const grid2ColsStyles = "grid grid-cols-2 gap-4"

export const grid3ColsStyles = "grid grid-cols-3 gap-4"

/**
 * 分隔线样式
 */
export const dividerStyles = cn(
  "border-t",
  "border-gray-200 dark:border-gray-700"
)

/**
 * 图标按钮样式
 */
export const iconButtonStyles = cn(
  "p-2 rounded-lg",
  "transition-colors",
  "hover:bg-gray-100 dark:hover:bg-gray-700",
  "text-gray-600 dark:text-gray-300"
)

/**
 * 类型定义
 */
export type StatusColorType = keyof typeof statusColors
