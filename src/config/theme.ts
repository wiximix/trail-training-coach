/**
 * 主题配置
 */

export type Theme = "light" | "dark" | "system"

export const THEMES: Theme[] = ["light", "dark", "system"]

export const THEME_STORAGE_KEY = "theme"

export function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light"

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

export function getTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    return getSystemTheme()
  }
  return theme
}
