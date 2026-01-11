"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import AuthGuard from "@/components/AuthGuard"
import DashboardLayout from "@/components/DashboardLayout"
import { ArrowRight, Calendar, Clock, TrendingUp, Plus, Search } from "lucide-react"

interface Review {
  id: string
  memberId: string
  memberName?: string
  trailId: string
  trailName?: string
  trainingDate: string
  predictedTime: string
  actualTime: string
  createdAt: string
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/reviews")
      const data = await response.json()

      if (data.success) {
        setReviews(data.data)
      } else {
        setError(data.error || "获取复盘记录失败")
      }
    } catch (err) {
      setError("网络错误，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return "-"
    return timeString
  }

  const calculatePerformance = (predicted: string, actual: string) => {
    if (!predicted || !actual) return null

    // 转换时间为分钟
    const parseTime = (time: string): number => {
      const parts = time.split(":")
      if (parts.length === 2) {
        return parseInt(parts[0]) * 60 + parseInt(parts[1])
      } else if (parts.length === 3) {
        return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2])
      }
      return 0
    }

    const predictedMinutes = parseTime(predicted)
    const actualMinutes = parseTime(actual)

    if (predictedMinutes === 0) return null

    const difference = actualMinutes - predictedMinutes
    const percentage = (difference / predictedMinutes) * 100

    return {
      difference,
      percentage,
      isFaster: difference < 0,
    }
  }

  // 过滤复盘记录
  const filteredReviews = reviews.filter((review) => {
    const query = searchQuery.toLowerCase()
    return (
      review.memberName?.toLowerCase().includes(query) ||
      review.trailName?.toLowerCase().includes(query) ||
      review.id.toLowerCase().includes(query)
    )
  })

  if (loading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600">加载中...</div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          {/* 页面标题和操作按钮 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">训练复盘</h1>
              <p className="mt-1 text-sm text-gray-600">
                查看和分析训练复盘记录
              </p>
            </div>
            <Link
              href="/reviews/new"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              新建复盘
            </Link>
          </div>

          {/* 搜索栏 */}
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索复盘记录（成员名称、赛道名称...）"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-600">{error}</div>
          )}

          {/* 复盘记录列表 */}
          {filteredReviews.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                {searchQuery ? "未找到匹配的复盘记录" : "暂无复盘记录"}
              </h3>
              <p className="mb-6 text-sm text-gray-600">
                {searchQuery
                  ? "请尝试其他搜索关键词"
                  : "开始创建你的第一个复盘记录"}
              </p>
              {!searchQuery && (
                <Link
                  href="/reviews/new"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  创建复盘
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => {
                const performance = calculatePerformance(
                  review.predictedTime,
                  review.actualTime
                )

                return (
                  <Link
                    key={review.id}
                    href={`/reviews/${review.id}`}
                    className="group block rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {review.memberName || "未知成员"} - {review.trailName || "未知赛道"}
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(review.trainingDate)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            <span>实际用时: {formatTime(review.actualTime)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        {performance && (
                          <div className="text-right">
                            <div className="text-sm text-gray-600">对比预测</div>
                            <div
                              className={`flex items-center gap-1 text-sm font-medium ${
                                performance.isFaster
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              <TrendingUp className="h-4 w-4" />
                              <span>
                                {performance.isFaster ? "快" : "慢"}{" "}
                                {Math.abs(percentage).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        )}
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
