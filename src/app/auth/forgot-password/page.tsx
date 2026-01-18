"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Copy, Check } from "lucide-react"
import { Input, Button, Label, Card } from "@/components/ui"

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        {/* 返回链接 */}
        <Link
          href="/auth/login"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回登录
        </Link>

        {/* 标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">忘记密码</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {success ? "重置链接已生成" : "输入您的邮箱地址，我们将发送密码重置链接"}
          </p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* 成功状态 */}
        {success ? (
          <div className="space-y-6">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-green-700 dark:text-green-300 text-sm font-medium mb-2">重置链接已生成</p>
                {resetLink && (
                  <div className="mt-3">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={resetLink}
                        readOnly
                        className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 font-mono"
                      />
                      <Button
                        onClick={copyToClipboard}
                        className="px-3 py-2 bg-blue-500 hover:bg-blue-600 flex items-center gap-1.5"
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
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-blue-700 dark:text-blue-300 text-sm">
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
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
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
              <Label htmlFor="email">邮箱地址</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  {...register("email")}
                  type="email"
                  id="email"
                  error={errors.email?.message}
                  className="pl-10"
                  placeholder="请输入您的邮箱地址"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* 提交按钮 */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              {loading ? "发送中..." : "发送重置链接"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}
