export interface AuthUser {
  id: string
  username: string
  email: string
  isActive: boolean
  createdAt: string
  updatedAt: string | null
}

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

// 设置 token 和用户信息
export function setAuth(token: string, user: AuthUser): void {
  if (typeof window === "undefined") return
  localStorage.setItem("token", token)
  localStorage.setItem("user", JSON.stringify(user))
}

// 清除 token 和用户信息
export function clearAuth(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("token")
  localStorage.removeItem("user")
}

// 检查是否已登录
export function isAuthenticated(): boolean {
  return getToken() !== null && getStoredUser() !== null
}

// 注销用户
export function logout(): void {
  clearAuth()
  if (typeof window !== "undefined") {
    window.location.href = "/auth/login"
  }
}
