"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import AuthGuard from "@/components/features/auth/AuthGuard"
import DashboardLayout from "@/components/features/layout/DashboardLayout"
import { ArrowLeft, Clock, TrendingUp, Calendar, Activity, Droplets, Flame } from "lucide-react"

interface ReviewDetail {
  id: string
  memberId: string
  memberName?: string
  trailId: string
  trailName?: string
  trainingDate: string
  predictedTime: string
  actualTime: string
  predictedPace: string
  predictedCheckpoints: any[]
  actualCheckpoints: any[]
  predictedHourlyEnergyNeeds: {
    carbs: number
    water: number
    electrolytes: number
  }
  predictedSupplyDosages: {
    gelsPerHour: number
    saltsPerHour: number
    electrolytePowderPerHour: number
  }
  totalWaterIntake?: number
  totalCaloriesIntake?: number
  totalElectrolytesIntake?: number
  notes?: string
  createdAt: string
}

export default function ReviewDetailPage() {
  const params = useParams()
  const reviewId = params.id as string

  const [review, setReview] = useState<ReviewDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchReviewDetail()
  }, [reviewId])

  const fetchReviewDetail = async () => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`)
      const data = await response.json()

      if (data.success) {
        setReview(data.data)
      } else {
        setError(data.error || "获取复盘详情失败")
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

  const calculatePerformance = (predicted: string, actual: string) => {
    if (!predicted || !actual) return null

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

  if (error || !review) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="space-y-6">
            <div>
              <Link href="/reviews" className="text-blue-600 hover:text-blue-700">
                ← 返回复盘列表
              </Link>
            </div>
            <div className="rounded-lg bg-red-50 p-6 text-red-600">
              {error || "未找到复盘记录"}
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  const performance = calculatePerformance(review.predictedTime, review.actualTime)

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          {/* 面包屑导航 */}
          <div>
            <Link href="/reviews" className="text-blue-600 hover:text-blue-700">
              ← 返回复盘列表
            </Link>
          </div>

          {/* 标题 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {review.memberName || "未知成员"} - {review.trailName || "未知赛道"}
              </h1>
              <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(review.trainingDate)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>实际用时: {review.actualTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 预测 vs 实际对比 */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-2 text-sm font-medium text-gray-600">预测完赛时间</div>
              <div className="text-2xl font-bold text-blue-600">{review.predictedTime}</div>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-2 text-sm font-medium text-gray-600">实际完赛时间</div>
              <div className="text-2xl font-bold text-green-600">{review.actualTime}</div>
            </div>
            {performance && (
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-2 text-sm font-medium text-gray-600">对比预测</div>
                <div
                  className={`flex items-center gap-1 text-2xl font-bold ${
                    performance.isFaster ? "text-green-600" : "text-red-600"
                  }`}
                >
                  <TrendingUp className="h-6 w-6" />
                  <span>
                    {performance.isFaster ? "快" : "慢"}{" "}
                    {Math.abs(performance.percentage).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 实际补给情况 */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">实际补给情况</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Droplets className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">总水量</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {review.totalWaterIntake ? `${review.totalWaterIntake} ml` : "未记录"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                  <Flame className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">总热量</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {review.totalCaloriesIntake ? `${review.totalCaloriesIntake} kcal` : "未记录"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">总电解质</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {review.totalElectrolytesIntake ? `${review.totalElectrolytesIntake} mg` : "未记录"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CP点数据对比 */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">CP点数据对比</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                      CP点
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                      预测时间
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                      实际时间
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                      平均心率
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                      最高心率
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {review.actualCheckpoints?.map((cp, index) => (
                    <tr key={cp.id} className="border-b border-gray-100">
                      <td className="px-4 py-3 text-sm text-gray-900">CP {cp.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {review.predictedCheckpoints[index]?.estimatedTime || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {cp.actualTime || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {cp.averageHeartRate ? `${cp.averageHeartRate} bpm` : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {cp.maxHeartRate ? `${cp.maxHeartRate} bpm` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 备注 */}
          {review.notes && (
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">备注</h2>
              <p className="text-sm text-gray-600">{review.notes}</p>
            </div>
          )}

          {/* 预测补给策略 */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">预测补给策略</h2>
            <div className="space-y-4">
              <div>
                <div className="mb-2 text-sm font-medium text-gray-700">每小时能量需求</div>
                <div className="grid gap-2 md:grid-cols-3 text-sm">
                  <div className="rounded bg-gray-50 p-3">
                    <div className="text-gray-600">碳水</div>
                    <div className="font-semibold">
                      {review.predictedHourlyEnergyNeeds.carbs} g
                    </div>
                  </div>
                  <div className="rounded bg-gray-50 p-3">
                    <div className="text-gray-600">水</div>
                    <div className="font-semibold">
                      {review.predictedHourlyEnergyNeeds.water} ml
                    </div>
                  </div>
                  <div className="rounded bg-gray-50 p-3">
                    <div className="text-gray-600">电解质</div>
                    <div className="font-semibold">
                      {review.predictedHourlyEnergyNeeds.electrolytes} mg
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="mb-2 text-sm font-medium text-gray-700">每小时补给份数</div>
                <div className="grid gap-2 md:grid-cols-3 text-sm">
                  <div className="rounded bg-blue-50 p-3">
                    <div className="text-blue-600">能量胶</div>
                    <div className="font-semibold text-blue-900">
                      {review.predictedSupplyDosages.gelsPerHour} 份
                    </div>
                  </div>
                  <div className="rounded bg-green-50 p-3">
                    <div className="text-green-600">盐丸</div>
                    <div className="font-semibold text-green-900">
                      {review.predictedSupplyDosages.saltsPerHour} 份
                    </div>
                  </div>
                  <div className="rounded bg-purple-50 p-3">
                    <div className="text-purple-600">电解质粉</div>
                    <div className="font-semibold text-purple-900">
                      {review.predictedSupplyDosages.electrolytePowderPerHour} 份
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
