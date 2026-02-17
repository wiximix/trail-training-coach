"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getToken, getStoredUser } from "@/lib/auth"
import { logger } from "@/lib/logger"

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const router = useRouter()

  useEffect(() => {
    const token = getToken()
    const user = getStoredUser()

    logger.debug("[AuthGuard] 认证检查", {
      hasToken: !!token,
      hasUser: !!user,
      userId: user?.id,
    })

    if (!token || !user) {
      logger.warn("[AuthGuard] 未认证，重定向到登录页")
      router.push("/auth/login")
    } else {
      logger.debug("[AuthGuard] 认证通过")
    }
  }, [router])

  // 检查是否已登录
  const token = getToken()
  const user = getStoredUser()

  if (!token || !user) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">验证身份中...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
