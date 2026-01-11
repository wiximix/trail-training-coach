"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Copy, Check } from "lucide-react"

const forgotPasswordSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [resetLink, setResetLink] = useState("")
  const [copied, setCopied] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        if (result.data?.resetLink) {
          setResetLink(result.data.resetLink)
        }
      } else {
        setError(result.message || "发送失败")
      }
    } catch (err) {
      setError("网络错误，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(resetLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      setError("复制失败，请手动复制链接")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* 返回链接 */}
        <Link
          href="/auth/login"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回登录
        </Link>

        {/* 标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">忘记密码</h1>
          <p className="text-gray-600">
            {success ? "重置链接已生成" : "输入您的邮箱地址，我们将发送密码重置链接"}
          </p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* 成功状态 */}
        {success ? (
          <div className="space-y-6">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-green-700 text-sm font-medium mb-2">重置链接已生成</p>
                {resetLink && (
                  <div className="mt-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={resetLink}
                        readOnly
                        className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg font-mono"
                      />
                      <button
                        onClick={copyToClipboard}
                        className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1.5"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            已复制
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            复制
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-700 text-sm">
                <strong>提示：</strong>在实际应用中，这个链接会通过邮件发送到您的邮箱。
                演示模式下，您可以点击下方链接直接重置密码。
              </p>
            </div>

            {resetLink && (
              <Link
                href={resetLink}
                className="block w-full text-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md"
              >
                前往重置密码
              </Link>
            )}

            <div className="text-center">
              <Link
                href="/auth/login"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                返回登录
              </Link>
            </div>
          </div>
        ) : (
          /* 表单 */
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 邮箱 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                邮箱地址
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register("email")}
                  type="email"
                  id="email"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
                    errors.email
                      ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                  }`}
                  placeholder="请输入您的邮箱地址"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              {loading ? "发送中..." : "发送重置链接"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
