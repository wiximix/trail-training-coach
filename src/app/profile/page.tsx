"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import AuthGuard from "@/components/AuthGuard"
import { getStoredUser, logout, clearAuth } from "@/lib/auth"
import type { AuthUser } from "@/lib/auth"
import { User, Mail, Calendar, LogOut, Lock, ArrowRight, Shield } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = getStoredUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  const handleLogout = () => {
    clearAuth()
    router.push("/auth/login")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* 顶部导航 */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link
                  href="/"
                  className="flex items-center text-gray-900 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-8 h-8 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="font-bold text-xl">越野训练教练</span>
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  返回首页
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* 主要内容 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">个人中心</h1>
            <p className="mt-2 text-gray-600">管理您的账户和偏好设置</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 用户信息卡片 */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">账户信息</h2>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    编辑资料
                  </button>
                </div>

                {/* 用户头像 */}
                <div className="flex items-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <div className="ml-6">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {user?.username}
                    </h3>
                    <p className="text-gray-600">{user?.email}</p>
                  </div>
                </div>

                {/* 详细信息 */}
                <div className="space-y-4">
                  <div className="flex items-start">
                    <User className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">用户名</p>
                      <p className="text-gray-600">{user?.username}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">邮箱地址</p>
                      <p className="text-gray-600">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">注册时间</p>
                      <p className="text-gray-600">
                        {user?.createdAt ? formatDate(user.createdAt) : "未知"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">账户状态</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        活跃
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 侧边栏操作 */}
            <div className="space-y-6">
              {/* 快速操作 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">快速操作</h2>

                <div className="space-y-3">
                  <Link
                    href="/members"
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-900">管理成员</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </Link>

                  <Link
                    href="/trails"
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                      </div>
                      <span className="font-medium text-gray-900">管理赛道</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </Link>

                  <Link
                    href="/predict"
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <span className="font-medium text-gray-900">成绩预测</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </Link>

                  <Link
                    href="/reviews"
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <span className="font-medium text-gray-900">训练复盘</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </Link>
                </div>
              </div>

              {/* 安全设置 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">安全设置</h2>

                <div className="space-y-3">
                  <Link
                    href="/auth/reset-password"
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Lock className="w-5 h-5 text-gray-600 mr-3" />
                    <span className="font-medium text-gray-900">修改密码</span>
                  </Link>
                </div>
              </div>

              {/* 登出按钮 */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center p-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-2" />
                退出登录
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
