export interface AuthUser {
  id: string
  username: string
  email: string
  isActive: boolean
  createdAt: string
  updatedAt: string | null
}

// Cookie 相关配置
const COOKIE_NAME = "token"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 天

// 从 localStorage 获取 token
export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

// 从 localStorage 获取用户信息
export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null
  const userStr = localStorage.getItem("user")
  if (!userStr) return null
  try {
    return JSON.parse(userStr) as AuthUser
  } catch {
    return null
  }
}

// 设置 token 和用户信息（同时保存到 localStorage 和 cookie）
export function setAuth(token: string, user: AuthUser): void {
  if (typeof window === "undefined") return

  console.log("[Auth] 保存认证信息:", {
    userId: user.id,
    username: user.username,
    hasToken: !!token,
  })

  // 保存到 localStorage
  localStorage.setItem("token", token)
  localStorage.setItem("user", JSON.stringify(user))

  // 保存到 cookie（供中间件使用）
  document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`

  console.log("[Auth] 认证信息已保存到 localStorage 和 cookie")
}

// 清除 token 和用户信息（同时清除 localStorage 和 cookie）
export function clearAuth(): void {
  if (typeof window === "undefined") return

  console.log("[Auth] 清除认证信息")

  // 清除 localStorage
  localStorage.removeItem("token")
  localStorage.removeItem("user")

  // 清除 cookie
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`

  console.log("[Auth] 认证信息已清除")
}

// 检查是否已登录
export function isAuthenticated(): boolean {
  const token = getToken()
  const user = getStoredUser()

  const isAuth = token !== null && user !== null

  if (!isAuth) {
    console.warn("[Auth] 认证检查失败:", {
      hasToken: !!token,
      hasUser: !!user,
    })
  }

  return isAuth
}

// 注销用户
export function logout(): void {
  console.log("[Auth] 用户登出")
  clearAuth()
  if (typeof window !== "undefined") {
    window.location.href = "/auth/login"
  }
}
