"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginUserSchema } from "@/storage/database/shared/schema"
import type { LoginUser } from "@/storage/database/shared/schema"
import { Mail, Lock, AlertCircle } from "lucide-react"
import { setAuth } from "@/lib/auth"
import { Input, Button, Label, Card } from "@/components/ui"

function LoginFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginUser>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginUser) => {
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        // 保存 token 和用户信息到 localStorage 和 cookie
        setAuth(result.data.token, result.data.user)

        console.log("[Login] 登录成功，准备跳转")

        // 检查是否有重定向参数
        const redirect = searchParams.get("redirect")
        const targetPath = redirect || "/"

        console.log(`[Login] 跳转到: ${targetPath}`)
        router.push(targetPath)
        router.refresh()
      } else {
        console.error("[Login] 登录失败:", result.message)
        setError(result.message || "登录失败")
      }
    } catch (err) {
      console.error("[Login] 登录请求异常:", err)
      setError("网络错误，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        {/* Logo 和标题 */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">欢迎回来</h1>
          <p className="text-gray-600 dark:text-gray-400">登录越野训练教练，继续训练之旅</p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* 表单 */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 邮箱 */}
          <div>
            <Label htmlFor="email">邮箱地址</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                {...register("email")}
                type="email"
                id="email"
                error={errors.email?.message}
                className="pl-10"
                placeholder="请输入邮箱地址"
                autoComplete="email"
              />
            </div>
          </div>

          {/* 密码 */}
          <div>
            <Label htmlFor="password">密码</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                {...register("password")}
                type="password"
                id="password"
                error={errors.password?.message}
                className="pl-10"
                placeholder="请输入密码"
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* 忘记密码链接 */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="w-4 h-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500" />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">记住我</span>
            </label>
            <Link href="/auth/forgot-password" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              忘记密码？
            </Link>
          </div>

          {/* 提交按钮 */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          >
            {loading ? "登录中..." : "登录"}
          </Button>
        </form>

        {/* 注册链接 */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            还没有账户？{" "}
            <Link
              href="/auth/register"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              立即注册
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}

export default function LoginClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  )
}
