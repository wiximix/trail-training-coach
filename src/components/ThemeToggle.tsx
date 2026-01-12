"use client"

import { useTheme } from "@/lib/theme"
import { Sun, Moon } from "lucide-react"

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group"
      title={theme === "light" ? "切换到深色模式" : "切换到浅色模式"}
    >
      <Sun className="w-5 h-5 text-amber-500 dark:text-amber-400 transition-all duration-300 dark:scale-0 dark:opacity-0" />
      <Moon className="absolute inset-0 m-auto w-5 h-5 text-gray-700 dark:text-gray-200 transition-all duration-300 scale-0 opacity-0 dark:scale-100 dark:opacity-100" />
    </button>
  )
}
