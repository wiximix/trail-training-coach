/**
 * 认证相关的自定义 Hooks
 */

import { useState, useEffect, useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"
import { login as loginApi } from "@/services/authService"
import {
  getToken,
  setAuth,
  clearAuth,
  getStoredUser,
  isAuthenticated as checkIsAuthenticated,
} from "@/lib/auth"
import type { AuthUser, LoginRequest } from "@/types"

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const storedUser = getStoredUser()
    setUser(storedUser)
    setLoading(false)
  }, [])

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      const response = await loginApi(credentials)
      if (response.success && response.data) {
        setAuth(response.data.token, response.data.user)
        setUser(response.data.user)
        return response.data.user
      } else {
        throw new Error(response.error || "登录失败")
      }
    } catch (err) {
      throw err
    }
  }, [])

  const logout = useCallback(() => {
    clearAuth()
    setUser(null)
    router.push("/auth/login")
  }, [router])

  const isAuthenticated = checkIsAuthenticated()

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
  }
}

export function useRequireAuth() {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [loading, isAuthenticated, router, pathname])

  return { user, loading, isAuthenticated }
}
