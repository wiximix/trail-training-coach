"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import AuthGuard from "@/components/features/auth/AuthGuard"
import DashboardLayout from "@/components/features/layout/DashboardLayout"

interface Member {
  id: string
  name: string
  restingHeartRate?: number
  maxHeartRate?: number
}

interface Trail {
  id: string
  name: string
}

interface PredictionResult {
  estimatedTime: string
  estimatedPace: string
  checkpoints: any[]
  overallSupplyStrategy: string[]
  hourlyEnergyNeeds: any
  supplyDosages: any
  totalEnergyNeeds: any
}

export default function NewReviewPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [member, setMember] = useState<Member | null>(null)
  const [trail, setTrail] = useState<Trail | null>(null)
  const [predictedData, setPredictedData] = useState<PredictionResult | null>(null)

  // 训练日期
  const [trainingDate, setTrainingDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  // CP点实际数据
  const [checkpointActuals, setCheckpointActuals] = useState<
    Array<{
      id: number
      actualTime: string
      averageHeartRate?: number
      maxHeartRate?: number
      waterIntake?: number
      caloriesIntake?: number
      electrolytesIntake?: number
      notes?: string
    }>
  >([])

  // 总补给情况
  const [totalWaterIntake, setTotalWaterIntake] = useState("")
  const [totalCaloriesIntake, setTotalCaloriesIntake] = useState("")
  const [totalElectrolytesIntake, setTotalElectrolytesIntake] = useState("")
  const [notes, setNotes] = useState("")

  // 心率区间颜色
  function getHeartRateZoneColor(
    heartRate: number,
    restingHeartRate: number,
    maxHeartRate: number
  ): string {
    const hrr = maxHeartRate - restingHeartRate
    const currentHRR = (heartRate - restingHeartRate) / hrr

    if (currentHRR < 0.5) return "bg-gray-100 text-gray-800"
    if (currentHRR < 0.6) return "bg-gray-200 text-gray-800"
    if (currentHRR < 0.7) return "bg-green-100 text-green-800"
    if (currentHRR < 0.8) return "bg-blue-100 text-blue-800"
    if (currentHRR < 0.9) return "bg-orange-100 text-orange-800"
    return "bg-red-100 text-red-800"
  }

  useEffect(() => {
    loadPendingReview()
  }, [])

  const loadPendingReview = () => {
    const pendingReviewStr = localStorage.getItem('pendingReview')
    if (pendingReviewStr) {
      const pendingReview = JSON.parse(pendingReviewStr)
      setMember(pendingReview.member)
      setTrail(pendingReview.trail)
      setPredictedData(pendingReview.predictedData)

      // 初始化CP点实际数据
      const actuals = pendingReview.predictedData.checkpoints.map((cp: any) => ({
        id: cp.id,
        actualTime: "",
      }))
      setCheckpointActuals(actuals)
    }
    setLoading(false)
  }

  const handleCheckpointChange = (
    id: number,
    field: string,
    value: string | number | undefined
  ) => {
    setCheckpointActuals((prev) =>
      prev.map((cp) => (cp.id === id ? { ...cp, [field]: value } : cp))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!member || !trail || !predictedData) {
      setError("数据不完整")
      return
    }

    setError("")
    setSaving(true)

    try {
      const payload = {
        memberId: member.id,
        trailId: trail.id,
        trainingDate: new Date(trainingDate).toISOString(),
        predictedTime: predictedData.estimatedTime,
        predictedPace: predictedData.estimatedPace,
        predictedCheckpoints: predictedData.checkpoints,
        predictedHourlyEnergyNeeds: predictedData.hourlyEnergyNeeds,
        predictedSupplyDosages: predictedData.supplyDosages,
        actualTime: checkpointActuals[checkpointActuals.length - 1]?.actualTime,
        actualCheckpoints: checkpointActuals,
        totalWaterIntake: totalWaterIntake ? Number(totalWaterIntake) : null,
        totalCaloriesIntake: totalCaloriesIntake ? Number(totalCaloriesIntake) : null,
        totalElectrolytesIntake: totalElectrolytesIntake ? Number(totalElectrolytesIntake) : null,
        notes,
      }

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (data.success) {
        localStorage.removeItem('pendingReview')
        router.push("/reviews")
      } else {
        setError(data.error || "保存复盘记录失败")
      }
    } catch (err) {
      setError("网络错误，请稍后重试")
    } finally {
      setSaving(false)
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

  if (!member || !trail || !predictedData) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="space-y-6">
            <div>
              <Link href="/predict" className="text-blue-600 hover:text-blue-700">
                ← 返回成绩预测
              </Link>
            </div>
            <div className="rounded-lg bg-red-50 p-6 text-center text-red-600">
              未找到预测数据，请先进行成绩预测
            </div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <Link href="/predict" className="text-blue-600 hover:text-blue-700">
              ← 返回成绩预测
            </Link>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">创建复盘记录</h1>
          </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">基本信息</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  训练日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={trainingDate}
                  onChange={(e) => setTrainingDate(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  成员
                </label>
                <input
                  type="text"
                  value={member.name}
                  disabled
                  className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-gray-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  赛道
                </label>
                <input
                  type="text"
                  value={trail.name}
                  disabled
                  className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* 预测 vs 实际对比 */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">预测 vs 实际对比</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-blue-50 p-4">
                <h3 className="mb-2 font-medium text-gray-900">预测完赛时间</h3>
                <p className="text-2xl font-bold text-blue-600">{predictedData.estimatedTime}</p>
              </div>
              <div className="rounded-lg bg-green-50 p-4">
                <h3 className="mb-2 font-medium text-gray-900">预测平均配速</h3>
                <p className="text-2xl font-bold text-green-600">{predictedData.estimatedPace}</p>
              </div>
            </div>
          </div>

          {/* CP点实际数据 */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              CP点实际数据
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      CP点
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      预计时间
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      实际时间
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      平均心率 (bpm)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      最大心率 (bpm)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      补水量 (ml)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      热量 (Kcal)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      电解质 (mg)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {predictedData.checkpoints.map((cp) => {
                    const actual = checkpointActuals.find((a) => a.id === cp.id) || {
                      id: cp.id,
                      actualTime: "",
                      averageHeartRate: undefined,
                      maxHeartRate: undefined,
                      waterIntake: undefined,
                      caloriesIntake: undefined,
                      electrolytesIntake: undefined,
                    }

                    return (
                      <tr key={cp.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          CP{cp.id}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {cp.estimatedTime}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="time"
                            step="1"
                            value={actual.actualTime}
                            onChange={(e) =>
                              handleCheckpointChange(cp.id, "actualTime", e.target.value)
                            }
                            className="w-32 rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            placeholder="-"
                            value={actual.averageHeartRate || ""}
                            onChange={(e) =>
                              handleCheckpointChange(
                                cp.id,
                                "averageHeartRate",
                                e.target.value ? Number(e.target.value) : undefined
                              )
                            }
                            className={`w-24 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
                              actual.averageHeartRate &&
                              member.restingHeartRate &&
                              member.maxHeartRate
                                ? getHeartRateZoneColor(
                                    actual.averageHeartRate,
                                    member.restingHeartRate,
                                    member.maxHeartRate
                                  )
                                : "text-gray-900"
                            }`}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            placeholder="-"
                            value={actual.maxHeartRate || ""}
                            onChange={(e) =>
                              handleCheckpointChange(
                                cp.id,
                                "maxHeartRate",
                                e.target.value ? Number(e.target.value) : undefined
                              )
                            }
                            className={`w-24 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
                              actual.maxHeartRate &&
                              member.restingHeartRate &&
                              member.maxHeartRate
                                ? getHeartRateZoneColor(
                                    actual.maxHeartRate,
                                    member.restingHeartRate,
                                    member.maxHeartRate
                                  )
                                : "text-gray-900"
                            }`}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            placeholder="-"
                            value={actual.waterIntake || ""}
                            onChange={(e) =>
                              handleCheckpointChange(
                                cp.id,
                                "waterIntake",
                                e.target.value ? Number(e.target.value) : undefined
                              )
                            }
                            className="w-24 rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            placeholder="-"
                            value={actual.caloriesIntake || ""}
                            onChange={(e) =>
                              handleCheckpointChange(
                                cp.id,
                                "caloriesIntake",
                                e.target.value ? Number(e.target.value) : undefined
                              )
                            }
                            className="w-24 rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            placeholder="-"
                            value={actual.electrolytesIntake || ""}
                            onChange={(e) =>
                              handleCheckpointChange(
                                cp.id,
                                "electrolytesIntake",
                                e.target.value ? Number(e.target.value) : undefined
                              )
                            }
                            className="w-24 rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 总补给情况 */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">总补给情况</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  总补水量 (ml)
                </label>
                <input
                  type="number"
                  placeholder="自动计算或手动输入"
                  value={totalWaterIntake}
                  onChange={(e) => setTotalWaterIntake(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  总热量摄入 (Kcal)
                </label>
                <input
                  type="number"
                  placeholder="自动计算或手动输入"
                  value={totalCaloriesIntake}
                  onChange={(e) => setTotalCaloriesIntake(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  总电解质摄入 (mg)
                </label>
                <input
                  type="number"
                  placeholder="自动计算或手动输入"
                  value={totalElectrolytesIntake}
                  onChange={(e) => setTotalElectrolytesIntake(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            {predictedData.totalEnergyNeeds && (
              <div className="mt-4 rounded-lg bg-gray-50 p-4">
                <h3 className="mb-2 text-sm font-medium text-gray-700">预测总需求</h3>
                <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
                  <div>热量: {predictedData.totalEnergyNeeds.carbs} Kcal</div>
                  <div>水: {predictedData.totalEnergyNeeds.water} ml</div>
                  <div>电解质: {predictedData.totalEnergyNeeds.electrolytes} mg</div>
                </div>
              </div>
            )}
          </div>

          {/* 备注 */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">备注</h2>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              placeholder="记录比赛中的感受、遇到的问题、改进建议等..."
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 disabled:bg-gray-400"
            >
              {saving ? "保存中..." : "保存复盘"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/predict")}
              className="flex-1 rounded-lg bg-gray-100 px-6 py-3 font-medium text-gray-700 hover:bg-gray-200"
            >
              取消
            </button>
          </div>
        </form>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
