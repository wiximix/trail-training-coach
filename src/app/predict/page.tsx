"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import AuthGuard from "@/components/AuthGuard"
import DashboardLayout from "@/components/DashboardLayout"
import {
  calculateHourlyEnergyNeeds,
  calculateSupplyDosages,
  type SupplyDosages,
  type HourlyEnergyNeeds,
} from "@/lib/trailAlgorithm"

interface Member {
  id: string
  name: string
  marathonPace?: string
  flatBaselinePace?: string // 平路基准配速P0
  vo2Max?: number // 最大摄氧量（用于计算k）
  crampFrequency?: string
  expectedSweatRate?: string
  preferredSupplyTypes?: string[]
  weight?: number
}

interface Trail {
  id: string
  name: string
  cpCount: number
  checkpoints: Array<{
    id: number
    distance: number
    elevation: number
  }>
}

interface PredictionResult {
  estimatedTime: string
  estimatedPace: string
  flatBaselinePace: string // 平路基准配速P0
  elevationLossCoefficient: number // 爬升损耗系数k（秒/米）
  checkpoints: Array<{
    id: number
    distance: number // 分段距离Di（km）
    elevation: number // 分段爬升Ei（m）
    downhillDistance?: number
    terrainType?: string
    terrainPaceFactor?: number // 地形复杂度系数α
    sectionTime?: number
    estimatedTime: string
    supplyStrategy: string
    accumulatedDistance: number
    sectionSupply?: {
      gels: number
      gelCalories: number
      electrolytePowder: number
      electrolytePowderCalories: number
      electrolytePowderWater: number
      electrolytePowderElectrolytes: number
    }
  }>
  overallSupplyStrategy: string[]
  hourlyEnergyNeeds: {
    carbs: number // 碳水
    water: number // 水
    electrolytes: number // 电解质
  }
  supplyDosages: {
    gelsPerHour: number // 能量胶每小时份数
    saltsPerHour: number // 盐丸每小时份数
    electrolytePowderPerHour: number // 电解质粉每小时份数
  }
  totalEnergyNeeds: {
    carbs: number // 总碳水
    water: number // 总水量
    electrolytes: number // 总电解质
  }
  totalSupplyDosages?: {
    totalGels: number // 总能量胶份数
    totalSalts: number // 总盐丸份数
    totalElectrolytePowder: number // 总电解质粉份数
    totalWater: number // 总水量（ml）
  }
}

export default function PredictPage() {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [trails, setTrails] = useState<Trail[]>([])
  const [loading, setLoading] = useState(true)
  const [predicting, setPredicting] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [sidebarExpanded, setSidebarExpanded] = useState(true) // 侧边栏展开状态

  const [selectedMemberId, setSelectedMemberId] = useState("")
  const [selectedTrailId, setSelectedTrailId] = useState("")
  const [expectedSweatRate, setExpectedSweatRate] = useState("")

  // 补给含量输入
  const [gelCarbs, setGelCarbs] = useState("100")
  const [saltElectrolytes, setSaltElectrolytes] = useState("200")
  const [electrolytePowder, setElectrolytePowder] = useState("300")
  const [electrolytePowderCalories, setElectrolytePowderCalories] = useState("50")
  const [electrolytePowderWater, setElectrolytePowderWater] = useState("500")

  // 动态计算的能量需求和补给份数
  const [dynamicHourlyEnergyNeeds, setDynamicHourlyEnergyNeeds] = useState<HourlyEnergyNeeds | null>(null)
  const [dynamicSupplyDosages, setDynamicSupplyDosages] = useState<SupplyDosages | null>(null)

  // 监听expectedSweatRate变化，动态更新每小时能量需求
  useEffect(() => {
    if (!selectedMemberId) return

    const member = members.find(m => m.id === selectedMemberId)
    if (!member) return

    // 使用当前expectedSweatRate（优先级高于成员默认值）
    const currentSweatRate = expectedSweatRate || member.expectedSweatRate || "有一点"

    // 计算每小时能量需求
    const hourlyNeeds = calculateHourlyEnergyNeeds(currentSweatRate, member.weight)
    setDynamicHourlyEnergyNeeds(hourlyNeeds)
  }, [expectedSweatRate, selectedMemberId, members])

  // 监听补给含量和每小时能量需求变化，动态计算每小时补给份数
  useEffect(() => {
    if (!dynamicHourlyEnergyNeeds) return

    const supplyDosages = calculateSupplyDosages(
      dynamicHourlyEnergyNeeds,
      gelCarbs ? Number(gelCarbs) : undefined,
      saltElectrolytes ? Number(saltElectrolytes) : undefined,
      electrolytePowder ? Number(electrolytePowder) : undefined
    )
    setDynamicSupplyDosages(supplyDosages)
  }, [dynamicHourlyEnergyNeeds, gelCarbs, saltElectrolytes, electrolytePowder])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [membersRes, trailsRes] = await Promise.all([
        fetch("/api/members"),
        fetch("/api/trails"),
      ])

      const membersData = await membersRes.json()
      const trailsData = await trailsRes.json()

      if (membersData.success && trailsData.success) {
        setMembers(membersData.data)
        setTrails(trailsData.data)
      } else {
        setError("加载数据失败")
      }
    } catch (err) {
      setError("网络错误，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  const handlePredict = async () => {
    if (!selectedMemberId || !selectedTrailId) {
      setError("请选择成员和赛道")
      return
    }

    setError("")
    setPredicting(true)
    setResult(null)

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: selectedMemberId,
          trailId: selectedTrailId,
          expectedSweatRate: expectedSweatRate || undefined,
          gelCarbs: gelCarbs ? Number(gelCarbs) : undefined,
          saltElectrolytes: saltElectrolytes ? Number(saltElectrolytes) : undefined,
          electrolytePowder: electrolytePowder ? Number(electrolytePowder) : undefined,
          electrolytePowderCalories: electrolytePowderCalories ? Number(electrolytePowderCalories) : undefined,
          electrolytePowderWater: electrolytePowderWater ? Number(electrolytePowderWater) : undefined,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setResult(data.data)
      } else {
        console.log(data)
        setError(data.error || "预测失败")
      }
    } catch (err) {
      setError("网络错误，请稍后重试")
    } finally {
      setPredicting(false)
    }
  }

  const handleMemberChange = (memberId: string) => {
    setSelectedMemberId(memberId)
    const member = members.find((m) => m.id === memberId)
    if (member?.expectedSweatRate) {
      setExpectedSweatRate(member.expectedSweatRate)
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600 dark:text-gray-400">加载中...</div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 侧边栏 */}
      <aside
        className={`
          fixed left-0 top-0 h-full bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 z-50 overflow-y-auto
          ${sidebarExpanded ? 'w-80' : 'w-0'}
        `}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">预测参数</h2>
            <button
              onClick={() => setSidebarExpanded(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="收起侧边栏"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                选择成员 <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedMemberId}
                onChange={(e) => handleMemberChange(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">请选择成员</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} {member.flatBaselinePace ? `(P0: ${member.flatBaselinePace})` : member.marathonPace ? `(${member.marathonPace})` : ""}
                    {member.vo2Max ? `(VO2Max: ${member.vo2Max} ml/kg/min)` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                选择赛道 <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedTrailId}
                onChange={(e) => setSelectedTrailId(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">请选择赛道</option>
                {trails.map((trail) => {
                  const totalDistance = trail.checkpoints
                    .reduce((sum, cp) => sum + cp.distance, 0)
                    .toFixed(1)
                  const totalElevation = trail.checkpoints
                    .reduce((sum, cp) => sum + cp.elevation, 0)
                    .toFixed(0)
                  return (
                    <option key={trail.id} value={trail.id}>
                      {trail.name} ({totalDistance}km / {totalElevation}m)
                    </option>
                  )
                })}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                比赛日预计出汗量
              </label>
              <select
                value={expectedSweatRate}
                onChange={(e) => setExpectedSweatRate(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">使用成员数据中的默认值</option>
                <option value="有一点">有一点</option>
                <option value="多汗">多汗</option>
                <option value="非常多汗">非常多汗</option>
                <option value="汗流浃背">汗流浃背</option>
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                如果不选择，将使用成员数据中的默认值
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">补给含量（选填）</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                      能量胶碳水含量 (Kcal)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={gelCarbs}
                      onChange={(e) => setGelCarbs(e.target.value)}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white text-sm bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                      盐丸电解质含量 (mg)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={saltElectrolytes}
                      onChange={(e) => setSaltElectrolytes(e.target.value)}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white text-sm bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      placeholder="200"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                      电解质粉电解质含量 (mg)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={electrolytePowder}
                      onChange={(e) => setElectrolytePowder(e.target.value)}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white text-sm bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      placeholder="300"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                      电解质粉热量 (Kcal/份)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={electrolytePowderCalories}
                      onChange={(e) => setElectrolytePowderCalories(e.target.value)}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white text-sm bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                      电解质粉冲水量 (ml/份)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={electrolytePowderWater}
                      onChange={(e) => setElectrolytePowderWater(e.target.value)}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white text-sm bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      placeholder="500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handlePredict}
              disabled={predicting}
              className="w-full rounded-lg bg-purple-600 px-6 py-3 text-white font-medium hover:bg-purple-700 disabled:bg-gray-400"
            >
              {predicting ? "预测中..." : "开始预测"}
            </button>
          </div>
        </div>
      </aside>

      {/* 主内容区域 */}
      <main className={`transition-all duration-300 ${sidebarExpanded ? 'ml-80' : 'ml-0'}`}>
        <div className="p-8">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setSidebarExpanded(!sidebarExpanded)}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
                title={sidebarExpanded ? "收起侧边栏" : "展开侧边栏"}
              >
                {sidebarExpanded ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                )}
              </button>
              <Link href="/" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                ← 返回首页
              </Link>
            </div>
            <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">成绩预测</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              根据跑者的体能数据和赛道信息，智能预测比赛成绩和补给策略
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">{error}</div>
          )}

          {result && (
            <div className="space-y-6">
              <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-md">
                <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">预测结果</h2>

                <div className="mb-6">
                  <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">预计完成时间</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
                      <h4 className="mb-2 font-medium text-gray-900 dark:text-white">预计完赛时间</h4>
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{result.estimatedTime}</p>
                    </div>
                    <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4">
                      <h4 className="mb-2 font-medium text-gray-900 dark:text-white">预计平均配速</h4>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">{result.estimatedPace}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">分钟/KM</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">算法参数</h3>
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">平路基准配速（P0）</h4>
                        <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{result.flatBaselinePace}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">有氧耐力区间的平均配速</p>
                      </div>
                      <div>
                        <h4 className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">爬升损耗系数（k）</h4>
                        <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{result.elevationLossCoefficient}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">秒/米，由VO2Max决定</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <strong>计算公式：</strong> 分段用时 = (分段距离 × P0 + 分段爬升 × k) × 地形复杂度系数
                      </p>
                    </div>
                  </div>
                </div>

                {result.totalEnergyNeeds && (
                  <div className="mb-6">
                    <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">总能量需求</h3>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="rounded-lg bg-orange-100 dark:bg-orange-900/20 p-4">
                        <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">总热量</h4>
                        <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{result.totalEnergyNeeds.carbs}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Kcal</p>
                      </div>
                      <div className="rounded-lg bg-blue-100 dark:bg-blue-900/20 p-4">
                        <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">总水量</h4>
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{result.totalEnergyNeeds.water}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">ml</p>
                      </div>
                      <div className="rounded-lg bg-green-100 dark:bg-green-900/20 p-4">
                        <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">总电解质</h4>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-400">{result.totalEnergyNeeds.electrolytes}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">mg</p>
                      </div>
                    </div>
                    {result.totalSupplyDosages && (
                      <div className="grid grid-cols-4 gap-3">
                        <div className="rounded-lg bg-purple-100 dark:bg-purple-900/20 p-3">
                          <h4 className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-200">能量胶</h4>
                          <p className="text-xl font-bold text-purple-700 dark:text-purple-400">{result.totalSupplyDosages.totalGels}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">支</p>
                        </div>
                        <div className="rounded-lg bg-blue-100 dark:bg-blue-900/20 p-3">
                          <h4 className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-200">水</h4>
                          <p className="text-xl font-bold text-blue-700 dark:text-blue-400">{result.totalSupplyDosages.totalWater}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">ml</p>
                        </div>
                        <div className="rounded-lg bg-teal-100 dark:bg-teal-900/20 p-3">
                          <h4 className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-200">电解质水</h4>
                          <p className="text-xl font-bold text-teal-700 dark:text-teal-400">{result.totalSupplyDosages.totalElectrolytePowder}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">份</p>
                        </div>
                        <div className="rounded-lg bg-pink-100 dark:bg-pink-900/20 p-3">
                          <h4 className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-200">盐丸</h4>
                          <p className="text-xl font-bold text-pink-700 dark:text-pink-400">{result.totalSupplyDosages.totalSalts}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">粒</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 显示动态计算的每小时能量需求 */}
                {(dynamicHourlyEnergyNeeds || result.hourlyEnergyNeeds) && (
                  <div className="mb-6">
                    <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">每小时能量需求</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="rounded-lg bg-orange-50 dark:bg-orange-900/20 p-4">
                        <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">热量</h4>
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{dynamicHourlyEnergyNeeds?.carbs || result.hourlyEnergyNeeds.carbs}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Kcal/小时</p>
                      </div>
                      <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
                        <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">水</h4>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{dynamicHourlyEnergyNeeds?.water || result.hourlyEnergyNeeds.water}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">ml/小时</p>
                      </div>
                      <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4">
                        <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">电解质</h4>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{dynamicHourlyEnergyNeeds?.electrolytes || result.hourlyEnergyNeeds.electrolytes}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">mg/小时</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 显示动态计算的每小时补给份数 */}
                {(dynamicSupplyDosages || result.supplyDosages) && (
                  <div className="mb-6">
                    <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">每小时补给份数</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="rounded-lg bg-purple-50 dark:bg-purple-900/20 p-4">
                        <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">能量胶</h4>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{dynamicSupplyDosages?.gelsPerHour || result.supplyDosages.gelsPerHour}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">支/小时</p>
                      </div>
                      <div className="rounded-lg bg-pink-50 dark:bg-pink-900/20 p-4">
                        <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">盐丸</h4>
                        <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">{dynamicSupplyDosages?.saltsPerHour || result.supplyDosages.saltsPerHour}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">粒/小时</p>
                      </div>
                      <div className="rounded-lg bg-teal-50 dark:bg-teal-900/20 p-4">
                        <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">电解质粉</h4>
                        <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{dynamicSupplyDosages?.electrolytePowderPerHour || result.supplyDosages.electrolytePowderPerHour}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">份/小时</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">补给策略</h3>
                  <ul className="space-y-2">
                    {result.overallSupplyStrategy.map((strategy, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-3"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-yellow-200 dark:bg-yellow-700 text-xs font-medium text-yellow-800 dark:text-yellow-100">
                          {index + 1}
                        </span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{strategy}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">CP点预计时间及补给</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                            CP点
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                            累计距离
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                            分段距离 Di (km)
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                            分段爬升 Ei (m)
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                            下坡
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                            地形类型
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                            地形复杂度系数 α
                          </th>
                          <th
                            className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300 cursor-help"
                            title="计算公式：Ti = (Di × P0 + Ei × k) × α&#10;Ti: 分段用时（分钟）&#10;Di: 分段距离（km）&#10;P0: 平路基准配速（分钟/km）&#10;Ei: 分段爬升（m）&#10;k: 爬升损耗系数（秒/米）&#10;α: 地形复杂度系数"
                          >
                            分段用时(分钟) ⚡
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                            预计时间
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                            补给详情
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                        {result.checkpoints.map((cp) => (
                          <tr key={cp.id}>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                              {cp.supplyStrategy === "补给点" ? (
                                <span className="rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-1 text-blue-800 dark:text-blue-300">
                                  CP{cp.id}（补给）
                                </span>
                              ) : (
                                <span className="text-gray-600 dark:text-gray-400">CP{cp.id}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{cp.accumulatedDistance} km</td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{cp.distance} km</td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{cp.elevation} m</td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{cp.downhillDistance || 0} m</td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{cp.terrainType || "未知"}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{cp.terrainPaceFactor?.toFixed(2) || "1.00"}</td>
                            <td
                              className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 cursor-help"
                              title={`分段用时 = (${cp.distance}km × ${result.flatBaselinePace} + ${cp.elevation}m × ${result.elevationLossCoefficient}s/m ÷ 60s) × ${cp.terrainPaceFactor?.toFixed(2) || "1.00"}`}
                            >
                              {cp.sectionTime?.toFixed(1) || "0.0"}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                              {cp.estimatedTime}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                              {cp.sectionSupply ? (
                                <div className="space-y-1">
                                  {cp.sectionSupply.gels > 0 && (
                                    <div className="text-xs">
                                      <span className="font-medium">{cp.sectionSupply.gels}份能量胶</span>
                                      <span className="text-gray-500 dark:text-gray-400">（{cp.sectionSupply.gelCalories}Kcal）</span>
                                    </div>
                                  )}
                                  {cp.sectionSupply.electrolytePowder > 0 && (
                                    <div className="text-xs">
                                      <span className="font-medium">{cp.sectionSupply.electrolytePowder.toFixed(2)}份电解质</span>
                                      <span className="text-gray-500 dark:text-gray-400">
                                        （{cp.sectionSupply.electrolytePowderCalories}Kcal， {cp.sectionSupply.electrolytePowderWater}ml， {cp.sectionSupply.electrolytePowderElectrolytes}mg）
                                      </span>
                                    </div>
                                  )}
                                  {!cp.sectionSupply.gels && !cp.sectionSupply.electrolytePowder && (
                                    <span className="text-xs text-gray-400 dark:text-gray-500">暂无补给数据</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => {
                      // 保存预测数据到localStorage，跳转到复盘页面
                      const reviewData = {
                        memberId: selectedMemberId,
                        trailId: selectedTrailId,
                        predictedData: result,
                        member: members.find(m => m.id === selectedMemberId),
                        trail: trails.find(t => t.id === selectedTrailId),
                      }
                      localStorage.setItem('pendingReview', JSON.stringify(reviewData))
                      router.push(`/reviews/new`)
                    }}
                    className="w-full rounded-lg bg-purple-600 dark:bg-purple-500 px-6 py-3 text-white font-medium hover:bg-purple-700 dark:hover:bg-purple-600"
                  >
                    开始复盘
                  </button>
                </div>
              </div>
            </div>
          )}

          {!result && (
            <div className="rounded-lg bg-white dark:bg-gray-800 p-12 shadow-md text-center">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400">请在左侧选择预测参数并点击"开始预测"</p>
            </div>
          )}
        </div>
      </main>
    </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
