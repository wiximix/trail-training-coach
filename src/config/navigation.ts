/**
 * 导航配置
 */

export interface NavItem {
  href: string
  label: string
  icon?: string
  roles?: string[]
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "首页" },
  { href: "/members", label: "成员管理" },
  { href: "/trails", label: "赛道管理" },
  { href: "/predict", label: "成绩预测" },
  { href: "/reviews", label: "训练复盘" },
  { href: "/teams", label: "跑团" },
  { href: "/settings", label: "系统设置" },
]

export const AUTH_NAV_ITEMS: NavItem[] = [
  { href: "/auth/login", label: "登录" },
  { href: "/auth/register", label: "注册" },
]

export const PROTECTED_PATHS = [
  "/",
  "/profile",
  "/members",
  "/trails",
  "/predict",
  "/reviews",
  "/teams",
  "/settings",
]

export const AUTH_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
]
